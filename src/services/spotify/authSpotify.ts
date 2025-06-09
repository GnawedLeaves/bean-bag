import axios from "axios";

const clientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID!;
const clientSecret = process.env.REACT_APP_SPOTIFY_CLIENT_SECRET!;
const authEndpoint = "https://accounts.spotify.com/api/token";

export const getSpotifyAuthToken = async () => {
  const params = new URLSearchParams();
  params.append("grant_type", "client_credentials");

  const basicAuth = btoa(`${clientId}:${clientSecret}`);

  try {
    const response = await axios.post(authEndpoint, params, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${basicAuth}`,
      },
    });

    const { access_token, expires_in } = response.data;
    return { accessToken: access_token, expiresIn: expires_in };
  } catch (error) {
    console.error("Failed to get Spotify token", error);
    throw error;
  }
};
