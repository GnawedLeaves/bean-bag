import axios from "axios";
import {
  SpotifyAlbum,
  SpotifyArtist,
  SpotifyPlaylist,
  SpotifyTrack,
} from "../../types/spotifyTypes";

export const getSpotifyArtist = async (
  artistId: string,
  token: string,
  fullUrl?: string
): Promise<SpotifyArtist> => {
  if (!token) throw new Error("Authentication token is required");
  const res = await fetch(
    fullUrl || `https://api.spotify.com/v1/artists/${artistId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch artist: ${res.statusText}`);
  }

  const data = await res.json();
  return data;
};

export const getSpotifyTrack = async (
  trackId: string,
  token: string,
  fullUrl?: string
): Promise<SpotifyTrack> => {
  if (!token) throw new Error("Authentication token is required");
  const res = await fetch(
    fullUrl || `https://api.spotify.com/v1/tracks/${trackId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch track: ${res.statusText}`);
  }

  const data = await res.json();
  return data;
};

export const getMultipleSpotifyTracks = async (
  trackIds: string[],
  token: string,
  fullUrl?: string
): Promise<SpotifyTrack[]> => {
  if (!trackIds.length) return [];

  const idsParam = trackIds.join(",");
  const url = `https://api.spotify.com/v1/tracks?ids=${encodeURIComponent(
    idsParam
  )}`;

  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data.tracks;
};

export const getSpotifyAlbum = async (
  albumId: string,
  token: string,
  fullUrl?: string
): Promise<SpotifyAlbum> => {
  if (!token) throw new Error("Authentication token is required");
  const res = await fetch(
    fullUrl || `https://api.spotify.com/v1/albums/${albumId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch album: ${res.statusText}`);
  }

  const data = await res.json();
  return data;
};
export const getSpotifyPlaylist = async (
  playlistId: string,
  token: string,
  fullUrl?: string
): Promise<SpotifyPlaylist> => {
  if (!token) throw new Error("Authentication token is required");
  const res = await fetch(
    fullUrl || `https://api.spotify.com/v1/playlists/${playlistId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch playlist: ${res.statusText}`);
  }

  const data = await res.json();
  return data;
};

export const getSpotifyArtistAlbums = async (
  artistId: string,
  token: string,
  fullUrl?: string
): Promise<SpotifyAlbum[]> => {
  if (!token) throw new Error("Authentication token is required");
  const res = await fetch(
    fullUrl || `https://api.spotify.com/v1/artists/${artistId}/albums`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch artist albums: ${res.statusText}`);
  }

  const data = await res.json();
  return data.items;
};

export const getSpotifyArtistTopTracks = async (
  artistId: string,
  token: string,
  fullUrl?: string
): Promise<SpotifyTrack[]> => {
  if (!token) throw new Error("Authentication token is required");
  const res = await fetch(
    fullUrl ||
      `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch artist top tracks: ${res.statusText}`);
  }

  const data = await res.json();
  return data.tracks;
};
