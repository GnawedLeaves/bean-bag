import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  GeoPoint,
  getDoc,
  getDocs,
  query,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import { auth, db } from "../firebase/firebase";
import { useLocationHook } from "../hooks/useLocation";
import { getSpotifyAuthToken } from "../services/spotify/authSpotify";
import { exchangeCodeForToken } from "../services/spotify/spotify";
import { SpotifyAuthToken } from "../types/spotifyTypes";
interface UserData {
  id: string;
  name: string;
  email: string;
  partnerId: string;
  displayPicture: string;
  lastUpdated: Timestamp;
  location: GeoPoint;
  status: string;
}

interface UserContextType {
  user: UserData | null;
  userPartner: UserData | null;
  spotifyToken: SpotifyAuthToken | null;
  loading: boolean;
  getUserContextData: () => void;
  setSpotifyToken: Dispatch<SetStateAction<SpotifyAuthToken | null>>;
  disconnectSpotify: () => void;
}

const UserContext = createContext<UserContextType>({
  user: null,
  userPartner: null,
  spotifyToken: null,
  loading: true,
  getUserContextData: () => { },
  setSpotifyToken: () => { },
  disconnectSpotify: () => { },
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const {
    location,
    loading: locationLoading,
    error: locationError,
  } = useLocationHook();
  const [user, setUser] = useState<UserData | null>(null);
  const [userPartner, setUserPartner] = useState<UserData | null>(null);
  const [spotifyToken, setSpotifyToken] = useState<SpotifyAuthToken | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [flag, setFlag] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        try {
          const q = query(
            collection(db, "anniAppUsers"),
            where("authId", "==", firebaseUser.uid),
          );
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data();
            setUser({ id: userDoc.id, ...userData } as UserData);

            //get partner
            const userDocRef = doc(db, "anniAppUsers", userData.partnerId);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
              setUserPartner({
                id: userDocSnap.id,
                ...userDocSnap.data(),
              } as UserData);
            } else {
              console.error(
                "No such document with partnerId:",
                userData.partnerId,
              );
            }
          }
        } catch (err) {
          console.error("Failed to fetch user or Spotify token:", err);
        }

        try {
          const spotifyTokenResponse = await getSpotifyAuthToken();
          setSpotifyToken(spotifyTokenResponse);
        } catch (e) {
          console.error("Failed to fetch spotify token", e);
        }
      } else {
        setUser(null);
        setSpotifyToken(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [flag]);

  const getUserContextData = () => {
    setFlag(!flag);
  };

  useEffect(() => {
    if (user && location) {
      updateLocation();
    }
  }, [user, location]);

  const updateLocation = async () => {
    if (!location || !user) return;

    try {
      const geoPoint = new GeoPoint(location.latitude, location.longitude);
      const userRef = doc(db, "anniAppUsers", user.id);

      await updateDoc(userRef, {
        location: geoPoint,
        lastUpdated: Timestamp.now(),
      });
    } catch (e) {
      console.error("error updating location in user context", e);
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const error = urlParams.get("error");

    // Handle Spotify auth errors
    if (error) {
      console.error("Spotify authorization error:", error);
      window.alert(`Spotify authorization failed: ${error}`);
      return;
    }

    if (!code) return;

    const processSpotifyAuth = async (authCode: string) => {
      try {
        console.log("Starting token exchange with code:", authCode);
        const tokenData = await exchangeCodeForToken(authCode);

        if (!tokenData || !tokenData.access_token) {
          throw new Error("No access token received from Spotify");
        }

        console.log("Token data received:", tokenData);

        localStorage.setItem("spotify_access_token", tokenData.access_token);
        localStorage.setItem("spotify_refresh_token", tokenData.refresh_token);
        localStorage.setItem(
          "spotify_token_expiry",
          String(Date.now() + tokenData.expires_in * 1000),
        );

        console.log("Tokens saved to localStorage:", {
          access: localStorage.getItem("spotify_access_token"),
          refresh: localStorage.getItem("spotify_refresh_token"),
          expiry: localStorage.getItem("spotify_token_expiry"),
        });

        setSpotifyToken({
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token,
          expiresIn: tokenData.expires_in,
        });

        window.alert("Spotify connected successfully!");
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (err) {
        console.error("Spotify auth failed:", err);
        window.alert(`Spotify connection failed: ${err instanceof Error ? err.message : "Unknown error"}`);
      }
    };

    processSpotifyAuth(code);
  }, []); // Keep empty array - runs once on mount

  const disconnectSpotify = () => {
    localStorage.removeItem("spotify_access_token");
    localStorage.removeItem("spotify_refresh_token");
    localStorage.removeItem("spotify_token_expiry");
    setSpotifyToken(null);
    window.alert("Spotify disconnected");
  };

  return (
    <UserContext.Provider
      value={{
        user,
        userPartner,
        spotifyToken,
        loading,
        getUserContextData,
        setSpotifyToken,
        disconnectSpotify,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
