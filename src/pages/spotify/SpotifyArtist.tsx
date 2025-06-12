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
  SpotifyArtist,
  SpotifyAlbum,
  SpotifyTrack,
} from "../../types/spotifyTypes";
import { useUser } from "../../contexts/UserContext";
import {
  getSpotifyArtist,
  getSpotifyArtistAlbums,
  getSpotifyArtistTopTracks,
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
import { auth, db } from "../../firebase/firebase";
import { Flex, Input, message, Rate } from "antd";
import {
  CommentButton,
  CommentCard,
  CommentCardContent,
  CommentCardDate,
  CommentCardDisplayPic,
  CommentCardName,
  SpoitfyTrackSubTitle,
  SpoitfyTrackTitle,
  SpotifyAlbumContainer,
  SpotifyAlbumPicture,
  SpotifyBackButton,
  SpotifyBigContainer,
  SpotifyBodyContainer,
  SpotifyFeaturedContainer,
  SpotifyArtistImg,
  SpotifyRatingContainer,
  SpotifyRatingDisplay,
  SpotifyShareButton,
} from "./SpotifyStyles";
import { formatFirebaseDate, scrollToTop } from "../../utils/utils";
import { ThemeProvider } from "styled-components";
import { token } from "../../theme";
import { ROUTES } from "../../routes";
import styled from "styled-components";
import { TrackListHeader } from "./SpotifyPlaylist";
import { onAuthStateChanged } from "firebase/auth";
import React from "react";

// Additional styled components for artist page
const ScrollableSection = styled.div`
  max-height: 300px;
  overflow-y: auto;
  width: 100%;
  border: 2px solid ${(props) => props.theme.borderColor};
  border-radius: ${(props) => props.theme.borderRadius}px;
  background: ${(props) => props.theme.colorBg};
  padding: ${(props) => props.theme.paddingMed}px;
`;

export const ItemCard = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: ${(props) => props.theme.paddingSmall}px;
  border: 2px solid ${(props) => props.theme.borderColor};
  border-radius: ${(props) => props.theme.borderRadius}px;
  background: ${(props) => props.theme.colorBg};
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: ${(props) => props.theme.colorBgTeal};
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

export const ItemImage = styled.img`
  width: 60px;
  height: 60px;
  border-radius: 100%;
  object-fit: cover;
  border: 2px solid ${(props) => props.theme.borderColor};
`;

export const ItemInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const ItemTitle = styled.div`
  font-size: ${(props) => props.theme.fontSizeMed}px;
  font-weight: bold;
  color: ${(props) => props.theme.text};
`;

export const ItemSubtitle = styled.div`
  font-size: ${(props) => props.theme.fontSizeSmall}px;
  color: ${(props) => props.theme.textSecondary};
`;

const SectionTitle = styled.div`
  font-size: ${(props) => props.theme.fontSizeLg}px;
  font-weight: bold;
  color: ${(props) => props.theme.text};
  margin-top: 16px;
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

const SpotifyArtistPage = () => {
  const { artistId } = useParams();
  const { user, userPartner, spotifyToken, loading } = useUser();
  const navigate = useNavigate();
  const [artistDetails, setArtistDetails] = useState<SpotifyArtist>();
  const [artistAlbums, setArtistAlbums] = useState<SpotifyAlbum[]>([]);
  const [artistTopTracks, setArtistTopTracks] = useState<SpotifyTrack[]>([]);
  const [reviews, setReviews] = useState<ReviewObj[]>([]);
  const [comments, setComments] = useState<CommentObj[]>([]);
  const [newComment, setNewComment] = useState<string>("");

  const handleGetArtistDetails = async () => {
    if (!artistId || !spotifyToken?.accessToken) return;
    const response = await getSpotifyArtist(
      artistId,
      spotifyToken?.accessToken
    );
    setArtistDetails(response);
  };

  const handleGetArtistAlbums = async () => {
    if (!artistId || !spotifyToken?.accessToken) return;
    const response = await getSpotifyArtistAlbums(
      artistId,
      spotifyToken?.accessToken
    );
    if (response) {
      setArtistAlbums(response);
    }
  };

  const handleGetArtistTopTracks = async () => {
    if (!artistId || !spotifyToken?.accessToken) return;
    const response = await getSpotifyArtistTopTracks(
      artistId,
      spotifyToken?.accessToken
    );
    if (response) {
      setArtistTopTracks(response);
    }
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
    if (!newComment.trim() || !artistId || !user?.id) return;

    const commentData: SpotifyComment = {
      content: newComment.trim(),
      userId: user.id,
      spotifyId: artistId,
      dateAdded: Timestamp.now(),
      type: "artist",
    };

    try {
      await addDoc(collection(db, "anniAppSpotifyReviewComment"), commentData);
      setNewComment("");
      handleGetReviewsAndComments(artistId);
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  const handleAddReview = async (rating: number) => {
    if (!artistId || !user?.id) return;

    try {
      const reviewQuery = query(
        collection(db, "anniAppSpotifyReview"),
        where("spotifyId", "==", artistId),
        where("userId", "==", user.id)
      );

      const querySnapshot = await getDocs(reviewQuery);

      const reviewData: SpotifyReview = {
        rating: rating,
        userId: user.id,
        spotifyId: artistId,
        dateAdded: Timestamp.now(),
        type: "artist",
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

      handleGetReviewsAndComments(artistId);
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

  const handleGoToAlbum = (albumId: string) => {
    navigate(ROUTES.SPOTIFY_ALBUM.path.replace(":albumId", albumId));
  };

  const handleGoToTrack = (trackId: string) => {
    navigate(ROUTES.SPOTIFY_TRACK.path.replace(":trackId", trackId));
  };

  useEffect(() => {
    if (!loading && artistId) {
      handleGetArtistDetails();
      handleGetArtistAlbums();
      handleGetArtistTopTracks();
      handleGetReviewsAndComments(artistId);
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
          <SpoitfyTrackTitle>{artistDetails?.name}</SpoitfyTrackTitle>
          <SpoitfyTrackSubTitle>
            {artistDetails?.followers.total.toLocaleString()} followers
          </SpoitfyTrackSubTitle>

          <SpotifyArtistImg src={artistDetails?.images?.[0]?.url} />

          <SectionTitle>Albums</SectionTitle>
          <Flex style={{ width: "100%" }} gap={16} wrap="wrap" justify="center">
            {artistAlbums.map((album, index) => (
              <SpotifyAlbumContainer
                key={album.id}
                onClick={() => handleGoToAlbum(album.id)}
              >
                <SpotifyAlbumPicture
                  src={album.images?.[0]?.url}
                  alt={album.name}
                />
                <ItemInfo>
                  <ItemTitle>{album.name}</ItemTitle>
                  <ItemSubtitle>
                    {album.release_date} • {album.total_tracks} tracks
                  </ItemSubtitle>
                </ItemInfo>
              </SpotifyAlbumContainer>
            ))}
          </Flex>

          {/* Top Tracks Section */}
          <SectionTitle>Top Tracks</SectionTitle>
          <Flex vertical gap={8}>
            {artistTopTracks.map((track) => (
              <ItemCard
                key={track.id}
                onClick={() => handleGoToTrack(track.id)}
              >
                <ItemImage
                  src={track.album.images?.[0]?.url}
                  alt={track.name}
                />
                <ItemInfo>
                  <ItemTitle>{track.name}</ItemTitle>
                  <ItemSubtitle>
                    {track.album.name} • {Math.floor(track.duration_ms / 60000)}
                    :
                    {Math.floor((track.duration_ms % 60000) / 1000)
                      .toString()
                      .padStart(2, "0")}
                  </ItemSubtitle>
                </ItemInfo>
              </ItemCard>
            ))}
          </Flex>

          {/* Rating Section */}
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

export default SpotifyArtistPage;
