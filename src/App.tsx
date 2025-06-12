// src/App.tsx
import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { createGlobalStyle, ThemeProvider } from "styled-components";

import { ApolloProvider } from "@apollo/client";
import { client } from "./services/hygraph";
import Home from "./pages/home/Home";
import BlogUploadPage from "./pages/blog/BlogUpload";
import Navbar from "./components/layout/Navbar";
import SpacePage from "./pages/space/Space";
import LoginPage from "./pages/login/Login";
import { PlantsPage } from "./pages/plant/Plants";
import { UploadPlantsPage } from "./pages/plant/UploadPlants";
import { ROUTES } from "./routes";
import BlogPage from "./pages/blog/Blogs";
import { token } from "./theme";
import SpotifyPage from "./pages/spotify/Spotify";
import { UserProvider, useUser } from "./contexts/UserContext";
import SpotifyArtistDetailsPage from "./pages/spotify/SpotifyArtist";
import SpotifyTrackPage from "./pages/spotify/SpotifyTrack";
import SpotifyAlbumPage from "./pages/spotify/SpotifyAlbum";
import SpotifyPlaylistDetailsPage from "./pages/spotify/SpotifyPlaylist";
import { ProfilePage } from "./pages/profile/Profile";
import AgendaPage from "./pages/agenda/Agenda";

const GlobalStyle = createGlobalStyle`
  * {
    font-family: 'Josefin Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    box-sizing: border-box;
  }
  
  body {
    margin: 0;
    padding: 0;
    font-family: 'Josefin Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    background-color: ${token.colorBg};
  }
  
  /* Mobile-friendly responsive styles */
  html {
    font-size: 16px;
  }
  
  @media (max-width: 768px) {
    html {
      font-size: 14px;
    }
    
    input, textarea, button {
      font-size: 16px; /* Prevents iOS zoom on focus */
    }
  }

  /* Additional mobile-friendly styles */
  input, textarea, button {
    appearance: none;
    -webkit-appearance: none;
  }
`;

const App: React.FC = () => {
  return (
    <ApolloProvider client={client}>
      <ThemeProvider theme={token}>
        <UserProvider>
          <Router>
            <GlobalStyle />
            <Navbar />
            <main>
              <Routes>
                <Route path={ROUTES.HOME.path} element={<Home />} />
                <Route path="/*" element={<Home />} />
                <Route path={ROUTES.UPLOAD.path} element={<BlogUploadPage />} />
                <Route path={ROUTES.SPACE.path} element={<SpacePage />} />
                <Route path={ROUTES.LOGIN.path} element={<LoginPage />} />
                <Route path={ROUTES.PLANTS.path} element={<PlantsPage />} />
                <Route
                  path={ROUTES.PLANTS_UPLOAD.path}
                  element={<UploadPlantsPage />}
                />
                <Route path={ROUTES.PROFILE.path} element={<ProfilePage />} />
                <Route path={ROUTES.BLOGS.path} element={<BlogPage />} />
                <Route path={ROUTES.SPOTIFY.path} element={<SpotifyPage />} />
                <Route
                  path={ROUTES.SPOTIFY_ARTIST.path}
                  element={<SpotifyArtistDetailsPage />}
                />
                <Route
                  path={ROUTES.SPOTIFY_TRACK.path}
                  element={<SpotifyTrackPage />}
                />
                <Route
                  path={ROUTES.SPOTIFY_ALBUM.path}
                  element={<SpotifyAlbumPage />}
                />
                <Route
                  path={ROUTES.SPOTIFY_PLAYLIST.path}
                  element={<SpotifyPlaylistDetailsPage />}
                />
                <Route path={ROUTES.AGENDA.path} element={<AgendaPage />} />
              </Routes>
            </main>
          </Router>
        </UserProvider>
      </ThemeProvider>
    </ApolloProvider>
  );
};

export default App;
