import axios from "axios";
import {
  SpotifyAlbum,
  SpotifyArtist,
  SpotifyPlaylist,
  SpotifyTrack,
} from "../../types/spotifyTypes";

const clientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID!;
const clientSecret = process.env.REACT_APP_SPOTIFY_CLIENT_SECRET!;
export const getSpotifyArtist = async (
  artistId: string,
  token: string,
  fullUrl?: string,
): Promise<SpotifyArtist> => {
  if (!token) throw new Error("Authentication token is required");
  const res = await fetch(
    fullUrl || `https://api.spotify.com/v1/artists/${artistId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
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
  fullUrl?: string,
): Promise<SpotifyTrack> => {
  if (!token) throw new Error("Authentication token is required");
  const res = await fetch(
    fullUrl || `https://api.spotify.com/v1/tracks/${trackId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
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
  fullUrl?: string,
): Promise<SpotifyTrack[]> => {
  if (!trackIds.length) return [];

  const idsParam = trackIds.join(",");
  const url = `https://api.spotify.com/v1/tracks?ids=${encodeURIComponent(
    idsParam,
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
  fullUrl?: string,
): Promise<SpotifyAlbum> => {
  if (!token) throw new Error("Authentication token is required");
  const res = await fetch(
    fullUrl || `https://api.spotify.com/v1/albums/${albumId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
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
  fullUrl?: string,
): Promise<SpotifyPlaylist> => {
  if (!token) throw new Error("Authentication token is required");
  const res = await fetch(
    fullUrl || `https://api.spotify.com/v1/playlists/${playlistId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
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
  fullUrl?: string,
): Promise<SpotifyAlbum[]> => {
  if (!token) throw new Error("Authentication token is required");
  const res = await fetch(
    fullUrl || `https://api.spotify.com/v1/artists/${artistId}/albums`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
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
  fullUrl?: string,
): Promise<SpotifyTrack[]> => {
  if (!token) throw new Error("Authentication token is required");
  const res = await fetch(
    fullUrl ||
    `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch artist top tracks: ${res.statusText}`);
  }

  const data = await res.json();
  return data.tracks;
};

export const getMultipleSpotifyArtists = async (
  artistIds: string[],
  token: string,
  fullUrl?: string,
): Promise<SpotifyArtist[]> => {
  if (!artistIds.length) return [];

  const idsParam = artistIds.join(",");
  const url = `https://api.spotify.com/v1/artists?ids=${encodeURIComponent(
    idsParam,
  )}`;

  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data.artists;
};

export const getMultipleSpotifyAlbums = async (
  albumIds: string[],
  token: string,
  fullUrl?: string,
): Promise<SpotifyAlbum[]> => {
  if (!albumIds.length) return [];

  const idsParam = albumIds.join(",");
  const url = `https://api.spotify.com/v1/albums?ids=${encodeURIComponent(
    idsParam,
  )}`;

  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data.albums;
};

// Add this to your services/spotify/spotify.ts
const REDIRECT_URI = "https://beaniebag.netlify.app/spotify";
const SCOPES = ["user-read-currently-playing", "user-read-playback-state"];

export const getSpotifyAuthUrl = () => {
  const queryParams = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    scope: SCOPES.join(" "),
    show_dialog: "true",
  });
  return `https://accounts.spotify.com/authorize?${queryParams.toString()}`;
};

// In services/spotify/spotify.ts
export const exchangeCodeForToken = async (code: string) => {
  const params = new URLSearchParams();
  params.append("grant_type", "authorization_code");
  params.append("code", code);
  params.append("redirect_uri", REDIRECT_URI);

  const basicAuth = btoa(`${clientId}:${clientSecret}`);

  const response = await axios.post(
    "https://accounts.spotify.com/api/token",
    params,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${basicAuth}`,
      },
    },
  );
  return response.data; // This returns access_token and refresh_token
};

// In services/spotify/spotify.ts
export const getCurrentlyPlaying = async (accessToken: string) => {
  try {
    const response = await axios.get(
      "https://api.spotify.com/v1/me/player/currently-playing",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (response.status === 204 || !response.data) return null;
    return response.data; // Contains the track object
  } catch (error) {
    console.error("Error fetching playback", error);
    return null;
  }
};

export const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("spotify_refresh_token");
  if (!refreshToken) throw new Error("No refresh token");

  const params = new URLSearchParams();
  params.append("grant_type", "refresh_token");
  params.append("refresh_token", refreshToken);

  const basicAuth = btoa(`${clientId}:${clientSecret}`);
  const response = await axios.post(
    "https://accounts.spotify.com/api/token",
    params,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${basicAuth}`,
      },
    },
  );

  const newToken = response.data.access_token;
  localStorage.setItem("spotify_access_token", newToken);
  return newToken;
};

export const getValidAccessToken = async (): Promise<string> => {
  const token = localStorage.getItem("spotify_access_token");
  console.log("local storage token:", token);
  const expiry = Number(localStorage.getItem("spotify_token_expiry"));

  // Refresh 60 seconds early so a token never expires mid-request
  const isExpiredOrExpiringSoon = !expiry || Date.now() > expiry - 60_000;

  if (!token || isExpiredOrExpiringSoon) {
    return await refreshAccessToken();
  }

  return token;
};
