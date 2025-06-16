import { useEffect, useState } from "react";
import { useUser } from "../../contexts/UserContext";
import { ThemeProvider } from "styled-components";
import { token } from "../../theme";
import { Button, Flex, Input, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../routes";
import {
  getSpotifyAlbum,
  getSpotifyArtist,
  getSpotifyTrack,
  getMultipleSpotifyTracks,
  getMultipleSpotifyAlbums,
  getMultipleSpotifyArtists,
  getSpotifyPlaylist,
} from "../../services/spotify/spotify";
import {
  EnrichedActivity,
  EnrichedHistoryItem,
  SearchHistoryItem,
  SpotifyAlbum,
  SpotifyArtist,
  SpotifyComment,
  SpotifyLinkInfo,
  SpotifyPlaylist,
  SpotifyReview,
  SpotifyTrack,
} from "../../types/spotifyTypes";
import {
  LoadingCardContainer,
  LoadingHistoryContainer,
  RecentReviewedContainer,
  RecentReviewedTitle,
  SpotifyAlbumContainer,
  SpotifyHeroContainer,
  SpotifyHeroSubtitle,
  SpotifyHeroTitle,
  SpotifyHistoryAlbumImg,
  SpotifyHistoryArtistImg,
  SpotifyHistoryItemContainer,
  SpotifyHistoryTrackImg,
  SpotifyMain,
  SpotifyMainBodyContainer,
  SpotifyRecentlyContainer,
  SpotifyRecentlyIconContainer,
  SpotifyRecentlyImg,
  SpotifyRecentlyTitle,
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
import { auth, db } from "../../firebase/firebase";
import { formatFirebaseDate, scrollToTop } from "../../utils/utils";
import { ItemTitle, ItemSubtitle } from "./SpotifyArtist";
import {
  CommentOutlined,
  SearchOutlined,
  StarOutlined,
} from "@ant-design/icons";
import {
  PageLoading,
  SpinnerIcon,
} from "../../components/loading/LoadingStates";
import { onAuthStateChanged } from "firebase/auth";
import React from "react";

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
  const [totalReviews, setTotalReviews] = useState<number>(0);
  const [totalComments, setTotalComments] = useState<number>(0);
  const [recentActivity, setRecentActivity] = useState<Array<any>>([]);
  const [enrichedSearchHistory, setEnrichedSearchHistory] = useState<
    EnrichedHistoryItem[]
  >([]);
  const [enrichedActivity, setEnrichedActivity] = useState<any[]>([]);
  const [recentsLoading, setRecentsLoading] = useState<boolean>(true);
  const [historyLoading, setHistoryLoading] = useState<boolean>(true);

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

  const handleGoToSpotifyDetails = async () => {
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

      // Group items by type for batch fetching
      const tracks = historyData.filter((item) => item.type === "track");
      const albums = historyData.filter((item) => item.type === "album");
      const artists = historyData.filter((item) => item.type === "artist");
      const playlists = historyData.filter((item) => item.type === "playlist");

      // Fetch details for each type
      const [trackDetails, albumDetails, artistDetails, playlistDetails] =
        await Promise.all([
          getMultipleSpotifyTracks(
            tracks.map((t) => t.spotifyId),
            spotifyToken?.accessToken || ""
          ),
          getMultipleSpotifyAlbums(
            albums.map((a) => a.spotifyId),
            spotifyToken?.accessToken || ""
          ),
          getMultipleSpotifyArtists(
            artists.map((a) => a.spotifyId),
            spotifyToken?.accessToken || ""
          ),
          Promise.all(
            playlists.map((p) =>
              getSpotifyPlaylist(p.spotifyId, spotifyToken?.accessToken || "")
            )
          ),
        ]);

      // Combine history data with details
      const enrichedData = historyData.map((item) => {
        let details;
        let displayName = "";
        let imageUrl = "";
        let artist = "";

        switch (item.type) {
          case "track":
            details = trackDetails.find((t) => t.id === item.spotifyId);
            if (details as SpotifyTrack) {
              displayName = (details as SpotifyTrack).name;
              imageUrl = (details as SpotifyTrack).album.images[0]?.url;
              artist = (details as SpotifyTrack).artists[0]?.name;
            }
            break;

          case "album":
            details = albumDetails.find((a) => a.id === item.spotifyId);
            if (details as SpotifyAlbum) {
              displayName = (details as SpotifyAlbum).name;
              imageUrl = (details as SpotifyAlbum).images[0]?.url;
              artist = (details as SpotifyAlbum).artists[0]?.name;
            }
            break;

          case "artist":
            details = artistDetails.find((a) => a.id === item.spotifyId);
            if (details as SpotifyArtist) {
              displayName = (details as SpotifyArtist).name;
              imageUrl = (details as SpotifyArtist).images[0]?.url;
              artist = (details as SpotifyArtist).name;
            }
            break;

          case "playlist":
            details = playlistDetails.find((p) => p.id === item.spotifyId);
            if (details as SpotifyPlaylist) {
              displayName = (details as SpotifyPlaylist).name;
              imageUrl = (details as SpotifyPlaylist).images[0]?.url;
              artist = (details as SpotifyPlaylist).owner.display_name;
            }
            break;
        }

        return {
          ...item,
          details,
          displayName,
          imageUrl,
          artist,
        };
      });

      setEnrichedSearchHistory(enrichedData);
      setRecentsLoading(false);
    } catch (error) {
      console.error("Error fetching search history:", error);
    }
  };

  const handleGetAllReviewsAndComments = async () => {
    try {
      // Get all reviews for user and partner
      const reviewQuery = query(
        collection(db, "anniAppSpotifyReview"),
        where("userId", "in", [user?.id, userPartner?.id])
      );
      const reviewSnapshot = await getDocs(reviewQuery);
      const reviews = reviewSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          rating: data.rating,
          spotifyId: data.spotifyId,
          userId: data.userId,
          dateAdded: data.dateAdded,
          type: data.type,
          activityType: "review",
        } as SpotifyReview;
      });

      // Get all comments
      const commentQuery = query(
        collection(db, "anniAppSpotifyReviewComment"),
        where("userId", "in", [user?.id, userPartner?.id])
      );
      const commentSnapshot = await getDocs(commentQuery);
      const comments = commentSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          content: data.content,
          spotifyId: data.spotifyId,
          userId: data.userId,
          dateAdded: data.dateAdded,
          type: data.type,
          activityType: "comment",
        } as SpotifyComment;
      });

      setTotalReviews(reviews.length);
      setTotalComments(comments.length);

      // const allActivity = [...reviews, ...comments].sort(
      //   (a, b) => b.dateAdded.toMillis() - a.dateAdded.toMillis()
      // );

      const allActivity = [...comments].sort(
        (a, b) => b.dateAdded.toMillis() - a.dateAdded.toMillis()
      );

      // Group items by type for batch fetching
      const tracks: string[] = [];
      const albums: string[] = [];
      const artists: string[] = [];
      const playlists: string[] = [];

      allActivity.forEach((activity) => {
        if (activity.type === "track") tracks.push(activity.spotifyId);
        if (activity.type === "album") albums.push(activity.spotifyId);
        if (activity.type === "artist") artists.push(activity.spotifyId);
        if (activity.type === "playlist") playlists.push(activity.spotifyId);
      });

      // Fetch all details in parallel
      const [trackDetails, albumDetails, artistDetails, playlistDetails] =
        await Promise.all([
          getMultipleSpotifyTracks(tracks, spotifyToken?.accessToken || ""),
          getMultipleSpotifyAlbums(albums, spotifyToken?.accessToken || ""),
          getMultipleSpotifyArtists(artists, spotifyToken?.accessToken || ""),
          Promise.all(
            playlists.map((p) =>
              getSpotifyPlaylist(p, spotifyToken?.accessToken || "")
            )
          ),
        ]);

      // Enrich the activity data
      const enrichedActivity = allActivity.slice(0, 15).map((activity) => {
        let details;
        let displayName = "";
        let imageUrl = "";
        let artist = "";

        switch (activity.type) {
          case "track":
            details = trackDetails.find((t) => t.id === activity.spotifyId);
            if (details as SpotifyTrack) {
              displayName = (details as SpotifyTrack).name;
              imageUrl = (details as SpotifyTrack).album.images[0]?.url;
              artist = (details as SpotifyTrack).artists[0]?.name;
            }
            break;

          case "album":
            details = albumDetails.find((a) => a.id === activity.spotifyId);
            if (details as SpotifyAlbum) {
              displayName = (details as SpotifyAlbum).name;
              imageUrl = (details as SpotifyAlbum).images[0]?.url;
              artist = (details as SpotifyAlbum).artists[0]?.name;
            }
            break;

          case "artist":
            details = artistDetails.find((a) => a.id === activity.spotifyId);
            if (details as SpotifyArtist) {
              displayName = (details as SpotifyArtist).name;
              imageUrl = (details as SpotifyArtist).images[0]?.url;
              artist = (details as SpotifyArtist).name;
            }
            break;

          case "playlist":
            details = playlistDetails.find((p) => p.id === activity.spotifyId);
            if (details as SpotifyPlaylist) {
              displayName = (details as SpotifyPlaylist).name;
              imageUrl = (details as SpotifyPlaylist).images[0]?.url;
              artist = (details as SpotifyPlaylist).owner.display_name;
            }
            break;
        }

        return {
          ...activity,
          details,
          displayName,
          imageUrl,

          artist,
          username:
            activity.userId === user?.id ? user.name : userPartner?.name,
          userDisplayImg:
            activity.userId === user?.id
              ? user.displayPicture
              : userPartner?.displayPicture,
        };
      });

      setEnrichedActivity(enrichedActivity);
      setHistoryLoading(false);
    } catch (error) {
      console.error("Error fetching activity:", error);
    }
  };

  useEffect(() => {
    if (!loading && user) {
      handleGetSearchHistory();
      scrollToTop();
      handleGetAllReviewsAndComments();
    }
  }, [loading, user]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate(ROUTES.LOGIN.path);
      } else {
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  if (loading) {
    return <PageLoading />;
  }

  return (
    <ThemeProvider theme={token}>
      <SpotifyMain>
        <SpotifyHeroContainer>
          <SpotifyHeroTitle>MUSIC</SpotifyHeroTitle>
          <SpotifyHeroSubtitle>
            So that we can rate and comment on each other's music
          </SpotifyHeroSubtitle>
        </SpotifyHeroContainer>

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
                  borderColor: token.borderColor,
                  border: "2px solid",
                  borderRadius: token.borderRadius,
                  height: 40,
                  fontFamily: token.fontFamily,
                }}
              />
              <SpotifySearchButton
                onClick={() => {
                  handleGoToSpotifyDetails();
                }}
              >
                {isTrackLoading ? <Spin size="default" /> : <SearchOutlined />}
              </SpotifySearchButton>
            </Flex>
            {errorMessage !== "" && (
              <div style={{ color: token.colorBgRed }}>{errorMessage}</div>
            )}
          </SpotifySearchContainer>
          <Flex gap={16} wrap="wrap" style={{ width: "100%" }} justify="center">
            {recentsLoading ? (
              <>
                <LoadingCardContainer>
                  <SpinnerIcon />
                </LoadingCardContainer>
                <LoadingCardContainer>
                  <SpinnerIcon />
                </LoadingCardContainer>
              </>
            ) : (
              <>
                <StatsCard background={token.colorBgPink}>
                  <StatsCardNumber>{totalReviews}</StatsCardNumber>
                  <StatsCardDescription>Ratings added</StatsCardDescription>
                </StatsCard>
                <StatsCard background={token.colorBgYellow}>
                  <StatsCardNumber>{totalComments}</StatsCardNumber>
                  <StatsCardDescription>Comments written</StatsCardDescription>
                </StatsCard>
              </>
            )}
          </Flex>

          <RecentReviewedContainer>
            <RecentReviewedTitle>
              Recently Reviewed / Commented
            </RecentReviewedTitle>
            {recentsLoading ? (
              <Flex vertical gap={8} justify="center">
                {[1, 2, 3].map((i) => (
                  <LoadingCardContainer key={i}>
                    <SpinnerIcon />
                  </LoadingCardContainer>
                ))}
              </Flex>
            ) : (
              <Flex vertical gap={8} justify="center">
                {enrichedActivity.map((activity) => (
                  <SpotifyRecentlyContainer
                    key={activity.id}
                    onClick={() => {
                      const route =
                        activity.type === "track"
                          ? ROUTES.SPOTIFY_TRACK.path.replace(
                              ":trackId",
                              activity.spotifyId
                            )
                          : activity.type === "album"
                          ? ROUTES.SPOTIFY_ALBUM.path.replace(
                              ":albumId",
                              activity.spotifyId
                            )
                          : activity.type === "artist"
                          ? ROUTES.SPOTIFY_ARTIST.path.replace(
                              ":artistId",
                              activity.spotifyId
                            )
                          : ROUTES.SPOTIFY_PLAYLIST.path.replace(
                              ":playlistId",
                              activity.spotifyId
                            );
                      navigate(route);
                    }}
                  >
                    <Flex gap={8} align="center">
                      <SpotifyRecentlyImg
                        src={activity.userDisplayImg}
                        alt=""
                      />
                      <Flex vertical gap={4}>
                        <SpotifyRecentlyTitle>
                          {activity.displayName}
                        </SpotifyRecentlyTitle>
                        <ItemSubtitle>
                          {activity.type !== "artist" && activity.artist}{" "}
                        </ItemSubtitle>
                        <ItemSubtitle>
                          {activity.username} •
                          {formatFirebaseDate(activity.dateAdded)}
                        </ItemSubtitle>
                      </Flex>
                    </Flex>
                    {activity.activityType === "review" ? (
                      <SpotifyRecentlyIconContainer>
                        <StarOutlined />
                      </SpotifyRecentlyIconContainer>
                    ) : (
                      <SpotifyRecentlyIconContainer>
                        <CommentOutlined />
                      </SpotifyRecentlyIconContainer>
                    )}{" "}
                  </SpotifyRecentlyContainer>
                ))}
              </Flex>
            )}
          </RecentReviewedContainer>

          <RecentReviewedContainer>
            <RecentReviewedTitle>Recent Searches</RecentReviewedTitle>
            {historyLoading ? (
              <Flex
                gap={16}
                wrap="wrap"
                style={{ width: "100%" }}
                justify="center"
              >
                {[1, 2, 3, 4].map((i) => (
                  <LoadingHistoryContainer key={i}>
                    <SpinnerIcon />
                  </LoadingHistoryContainer>
                ))}
              </Flex>
            ) : (
              <Flex
                gap={16}
                wrap="wrap"
                style={{ width: "100%" }}
                justify="center"
              >
                {enrichedSearchHistory.slice(0, 100).map((item) => (
                  <SpotifyHistoryItemContainer
                    key={item.id}
                    onClick={() => {
                      const route =
                        item.type === "track"
                          ? ROUTES.SPOTIFY_TRACK.path.replace(
                              ":trackId",
                              item.spotifyId
                            )
                          : item.type === "album"
                          ? ROUTES.SPOTIFY_ALBUM.path.replace(
                              ":albumId",
                              item.spotifyId
                            )
                          : item.type === "artist"
                          ? ROUTES.SPOTIFY_ARTIST.path.replace(
                              ":artistId",
                              item.spotifyId
                            )
                          : ROUTES.SPOTIFY_PLAYLIST.path.replace(
                              ":playlistId",
                              item.spotifyId
                            );
                      navigate(route);
                    }}
                  >
                    {item.type === "track" && (
                      <SpotifyHistoryTrackImg src={item.imageUrl} alt="" />
                    )}

                    {item.type === "artist" && (
                      <SpotifyHistoryArtistImg src={item.imageUrl} alt="" />
                    )}

                    {item.type === "album" ||
                      (item.type === "playlist" && (
                        <SpotifyHistoryAlbumImg src={item.imageUrl} alt="" />
                      ))}

                    <Flex gap={8} align="center" vertical>
                      <SpotifyRecentlyTitle>
                        {item.displayName}
                      </SpotifyRecentlyTitle>
                      <ItemSubtitle>
                        {item.username} • {item.dateAdded}
                        {/* • {item.artist} • {item.type} •{" "} */}
                      </ItemSubtitle>
                    </Flex>
                  </SpotifyHistoryItemContainer>
                ))}
              </Flex>
            )}
          </RecentReviewedContainer>
        </SpotifyMainBodyContainer>
      </SpotifyMain>
    </ThemeProvider>
  );
};

export default SpotifyPage;
