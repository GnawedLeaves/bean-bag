import { SpotifyArtist, SpotifyTrack } from "../../types/spotifyTypes";

export const getSpotifyArtist = async (
  artistId: string,
  token: string
): Promise<SpotifyArtist> => {
  if (!token) throw new Error("Authentication token is required");
  const res = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch artist: ${res.statusText}`);
  }

  const data = await res.json();
  return data;
};

export const getSpotifyTrack = async (
  trackId: string,
  token: string
): Promise<SpotifyTrack> => {
  if (!token) throw new Error("Authentication token is required");
  const res = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch track: ${res.statusText}`);
  }

  const data = await res.json();
  return data;
};
