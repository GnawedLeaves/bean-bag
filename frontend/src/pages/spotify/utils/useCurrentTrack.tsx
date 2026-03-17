import { useEffect, useState } from "react";
import {
  getCurrentlyPlaying,
  getValidAccessToken,
} from "../../../services/spotify/spotify";
import { SpotifyCurrentPlaying } from "../../../types/spotifyTypes";

const useCurrentTrack = (accessToken: string | null) => {
  const [currentPlaying, setCurrentPlaying] =
    useState<SpotifyCurrentPlaying | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;

    const fetchNowPlaying = async () => {
      try {
        setIsLoading(true);
        const token = await getValidAccessToken();
        const data = await getCurrentlyPlaying(token);
        if (data?.item) {
          setCurrentPlaying(data);
          setError(null);
        } else {
          setCurrentPlaying(null);
        }
      } catch (err: any) {
        if (err.response?.status === 401) {
          // Token refresh itself failed — user needs to re-authenticate
          localStorage.removeItem("spotify_access_token");
          localStorage.removeItem("spotify_refresh_token");
          localStorage.removeItem("spotify_token_expiry");
          setError("Authentication failed. Please reconnect Spotify.");
        } else {
          setError("Failed to fetch current track");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchNowPlaying();
    const interval = setInterval(fetchNowPlaying, 10_000);
    return () => clearInterval(interval);
  }, [accessToken]);

  return { currentPlaying, isLoading, error };
};

export { useCurrentTrack };
