import { useEffect } from "react";
import { getTop5Songs } from "../../services/spotify/spotify";
import { useUser } from "../../contexts/UserContext";

const SpotifyPage = () => {
  const { user, spotifyToken, loading } = useUser();
  console.log({ spotifyToken });
  console.log({ user });

  const handleGetTop5Songs = async () => {
    const response = await getTop5Songs();
  };

  useEffect(() => {
    handleGetTop5Songs();
  }, []);
  return (
    <>
      Spotify token: {spotifyToken?.accessToken}
      <div>user: {user?.name}</div>
    </>
  );
};

export default SpotifyPage;
