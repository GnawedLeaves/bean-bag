import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";
import { SpotifyAuthToken } from "../types/spotifyTypes";
import { getSpotifyAuthToken } from "../services/spotify/authSpotify";

interface UserData {
  id: string;
  name: string;
  email: string;
  // Add other fields from anniAppUsers
}

interface UserContextType {
  user: UserData | null;
  spotifyToken: SpotifyAuthToken | null;
  loading: boolean;
}

const UserContext = createContext<UserContextType>({
  user: null,
  spotifyToken: null,
  loading: true,
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [spotifyToken, setSpotifyToken] = useState<SpotifyAuthToken | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        try {
          const q = query(
            collection(db, "anniAppUsers"),
            where("authId", "==", firebaseUser.uid)
          );
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            setUser({ id: userDoc.id, ...userDoc.data() } as UserData);
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
  }, []);

  return (
    <UserContext.Provider value={{ user, spotifyToken, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
