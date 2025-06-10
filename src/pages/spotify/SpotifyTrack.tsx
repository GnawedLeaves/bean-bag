import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeftOutlined,
  CommentOutlined,
  ShareAltOutlined,
} from "@ant-design/icons";
import {
  SpotifyComment,
  SpotifyReview,
  SpotifyTrack,
} from "../../types/spotifyTypes";
import { useUser } from "../../contexts/UserContext";
import {
  getSpotifyAlbum,
  getSpotifyArtist,
  getSpotifyTrack,
} from "../../services/spotify/spotify";
import {
  query,
  collection,
  where,
  getDocs,
  Timestamp,
  addDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { Flex, Input, message, Rate } from "antd";
import {
  BarBigContainer,
  CommentButton,
  CommentCard,
  CommentCardContent,
  CommentCardDate,
  CommentCardDisplayPic,
  CommentCardName,
  SpoitfyTrackSubTitle,
  SpoitfyTrackTitle,
  SpotifyBackButton,
  SpotifyBarContainer,
  SpotifyBarInnerContainer,
  SpotifyBarInnerContainerText,
  SpotifyBigContainer,
  SpotifyBodyContainer,
  SpotifyButtonsContainer,
  SpotifyButtonSmall,
  SpotifyButtonSmallText,
  SpotifyFeaturedContainer,
  SpotifyFeaturedImg,
  SpotifyRatingContainer,
  SpotifyRatingDisplay,
  SpotifyRatingNumber,
  SpotifyShareButton,
  SpotifyTrackPlayButton,
} from "./SpotifyStyles";
import {
  convertMsToSeconds,
  formatFirebaseDate,
  formatMilliseconds,
  scrollToTop,
} from "../../utils/utils";
import { ThemeProvider } from "styled-components";
import { appTheme } from "../../theme";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCompactDisc, faPlay } from "@fortawesome/free-solid-svg-icons";
import { ROUTES } from "../../routes";
import SpotifyDropdownComponent from "../../components/spotifyDropdown/SpotifyDropdown";
import { BaseOptionType } from "antd/es/select";
import { TrackListHeader } from "./SpotifyPlaylist";

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

const SpotifyTrackPage = () => {
  const { trackId } = useParams();
  const { user, userPartner, spotifyToken, loading } = useUser();
  const navigate = useNavigate();
  const [trackDetails, setTrackDetails] = useState<SpotifyTrack>();
  const [reviews, setReviews] = useState<ReviewObj[]>([]);
  const [comments, setComments] = useState<CommentObj[]>([]);
  const [newComment, setNewComment] = useState<string>("");

  const handleGetTrackDetails = async () => {
    if (!trackId || !spotifyToken?.accessToken) return;
    const response = await getSpotifyTrack(trackId, spotifyToken?.accessToken);
    setTrackDetails(response);
  };

  const handleGetReviewsAndComments = async (spotifyId: string) => {
    try {
      const reviewQuery = query(
        collection(db, "anniAppSpotifyReview"),
        where("spotifyId", "==", spotifyId)
      );
      const reviewSnapshot = await getDocs(reviewQuery);
      const reviews = reviewSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as SpotifyReview[];

      const commentQuery = query(
        collection(db, "anniAppSpotifyReviewComment"),
        where("spotifyId", "==", spotifyId)
      );
      const commentSnapshot = await getDocs(commentQuery);
      const comments = commentSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as SpotifyComment[];

      //construct the review and comment objects
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

      // sort by date
      const sortedReviewObjs = [...reviewsObjs].sort(
        (a, b) => b.dateAdded.toMillis() - a.dateAdded.toMillis()
      );

      const sortedCommentObjs = [...commentsObj].sort(
        (a, b) => b.dateAdded.toMillis() - a.dateAdded.toMillis()
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
    if (!newComment.trim() || !trackId || !user?.id) return;

    const commentData: SpotifyComment = {
      content: newComment.trim(),
      userId: user.id,
      spotifyId: trackId,
      dateAdded: Timestamp.now(),
      type: "track",
    };

    try {
      await addDoc(collection(db, "anniAppSpotifyReviewComment"), commentData);
      setNewComment("");
      handleGetReviewsAndComments(trackId);
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  const handleAddReview = async (rating: number) => {
    if (!trackId || !user?.id) return;

    try {
      const reviewQuery = query(
        collection(db, "anniAppSpotifyReview"),
        where("spotifyId", "==", trackId),
        where("userId", "==", user.id)
      );

      const querySnapshot = await getDocs(reviewQuery);

      const reviewData: SpotifyReview = {
        rating: rating,
        userId: user.id,
        spotifyId: trackId,
        dateAdded: Timestamp.now(),
        type: "track",
      };

      if (querySnapshot.empty) {
        await addDoc(collection(db, "anniAppSpotifyReview"), reviewData);
      } else {
        const docRef = querySnapshot.docs[0].ref;
        await updateDoc(docRef, {
          rating: rating,
          dateAdded: Timestamp.now(),
        });
      }

      handleGetReviewsAndComments(trackId);
    } catch (error) {
      console.error("Failed to add/update review:", error);
    }
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

  const handleGoToAlbum = async () => {
    if (!spotifyToken || !trackDetails?.album.id) return;
    const response = await getSpotifyAlbum(
      trackDetails?.album.id,
      spotifyToken.accessToken
    );
    if (response) {
      navigate(
        ROUTES.SPOTIFY_ALBUM.path.replace(":albumId", trackDetails?.album.id)
      );
    } else {
      console.log("error going to album");
    }
  };

  const handleGoToArtist = async (artistId: string) => {
    if (!spotifyToken || !artistId) return;
    const response = await getSpotifyArtist(artistId, spotifyToken.accessToken);
    if (response) {
      navigate(ROUTES.SPOTIFY_ARTIST.path.replace(":artistId", artistId));
    } else {
      console.log("error going to artist", artistId);
    }
  };

  const createArtistOptions = (): BaseOptionType[] => {
    if (trackDetails?.artists) {
      const options = trackDetails?.artists.map((artist) => {
        return {
          label: artist.name,
          value: artist.id,
        };
      });
      return options;
    } else {
      return [];
    }
  };

  useEffect(() => {
    if (!loading && trackId) {
      handleGetTrackDetails();
      handleGetReviewsAndComments(trackId);
      scrollToTop();
    }
  }, [loading]);

  return (
    <ThemeProvider theme={appTheme}>
      <SpotifyBigContainer>
        <SpotifyFeaturedContainer>
          <SpotifyBackButton
            onClick={() => {
              navigate(-1);
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
          <SpoitfyTrackTitle> {trackDetails?.name}</SpoitfyTrackTitle>
          <SpoitfyTrackSubTitle>
            {trackDetails?.artists.map((artist, index) => {
              return index === 0 ? artist.name : "," + artist.name;
            })}
          </SpoitfyTrackSubTitle>

          <SpotifyFeaturedImg src={trackDetails?.album.images[0].url} />
          <BarBigContainer>
            <Flex justify="space-between">
              <SpotifyBarInnerContainerText>0:00</SpotifyBarInnerContainerText>
              <SpotifyBarInnerContainerText>
                {formatMilliseconds(trackDetails?.duration_ms)}
              </SpotifyBarInnerContainerText>
            </Flex>

            <SpotifyBarContainer>
              <SpotifyBarInnerContainer
                trackDuration={
                  convertMsToSeconds(trackDetails?.duration_ms) || 60
                }
              />
            </SpotifyBarContainer>
          </BarBigContainer>
          <SpotifyButtonsContainer>
            <SpotifyButtonSmall
              onClick={() => {
                handleGoToAlbum();
              }}
            >
              <FontAwesomeIcon icon={faCompactDisc} color={appTheme.text} />
            </SpotifyButtonSmall>

            <SpotifyTrackPlayButton>
              <a target="_blank" href={trackDetails?.external_urls.spotify}>
                <FontAwesomeIcon
                  icon={faPlay}
                  color={appTheme.borderColor}
                  fontSize={32}
                />
              </a>
            </SpotifyTrackPlayButton>

            <SpotifyDropdownComponent
              onItemClick={(option) => handleGoToArtist(option.value)}
              dropdownOptions={createArtistOptions() || []}
            />
          </SpotifyButtonsContainer>

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
                  style={{ color: appTheme.text }}
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
                        style={{ color: appTheme.text }}
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
              fontSize: appTheme.fontSizeLg,
              fontWeight: "bold",
            }}
          >
            Comments
          </div>
          <Flex
            justify="space-between"
            style={{ padding: appTheme.paddingSmall }}
            gap={16}
          >
            <Input
              value={newComment}
              placeholder="Write comment"
              onChange={(e) => {
                setNewComment(e.target.value);
              }}
              style={{
                border: `1px solid ${appTheme.borderColor}`,
                borderRadius: appTheme.borderRadius,
                background: appTheme.colorBg,
              }}
            />
            <CommentButton
              onClick={() => {
                handleAddComment();
              }}
            >
              <CommentOutlined />
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

export default SpotifyTrackPage;
