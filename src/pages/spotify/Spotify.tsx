import { useEffect, useState } from "react";
import { useUser } from "../../contexts/UserContext";
import { ThemeProvider } from "styled-components";
import { appTheme } from "../../theme";
import { Button, Flex, Input, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../routes";
import {
  getSpotifyAlbum,
  getSpotifyArtist,
  getSpotifyPlaylist,
  getSpotifyTrack,
} from "../../services/spotify/spotify";
import { SpotifyLinkInfo } from "../../types/spotifyTypes";
import {
  RecentReviewedContainer,
  RecentReviewedTitle,
  SpotifyHeroContainer,
  SpotifyMain,
  SpotifyMainBodyContainer,
  SpotifySearchButton,
  SpotifySearchContainer,
  SpotifySearchSubtitle,
  SpotifySearchTitle,
  StatsCard,
  StatsCardDescription,
  StatsCardNumber,
} from "./SpotifyStyles";
import {
  addDoc,
  collection,
  Timestamp,
  query,
  where,
  orderBy,
  getDocs,
} from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { formatFirebaseDate, scrollToTop } from "../../utils/utils";
interface SearchHistoryItem {
  id: string;
  userId: string;
  username: string;
  spotifyId: string;
  type: string;
  dateAdded: string;
}
const SpotifyPage = () => {
  const { user, userPartner, spotifyToken, loading } = useUser();
  const navigate = useNavigate();
  const [inputTrackLink, setInputTrackLink] = useState<string>("");
  const [inputTrackId, setInputTrackId] = useState<string | null>("");
  const [inputAlbumId, setInputAlbumId] = useState<string | null>("");

  const [isTrackLoading, setIsTrackLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [trackHistory, setTrackHistory] = useState<SearchHistoryItem[]>([]);
  const [albumHistory, setAlbumHistory] = useState<SearchHistoryItem[]>([]);
  const [playlistHistory, setPlaylistHistory] = useState<SearchHistoryItem[]>(
    []
  );
  const [artistHistory, setArtistHistory] = useState<SearchHistoryItem[]>([]);

  const extractSpotifyLinkInfo = (url: string): SpotifyLinkInfo => {
    try {
      const parsedUrl = new URL(url);
      const parts = parsedUrl.pathname.split("/").filter(Boolean);

      const [type, id] = parts;

      if (
        (type === "track" ||
          type === "album" ||
          type === "artist" ||
          type === "playlist") &&
        id
      ) {
        return {
          id,
          type,
          link: url,
        };
      }

      return null;
    } catch {
      return null;
    }
  };

  const handleGoToTrackDetails = async () => {
    const linkObj = extractSpotifyLinkInfo(inputTrackLink);
    //track
    if (linkObj?.type === "track" && spotifyToken) {
      setInputTrackId(linkObj?.id);
      setIsTrackLoading(true);
      const response = await getSpotifyTrack(
        linkObj.id,
        spotifyToken.accessToken
      );

      if (response) {
        await handleAddSearchHistory("track", linkObj.id);
        setIsTrackLoading(false);

        navigate(ROUTES.SPOTIFY_TRACK.path.replace(":trackId", linkObj.id));
      } else {
        setIsTrackLoading(false);
        setErrorMessage("Unable to find track");
      }
    }
    // album
    else if (linkObj?.type === "album" && spotifyToken) {
      setInputAlbumId(linkObj?.id);
      setIsTrackLoading(true);
      const response = await getSpotifyAlbum(
        linkObj.id,
        spotifyToken.accessToken
      );
      if (response) {
        await handleAddSearchHistory("album", linkObj.id);
        setIsTrackLoading(false);

        navigate(ROUTES.SPOTIFY_ALBUM.path.replace(":albumId", linkObj.id));
      } else {
        setIsTrackLoading(false);
        setErrorMessage("Unable to find album");
      }
    }
    //artist
    else if (linkObj?.type === "artist" && spotifyToken) {
      // setInputAlbumId(linkObj?.id);
      setIsTrackLoading(true);
      const response = await getSpotifyArtist(
        linkObj.id,
        spotifyToken.accessToken
      );
      if (response) {
        await handleAddSearchHistory("artist", linkObj.id);
        setIsTrackLoading(false);
        navigate(ROUTES.SPOTIFY_ARTIST.path.replace(":artistId", linkObj.id));
      } else {
        setIsTrackLoading(false);
        setErrorMessage("Unable to find album");
      }
    }
    //playlist
    else if (linkObj?.type === "playlist" && spotifyToken) {
      // setInputAlbumId(linkObj?.id);
      setIsTrackLoading(true);
      const response = await getSpotifyPlaylist(
        linkObj.id,
        spotifyToken.accessToken
      );
      if (response) {
        await handleAddSearchHistory("playlist", linkObj.id);
        setIsTrackLoading(false);
        navigate(
          ROUTES.SPOTIFY_PLAYLIST.path.replace(":playlistId", linkObj.id)
        );
      } else {
        setIsTrackLoading(false);
        setErrorMessage("Unable to find album");
      }
    } else {
      setErrorMessage("Invalid URL");
    }
  };

  const handleAddSearchHistory = async (type: string, spotifyId: string) => {
    const searchHistoryData = {
      userId: user?.id,
      spotifyId: spotifyId,
      type: type,
      dateAdded: Timestamp.now(),
    };

    try {
      await addDoc(
        collection(db, "anniAppSpotifySearchHistory"),
        searchHistoryData
      );
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  const handleGetSearchHistory = async () => {
    try {
      const searchHistoryRef = collection(db, "anniAppSpotifySearchHistory");
      const q = query(
        searchHistoryRef,
        where("userId", "in", [user?.id, userPartner?.id]),
        orderBy("dateAdded", "desc")
      );

      const querySnapshot = await getDocs(q);
      const historyData: SearchHistoryItem[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        historyData.push({
          id: doc.id,
          userId: data.userId,
          username:
            data.userId === user?.id
              ? user?.name ?? "Anon"
              : userPartner?.name ?? "Anon",
          spotifyId: data.spotifyId,
          type: data.type,
          dateAdded: formatFirebaseDate(data.dateAdded),
        });
      });

      const tracks = historyData.filter((item) => item.type === "track");
      const albums = historyData.filter((item) => item.type === "album");
      const playlists = historyData.filter((item) => item.type === "playlist");
      const artists = historyData.filter((item) => item.type === "artist");

      // Update all states
      setSearchHistory(historyData);
      setTrackHistory(tracks);
      setAlbumHistory(albums);
      setPlaylistHistory(playlists);
      setArtistHistory(artists);
    } catch (error) {
      console.error("Error fetching search history:", error);
    }
  };

  useEffect(() => {
    if (!loading && user) {
      handleGetSearchHistory();
      scrollToTop();
    }
  }, [loading, user]);

  return (
    <ThemeProvider theme={appTheme}>
      <SpotifyMain>
        <SpotifyHeroContainer>MUSIC</SpotifyHeroContainer>

        <SpotifyMainBodyContainer>
          <SpotifySearchContainer>
            <SpotifySearchTitle>Search</SpotifySearchTitle>
            <SpotifySearchSubtitle>
              Begin by pasting a link to a track, artist, album or playlist
            </SpotifySearchSubtitle>
            <Flex gap={8} style={{ width: "100%", marginTop: 8 }}>
              <Input
                allowClear
                disabled={isTrackLoading}
                placeholder="Link to album, track, artist or playlist "
                onChange={(e) => {
                  setErrorMessage("");
                  setInputTrackLink(e.target.value);
                }}
                onFocus={() => {
                  setErrorMessage("");
                }}
                style={{
                  borderColor: appTheme.borderColor,
                  border: "2px solid",
                  borderRadius: appTheme.borderRadius,
                  height: 40,
                }}
              />
              <SpotifySearchButton
                onClick={() => {
                  handleGoToTrackDetails();
                }}
              >
                {isTrackLoading ? <Spin size="default" /> : "Find"}
              </SpotifySearchButton>
            </Flex>
            {errorMessage !== "" && (
              <div style={{ color: appTheme.colorBgRed }}>{errorMessage}</div>
            )}
          </SpotifySearchContainer>
          <Flex
            gap={16}
            wrap={"wrap"}
            style={{ width: "100%" }}
            justify="center"
          >
            <StatsCard background={appTheme.colorBgPink}>
              <StatsCardNumber>123</StatsCardNumber>
              <StatsCardDescription>Ratings added</StatsCardDescription>
            </StatsCard>{" "}
            <StatsCard background={appTheme.colorBgYellow}>
              <StatsCardNumber>69</StatsCardNumber>
              <StatsCardDescription>Comments written</StatsCardDescription>
            </StatsCard>
          </Flex>

          <RecentReviewedContainer>
            <RecentReviewedTitle>Recently Reviewed</RecentReviewedTitle>
            yo
          </RecentReviewedContainer>
        </SpotifyMainBodyContainer>
      </SpotifyMain>
    </ThemeProvider>
  );
};

export default SpotifyPage;
