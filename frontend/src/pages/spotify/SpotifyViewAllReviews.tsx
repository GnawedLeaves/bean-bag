import { ArrowLeftOutlined } from "@ant-design/icons";
import { ConfigProvider, Flex, Tabs, TabsProps } from "antd";
import {
  QueryDocumentSnapshot,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
} from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled, { ThemeProvider } from "styled-components";
import {
  CustomSpin,
  PageLoading,
} from "../../components/loading/LoadingStates";
import { useUser } from "../../contexts/UserContext";
import { db } from "../../firebase/firebase";
import {
  getMultipleSpotifyAlbums,
  getMultipleSpotifyArtists,
  getMultipleSpotifyTracks,
  getSpotifyPlaylist,
} from "../../services/spotify/spotify";
import { token } from "../../theme";
import {
  SpotifyAlbum,
  SpotifyArtist,
  SpotifyComment,
  SpotifyPlaylist,
  SpotifyTrack,
} from "../../types/spotifyTypes";
import {
  formatFirebaseDate,
  navigateBack,
  scrollToTop,
} from "../../utils/utils";
import { SpotifyBackButton } from "./SpotifyStyles";

import { Timestamp } from "firebase/firestore";
export interface EnrichedActivity {
  id?: string;
  userId: string;
  spotifyId: string;
  username?: string;
  userDisplayImg?: string;
  displayName: string;
  imageUrl: string;
  artist: string;
  content: string;
  type?: string;
  details:
    | SpotifyTrack
    | SpotifyAlbum
    | SpotifyArtist
    | SpotifyPlaylist
    | undefined;

  // Metadata
  dateAdded: Timestamp;
}

// Usage for your array:
export type EnrichedActivityList = EnrichedActivity[];

export const SpotifyAllReviewsHeader = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100px;
  background: ${(props) => props.theme.colorBgTeal};
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  border-bottom-left-radius: ${(props) => props.theme.borderRadius}px;
  border-bottom-right-radius: ${(props) => props.theme.borderRadius}px;
`;
const StyledTabsWrapper = styled.div`
  width: 100%;

  /* 1. Force the flex container to fill 100% */
  .ant-tabs-nav-list {
    width: 100%;
  }

  /* 2. Make each tab item grow to fill the available space (50% each for 2 tabs) */
  .ant-tabs-tab {
    flex: 1;
    display: flex;
    justify-content: center;
    margin: 0 !important; /* Removes default gaps between tabs */
  }
`;

const SpotifyViewAllReviewsBigContainer = styled.div`
  padding: 100px 16px;
  min-height: 100vh;
  overflow: auto;
  width: 100%;
`;

const ReviewContainer = styled(Flex)`
  width: 100%;
  min-height: 60px;
  border: 2px solid ${(props) => props.theme.borderColor};
  border-radius: ${(props) => props.theme.borderRadius}px;
  padding: ${(props) => props.theme.paddingMed}px
    ${(props) => props.theme.paddingMed}px;
`;

const ReviewDataContainer = styled.div`
  width: 70px;
`;

const ReviewImg = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 4px;
  border: 2px solid ${(props) => props.theme.borderColor};
  object-fit: cover;
`;

const SpotifyReviewsSortButton = styled(Flex)`
  border: 2px solid ${(props) => props.theme.borderColor};
  border-radius: ${(props) => props.theme.borderRadius}px;
  padding: 4px ${(props) => props.theme.paddingSmall}px;
  background: ${(props) => props.theme.colorBg};
  width: 100px;
  text-transform: capitalize;
`;

const SpotifyViewAllReviewsContentContainer = styled.div``;
const ReviewContent = styled(Flex)``;
const SpotifyViewAllReviews = () => {
  const PAGINATION_LIMIT = 100;
  const { user, userPartner, spotifyToken } = useUser();
  const [isPageLoading, setIsPageLoading] = useState<boolean>(false);
  const [keySelected, setKeySelected] = useState<string>("review");
  const scrollRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [reviews, setReviews] = useState<EnrichedActivity[]>([]);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);
  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const [currentReviewsSort, setCurrentReviewsSort] = useState<"asc" | "desc">(
    "desc",
  );
  const [isReviewBatchLoading, setIsReviewBatchLoading] =
    useState<boolean>(false);
  const [hasMoreReviews, setHasMoreReviews] = useState<boolean>(true);

  const tabItems: TabsProps["items"] = [
    {
      key: "rating",
      label: "Ratings",
      children: "",
    },
    {
      key: "review",
      label: "Reviews",
      children: "",
    },
  ];

  const handleTabsChange = (key: string) => {
    setKeySelected(key);
    scrollToTop();
  };

  const renderRatings = () => {
    return <Flex>Ratings</Flex>;
  };
  const fetchPaginatedReviews = async () => {
    if (!spotifyToken?.accessToken || !hasMoreReviews || isReviewBatchLoading)
      return;
    setIsReviewBatchLoading(true);

    let q = query(
      collection(db, "anniAppSpotifyReviewComment"),
      orderBy("dateAdded", "desc"),
      limit(PAGINATION_LIMIT),
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const snapshot = await getDocs(q);

    if (snapshot.empty || snapshot.docs.length < PAGINATION_LIMIT) {
      setHasMoreReviews(false);
    }

    if (!snapshot.empty) {
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);

      const comments = snapshot.docs.map((doc) => {
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

      const allActivity = [...comments].sort(
        (a, b) => b.dateAdded.toMillis() - a.dateAdded.toMillis(),
      );

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

      const [trackDetails, albumDetails, artistDetails, playlistDetails] =
        await Promise.all([
          getMultipleSpotifyTracks(tracks, spotifyToken?.accessToken || ""),
          getMultipleSpotifyAlbums(albums, spotifyToken?.accessToken || ""),
          getMultipleSpotifyArtists(artists, spotifyToken?.accessToken || ""),
          Promise.all(
            playlists.map((p) =>
              getSpotifyPlaylist(p, spotifyToken?.accessToken || ""),
            ),
          ),
        ]);

      const enrichedActivity: EnrichedActivity[] = allActivity.map(
        (activity) => {
          let details;
          let displayName = "";
          let imageUrl = "";
          let artist = "";

          switch (activity.type) {
            case "track":
              details = trackDetails.find((t) => t?.id === activity.spotifyId);
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
              details = playlistDetails.find(
                (p) => p.id === activity.spotifyId,
              );
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
        },
      );
      setReviews((prev) => [...prev, ...enrichedActivity]);
    }

    setIsReviewBatchLoading(false);
  };

  useEffect(() => {
    fetchPaginatedReviews();
  }, [spotifyToken]);

  //scroll detector and fetch
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !isReviewBatchLoading &&
          hasMoreReviews
        ) {
          fetchPaginatedReviews();
        }
      },
      { threshold: 1.0 },
    );

    const target = document.querySelector("#load-more-trigger-reviews");
    if (target) observer.observe(target);

    return () => observer.disconnect();
  }, [lastDoc, isReviewBatchLoading, hasMoreReviews]);

  const getThumbnail = (r: EnrichedActivity): string => {
    //@ts-expect-error
    if (r.type === "track") return r.details?.album?.images[0]?.url;
    //@ts-expect-error
    if (r.type === "album") return r.details?.images[0]?.url;
    //@ts-expect-error
    if (r.type === "artist") return r.details?.images[0]?.url;
    return "";
  };

  const handleSort = (current: string) => {
    const copy = [...reviews];

    const sorted = copy.sort((a, b) => {
      const timeA = a.dateAdded.toMillis();
      const timeB = b.dateAdded.toMillis();

      if (current === "asc") {
        return timeA - timeB;
      } else {
        return timeB - timeA;
      }
    });

    setReviews(sorted);
  };

  const renderReviews = () => {
    return (
      <Flex vertical gap={16} style={{ padding: "32px 0px" }}>
        <Flex style={{ fontSize: token.fontSizeLg }} gap={8} align="center">
          <div>Sort:</div>
          <SpotifyReviewsSortButton
            justify="center"
            onClick={() => {
              setCurrentReviewsSort((prev) => {
                if (prev === "asc") {
                  handleSort("desc");
                  return "desc";
                }
                handleSort("asc");
                return "asc";
              });
            }}
          >
            {currentReviewsSort}
          </SpotifyReviewsSortButton>
        </Flex>

        {reviews.map((review, i) => (
          <Flex align="center" gap={4} key={review.id + "" + Math.random()}>
            <ReviewDataContainer>
              {formatFirebaseDate(review.dateAdded)}
            </ReviewDataContainer>
            <ReviewContainer
              align="center"
              onClick={() => {
                navigate(`/spotify/${review.type}/${review.spotifyId}`);
              }}
              gap={8}
            >
              {getThumbnail(review) !== "" && (
                <ReviewImg src={getThumbnail(review)} />
              )}
              <ReviewContent gap={8} vertical>
                <div
                  style={{
                    // fontSize: token.fontSizeLg + "px",
                    fontWeight: "600",
                  }}
                >
                  {review.displayName} •{" "}
                  <span
                    style={{
                      textTransform: "capitalize",
                      color: token.textSecondary,
                    }}
                  >
                    {review.type}
                  </span>
                </div>
                <div>
                  <span
                    style={{
                      color: token.textSecondary,
                    }}
                  >
                    {review.username}:{" "}
                  </span>
                  {review.content}
                </div>
              </ReviewContent>
            </ReviewContainer>
          </Flex>
        ))}
        {isReviewBatchLoading && <CustomSpin color={token.colorBgTeal} />}
        {hasMoreReviews ? (
          <div id="load-more-trigger-reviews" style={{ height: "20px" }} />
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "20px",
              color: token.textSecondary,
            }}
          >
            End of reviews
          </div>
        )}
      </Flex>
    );
  };

  return (
    <ConfigProvider
      theme={{
        components: {
          Tabs: {
            itemHoverColor: token.colorBg,
            itemActiveColor: token.colorBg,
            inkBarColor: token.colorBg,
            itemSelectedColor: token.colorBg,
            colorBorderSecondary: "transparent",
            horizontalMargin: "0px",
            horizontalItemPadding: "0px",
          },
        },
      }}
    >
      <ThemeProvider theme={token}>
        <SpotifyAllReviewsHeader>
          <SpotifyBackButton
            style={{ background: "transparent", border: "none" }}
            onClick={() => {
              navigateBack(location, navigate, "spotify");
            }}
          >
            <ArrowLeftOutlined style={{ color: token.text }} />
          </SpotifyBackButton>
          <StyledTabsWrapper>
            <Tabs
              items={tabItems}
              defaultActiveKey="review"
              centered
              style={{ width: "100%" }}
              size="large"
              onChange={handleTabsChange}
            />
          </StyledTabsWrapper>
        </SpotifyAllReviewsHeader>
        <SpotifyViewAllReviewsBigContainer>
          {isPageLoading ? (
            <PageLoading background={token.colorBg} color={token.colorBgTeal} />
          ) : (
            <SpotifyViewAllReviewsContentContainer ref={scrollRef}>
              {keySelected === "rating" ? renderRatings() : renderReviews()}
            </SpotifyViewAllReviewsContentContainer>
          )}
        </SpotifyViewAllReviewsBigContainer>
      </ThemeProvider>
    </ConfigProvider>
  );
};

export default SpotifyViewAllReviews;
