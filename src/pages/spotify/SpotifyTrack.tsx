import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { SpotifyTrack } from "../../types/spotifyTypes";
import { useUser } from "../../contexts/UserContext";
import { getSpotifyTrack } from "../../services/spotify/spotify";

const SpotifyTrackPage = () => {
  const { trackId } = useParams();
  const { user, spotifyToken, loading } = useUser();

  const [trackDetails, setTrackDetails] = useState<SpotifyTrack>();
  const handleGetTrackDetails = async () => {
    if (!trackId || !spotifyToken?.accessToken) return;
    const response = await getSpotifyTrack(trackId, spotifyToken?.accessToken);
    setTrackDetails(response);
  };

  useEffect(() => {
    if (!loading) {
      handleGetTrackDetails();
    }
  }, [loading]);
  return (
    <>
      {trackDetails?.name}

      {trackDetails?.duration_ms}
      <img style={{ width: "100%" }} src={trackDetails?.album.images[0].url} />

      <button>
        <a href={trackDetails?.external_urls.spotify}>Click to play</a>
      </button>
      {trackDetails?.name}
      {trackDetails?.name}
    </>
  );
};

export default SpotifyTrackPage;
