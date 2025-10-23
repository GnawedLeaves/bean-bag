export interface RouteConfig {
  path: string;
  name: string;
}

export const ROUTES: Record<string, RouteConfig> = {
  HOME: {
    path: "/",
    name: "Home",
  },
  UPLOAD: {
    path: "/upload/:blogDate",
    name: "Upload",
  },
  SPACE: {
    path: "/space",
    name: "Space",
  },
  LOGIN: {
    path: "/login",
    name: "Login",
  },
  PLANTS: {
    path: "/plants",
    name: "Plants",
  },
  PLANTS_UPLOAD: {
    path: "/plantsUpload",
    name: "Upload Plants",
  },
  PROFILE: {
    path: "/profile",
    name: "Profile",
  },
  BLOGS: {
    path: "/blogs",
    name: "Blogs",
  },
  SPOTIFY: {
    path: "/spotify",
    name: "Spotify",
  },
  SPOTIFY_ARTIST: {
    path: "/spotify/artist/:artistId",
    name: "Spotify Artist",
  },
  SPOTIFY_TRACK: {
    path: "/spotify/track/:trackId",
    name: "Spotify Track",
  },
  SPOTIFY_ALBUM: {
    path: "/spotify/album/:albumId",
    name: "Spotify Album",
  },
  SPOTIFY_PLAYLIST: {
    path: "/spotify/playlist/:playlistId",
    name: "Spotify Playlist",
  },
  AGENDA: {
    path: "/agenda",
    name: "Agenda",
  },
  HABITS: {
    path: "/habits",
    name: "Habits",
  },
  WATCHLIST: {
    path: "/watchlist",
    name: "Watch List",
  },
} as const;
