import {
  ArrowLeftOutlined,
  CommentOutlined,
  ShareAltOutlined,
  SmileOutlined,
} from "@ant-design/icons";
import { faPlay } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Flex, Input, message, Rate } from "antd";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import styled, { ThemeProvider } from "styled-components";
import Draggable3DImage from "../../components/Draggable3DImage/Draggable3DImage";
import { CustomSpin } from "../../components/loading/LoadingStates";
import { useUser } from "../../contexts/UserContext";
import { auth, db } from "../../firebase/firebase";
import { ROUTES } from "../../routes";
import {
  getSpotifyAlbum,
  getSpotifyArtist,
} from "../../services/spotify/spotify";
import { token } from "../../theme";
import {
  SpotifyAlbum,
  SpotifyComment,
  SpotifyReview,
} from "../../types/spotifyTypes";
import {
  formatFirebaseDate,
  formatMilliseconds,
  formatReleaseDate,
  navigateBack,
  scrollToTop,
} from "../../utils/utils";
import {
  CommentButton,
  CommentCard,
  CommentCardContent,
  CommentCardDate,
  CommentCardDisplayPic,
  CommentCardName,
  SpoitfyTrackSubTitle,
  SpoitfyTrackTitle,
  SpotifyBackButton,
  SpotifyBigContainer,
  SpotifyBodyContainer,
  SpotifyButtonSmall,
  SpotifyButtonSmallText,
  SpotifyFeaturedContainer,
  SpotifyRatingContainer,
  SpotifyRatingDisplay,
  SpotifyShareButton,
  SpotifyTrackPlayButton,
} from "./SpotifyStyles";
import { useSpotifyReviewComments } from "./utils/SpotifyController";

const AlbumInfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
`;

const AlbumInfoText = styled.div`
  font-size: ${(props) => props.theme.fontSizeMed}px;
  color: ${(props) => props.theme.textSecondary};
  text-align: center;
`;

const TrackListContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
`;

const TrackItem = styled.div`
  border: 1px solid ${(props) => props.theme.borderColor};
  border-radius: ${(props) => props.theme.borderRadius}px;
  padding: ${(props) => props.theme.paddingMed}px;
  background: ${(props) => props.theme.colorBg};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${(props) => props.theme.colorBgTeal};
    transform: translateY(-1px);
  }
`;

const TrackNumber = styled.span`
  color: ${(props) => props.theme.textSecondary};
  font-size: ${(props) => props.theme.fontSizeSmall}px;
  margin-right: 12px;
  min-width: 20px;
`;

const TrackName = styled.span`
  color: ${(props) => props.theme.text};
  font-size: ${(props) => props.theme.fontSizeMed}px;
  flex: 1;
`;

const TrackDuration = styled.span`
  color: ${(props) => props.theme.textSecondary};
  font-size: ${(props) => props.theme.fontSizeSmall}px;
`;

const TrackListHeader = styled.div`
  font-size: ${(props) => props.theme.fontSizeLg}px;
  font-weight: bold;
  color: ${(props) => props.theme.text};
  margin-bottom: 12px;
  text-align: center;
`;

interface ReviewObj extends SpotifyReview {
  username: string;
  displayPicture: string;
  dateAddedJs: string;
}

interface CommentObj extends SpotifyComment {
  username: string;
  displayPicture: string;
  dateAddedJs: string;
}

const SpotifyAlbumPage = () => {
  const { albumId } = useParams();
  const { user, userPartner, spotifyToken, loading } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [albumDetails, setAlbumDetails] = useState<SpotifyAlbum>();
  const [reviews, setReviews] = useState<ReviewObj[]>([]);
  const [comments, setComments] = useState<CommentObj[]>([]);
  const [newComment, setNewComment] = useState<string>("");
  const {
    addComment,
    addReview,
    isLoading: isReviewAddLoading,
  } = useSpotifyReviewComments({
    onCommentAdded: () => {
      setNewComment("");
      handleGetReviewsAndComments(albumId ?? "");
    },
    onReviewAdded: () => {
      handleGetReviewsAndComments(albumId ?? "");
    },
  });
  const handleGetAlbumDetails = async () => {
    if (!albumId || !spotifyToken?.accessToken) return;
    const response = await getSpotifyAlbum(albumId, spotifyToken?.accessToken);
    setAlbumDetails(response);
  };

  const handleGetReviewsAndComments = async (spotifyId: string) => {
    try {
      const reviewQuery = query(
        collection(db, "anniAppSpotifyReview"),
        where("spotifyId", "==", spotifyId),
      );
      const reviewSnapshot = await getDocs(reviewQuery);
      const reviews = reviewSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as SpotifyReview[];

      const commentQuery = query(
        collection(db, "anniAppSpotifyReviewComment"),
        where("spotifyId", "==", spotifyId),
      );
      const commentSnapshot = await getDocs(commentQuery);
      const comments = commentSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as SpotifyComment[];

      const reviewsObjs = reviews.map((review) => {
        const date =
          formatFirebaseDate(review.dateAdded) ||
          new Date().toLocaleDateString();
        if (review.userId === user?.id) {
          return {
            ...review,
            dateAddedJs: date,
            username: "Me",
            displayPicture: user.displayPicture,
          };
        } else if (review.userId === userPartner?.id) {
          return {
            ...review,
            dateAddedJs: date,
            username: userPartner.name,
            displayPicture: userPartner.displayPicture,
          };
        } else {
          return {
            ...review,
            dateAddedJs: date,
            username: "Anon",
            displayPicture: "",
          };
        }
      });

      const commentsObj = comments.map((comment) => {
        const date =
          formatFirebaseDate(comment.dateAdded) ||
          new Date().toLocaleDateString();
        if (comment.userId === user?.id) {
          return {
            ...comment,
            dateAddedJs: date,
            username: "Me",
            displayPicture: user.displayPicture,
          };
        } else if (comment.userId === userPartner?.id) {
          return {
            ...comment,
            dateAddedJs: date,
            username: userPartner.name,
            displayPicture: userPartner.displayPicture,
          };
        } else {
          return {
            ...comment,
            dateAddedJs: date,
            username: "Anon",
            displayPicture: "",
          };
        }
      });

      const sortedReviewObjs = [...reviewsObjs].sort(
        (a, b) => b.dateAdded.toMillis() - a.dateAdded.toMillis(),
      );

      const sortedCommentObjs = [...commentsObj].sort(
        (a, b) => b.dateAdded.toMillis() - a.dateAdded.toMillis(),
      );

      setReviews(sortedReviewObjs);
      setComments(sortedCommentObjs);

      return { reviews, comments };
    } catch (error) {
      console.error("Error fetching data:", error);
      return { reviews: [], comments: [] };
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !albumId || !user?.id) return;

    addComment({
      userId: user.id,
      spotifyId: albumId,
      content: newComment,
      trackName: albumDetails?.name,
      username: user.name || "Anonymous",
      type: "album",
    });
  };

  const handleAddReview = async (rating: number) => {
    if (!albumId || !user?.id) return;

    addReview({
      userId: user.id,
      spotifyId: albumId,
      rating,
      trackName: albumDetails?.name,
      artistName: albumDetails?.artists[0]?.name || "Unknown Artist",
      username: user.name,
      type: "album",
    });
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => {
        message.success("Link copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy URL: ", err);
        message.error("Failed to copy link");
      });
  };

  const handleGoToArtist = async (artistId?: string) => {
    if (!spotifyToken || !artistId) return;
    const response = await getSpotifyArtist(artistId, spotifyToken.accessToken);
    if (response) {
      navigate(ROUTES.SPOTIFY_ARTIST.path.replace(":artistId", artistId));
    } else {
      console.log("error going to artist", artistId);
    }
  };

  const handleGoToTrack = (trackId: string) => {
    navigate(ROUTES.SPOTIFY_TRACK.path.replace(":trackId", trackId));
  };

  useEffect(() => {
    if (!loading && albumId) {
      handleGetAlbumDetails();
      handleGetReviewsAndComments(albumId);
      scrollToTop();
    }
  }, [loading]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate(ROUTES.LOGIN.path);
      } else {
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  return (
    <ThemeProvider theme={token}>
      <SpotifyBigContainer>
        <SpotifyFeaturedContainer>
          <SpotifyBackButton
            onClick={() => {
              navigateBack(location, navigate, "spotify");
            }}
          >
            <ArrowLeftOutlined />
          </SpotifyBackButton>
          <SpotifyShareButton
            onClick={() => {
              handleCopyToClipboard();
            }}
          >
            <ShareAltOutlined />
          </SpotifyShareButton>
          <SpoitfyTrackTitle>{albumDetails?.name}</SpoitfyTrackTitle>
          <SpoitfyTrackSubTitle>
            {albumDetails?.artists.map((artist, index) => {
              return index === 0 ? artist.name : ", " + artist.name;
            })}
          </SpoitfyTrackSubTitle>
          <Draggable3DImage
            songCount={albumDetails?.total_tracks}
            url={albumDetails?.images[0]?.url ?? ""}
          />
          <AlbumInfoContainer>
            <AlbumInfoText>
              {albumDetails?.total_tracks} tracks • Released{" "}
              {albumDetails?.release_date &&
                formatReleaseDate(albumDetails.release_date)}
            </AlbumInfoText>
          </AlbumInfoContainer>
          <a target="_blank" href={albumDetails?.external_urls.spotify}>
            <SpotifyTrackPlayButton>
              <FontAwesomeIcon
                icon={faPlay}
                color={token.borderColor}
                fontSize={32}
              />
            </SpotifyTrackPlayButton>
          </a>

          <Flex vertical gap={8} align="center" style={{ marginTop: 8 }}>
            <SpotifyButtonSmall
              onClick={() => {
                handleGoToArtist(albumDetails?.artists[0].id);
              }}
            >
              <SmileOutlined />
            </SpotifyButtonSmall>
            <SpotifyButtonSmallText>Go to artist</SpotifyButtonSmallText>
          </Flex>
          <TrackListContainer>
            <TrackListHeader>Tracks</TrackListHeader>
            {albumDetails?.tracks?.items?.map((track, index) => (
              <TrackItem
                key={track.id}
                onClick={() => handleGoToTrack(track.id)}
              >
                <Flex align="center" justify="space-between">
                  <Flex align="center">
                    <TrackNumber>{track.track_number}</TrackNumber>
                    <TrackName>{track.name}</TrackName>
                  </Flex>
                  <TrackDuration>
                    {formatMilliseconds(track.duration_ms)}
                  </TrackDuration>
                </Flex>
              </TrackItem>
            ))}
          </TrackListContainer>

          <Flex gap={8} vertical style={{ marginTop: 16 }}>
            <TrackListHeader>Rating</TrackListHeader>
            <SpotifyRatingContainer>
              <SpotifyRatingDisplay src={user?.displayPicture} />
              <Flex vertical gap={4}>
                Me
                <Rate
                  onChange={handleAddReview}
                  value={
                    reviews.find((r) => r.userId === user?.id)?.rating || 0
                  }
                  style={{ color: token.text }}
                />
              </Flex>
            </SpotifyRatingContainer>

            {userPartner && (
              <SpotifyRatingContainer>
                {reviews.some((r) => r.userId === userPartner.id) ? (
                  <>
                    <SpotifyRatingDisplay src={userPartner.displayPicture} />
                    <Flex vertical gap={4}>
                      {userPartner.name}
                      <Rate
                        disabled
                        value={
                          reviews.find((r) => r.userId === userPartner.id)
                            ?.rating || 0
                        }
                        style={{ color: token.text }}
                      />
                    </Flex>
                  </>
                ) : (
                  <Flex vertical gap={4} style={{ width: "100%" }}>
                    <div style={{ textAlign: "center" }}>
                      {userPartner.name} has not rated yet
                    </div>
                  </Flex>
                )}
              </SpotifyRatingContainer>
            )}
          </Flex>
        </SpotifyFeaturedContainer>

        <SpotifyBodyContainer>
          <div
            style={{
              fontSize: token.fontSizeLg,
              fontWeight: "bold",
            }}
          >
            Comments
          </div>
          <Flex
            justify="space-between"
            style={{ padding: token.paddingSmall }}
            gap={16}
          >
            <Input
              value={newComment}
              placeholder="Write comment"
              onChange={(e) => {
                setNewComment(e.target.value);
              }}
              style={{
                border: `1px solid ${token.borderColor}`,
                borderRadius: token.borderRadius,
                background: token.colorBg,
                fontFamily: token.fontFamily,
              }}
            />
            <CommentButton
              disabled={isReviewAddLoading}
              onClick={() => {
                handleAddComment();
              }}
            >
              {isReviewAddLoading ? (
                <CustomSpin color={token.text} />
              ) : (
                <CommentOutlined color={token.borderColor} />
              )}
            </CommentButton>
          </Flex>

          <Flex vertical gap={16} style={{ padding: 8, width: "100%" }}>
            {comments.length > 0 ? (
              comments.map((comment, index) => {
                return (
                  <CommentCard key={index}>
                    <CommentCardDisplayPic src={comment.displayPicture} />
                    <Flex vertical>
                      <CommentCardName>{comment.username}</CommentCardName>
                      <CommentCardContent>{comment.content}</CommentCardContent>
                    </Flex>
                    <CommentCardDate>{comment.dateAddedJs}</CommentCardDate>
                  </CommentCard>
                );
              })
            ) : (
              <div style={{ textAlign: "center" }}>~No comments yet~</div>
            )}
          </Flex>
        </SpotifyBodyContainer>
      </SpotifyBigContainer>
    </ThemeProvider>
  );
};

export default SpotifyAlbumPage;
