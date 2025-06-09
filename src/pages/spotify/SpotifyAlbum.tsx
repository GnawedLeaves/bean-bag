import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { SpotifyAlbum } from "../../types/spotifyTypes";
import { useUser } from "../../contexts/UserContext";
import { getSpotifyAlbum } from "../../services/spotify/spotify";

const SpotifyAlbumPage = () => {
  const { albumId } = useParams();
  const { user, spotifyToken, loading } = useUser();

  const [albumDetails, setAlbumDetails] = useState<SpotifyAlbum>();
  const handleGetAlbumDetails = async () => {
    if (!albumId || !spotifyToken?.accessToken) return;
    const response = await getSpotifyAlbum(albumId, spotifyToken?.accessToken);
    console.log({ response });
    setAlbumDetails(response);
  };

  useEffect(() => {
    if (!loading) {
      handleGetAlbumDetails();
    }
  }, [loading]);
  return (
    <>
      <h1>Album</h1>
      {albumDetails?.name}

      <img style={{ width: "100%" }} src={albumDetails?.images[0].url} />
      <button>
        <a href={albumDetails?.external_urls.spotify}>Click to play</a>
      </button>
      <div>{albumDetails?.release_date}</div>
      <div>{albumDetails?.artists[0].name}</div>
      <div>{albumDetails?.artists[0].href}</div>

      <div>{albumDetails?.release_date}</div>
    </>
  );
};

export default SpotifyAlbumPage;
