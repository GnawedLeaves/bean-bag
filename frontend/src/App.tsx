// src/App.tsx
import React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { createGlobalStyle, ThemeProvider } from "styled-components";

import { ApolloProvider } from "@apollo/client";
import Navbar from "./components/layout/Navbar";
import { UserProvider } from "./contexts/UserContext";
import AgendaPage from "./pages/agenda/Agenda";
import BlogPage from "./pages/blog/Blogs";
import BlogUploadPage from "./pages/blog/BlogUpload";
import HabitsHomePage from "./pages/habits/HabitsHomePage";
import Home from "./pages/home/Home";
import LoginPage from "./pages/login/Login";
import { PlantsPage } from "./pages/plant/Plants";
import { UploadPlantsPage } from "./pages/plant/UploadPlants";
import { ProfilePage } from "./pages/profile/Profile";
import SpacePage from "./pages/space/Space";
import SpotifyPage from "./pages/spotify/Spotify";
import SpotifyAlbumPage from "./pages/spotify/SpotifyAlbum";
import SpotifyArtistDetailsPage from "./pages/spotify/SpotifyArtist";
import SpotifyPlaylistDetailsPage from "./pages/spotify/SpotifyPlaylist";
import SpotifyTrackPage from "./pages/spotify/SpotifyTrack";
import WatchListPage from "./pages/watchlist/WatchListPage";
import { ROUTES } from "./routes";
import { client } from "./services/hygraph";
import { token } from "./theme";
import SpotifyViewAllReviews from "./pages/spotify/SpotifyViewAllReviews";

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
    padding-bottom: 64px;
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
                <Route
                  path={ROUTES.SPOTIFY_VIEW_ALL_REVIEWS.path}
                  element={<SpotifyViewAllReviews />}
                />
                <Route path={ROUTES.AGENDA.path} element={<AgendaPage />} />
                <Route path={ROUTES.HABITS.path} element={<HabitsHomePage />} />
                <Route
                  path={ROUTES.WATCHLIST.path}
                  element={<WatchListPage />}
                />
              </Routes>
            </main>
          </Router>
        </UserProvider>
      </ThemeProvider>
    </ApolloProvider>
  );
};

export default App;
