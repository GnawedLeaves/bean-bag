import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { auth, db } from "../firebase/firebase";
import { SpotifyAuthToken } from "../types/spotifyTypes";
import { getSpotifyAuthToken } from "../services/spotify/authSpotify";

interface UserData {
  id: string;
  name: string;
  email: string;
  partnerId: string;
  displayPicture: string;
}

interface UserContextType {
  user: UserData | null;
  userPartner: UserData | null;
  spotifyToken: SpotifyAuthToken | null;
  loading: boolean;
  getUserContextData: () => void;
}

const UserContext = createContext<UserContextType>({
  user: null,
  userPartner: null,
  spotifyToken: null,
  loading: true,
  getUserContextData: () => {},
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [userPartner, setUserPartner] = useState<UserData | null>(null);
  const [spotifyToken, setSpotifyToken] = useState<SpotifyAuthToken | null>(
    null
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
            where("authId", "==", firebaseUser.uid)
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
                userData.partnerId
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

  return (
    <UserContext.Provider
      value={{ user, userPartner, spotifyToken, loading, getUserContextData }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
