import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeftOutlined } from "@ant-design/icons";
import {
  SpotifyComment,
  SpotifyReview,
  SpotifyTrack,
} from "../../types/spotifyTypes";
import { useUser } from "../../contexts/UserContext";
import { getSpotifyTrack } from "../../services/spotify/spotify";
import {
  query,
  collection,
  where,
  getDocs,
  Timestamp,
  addDoc,
} from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { Flex, Input } from "antd";
import {
  CommentButton,
  CommentCard,
  CommentCardContent,
  CommentCardDate,
  CommentCardDisplayPic,
  CommentCardName,
  SpotifyBackButton,
  SpotifyBigContainer,
  SpotifyBodyContainer,
  SpotifyFeaturedContainer,
  SpotifyFeaturedImg,
} from "./SpotifyStyles";
import { firebaseDateToJS, formatFirebaseDate } from "../../utils/utils";
import { ThemeProvider } from "styled-components";
import { appTheme } from "../../theme";

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
            username: user.name,
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
            username: user.name,
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
    };

    try {
      await addDoc(collection(db, "anniAppSpotifyReviewComment"), commentData);
      setNewComment("");
      handleGetReviewsAndComments(trackId);
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  const handleAddReview = () => {};

  useEffect(() => {
    if (!loading && trackId) {
      handleGetTrackDetails();
      handleGetReviewsAndComments(trackId);
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
          <SpotifyFeaturedImg src={trackDetails?.album.images[0].url} />
        </SpotifyFeaturedContainer>
        <SpotifyBodyContainer>
          {trackDetails?.name}

          {trackDetails?.duration_ms}

          <button>
            <a target="_blank" href={trackDetails?.external_urls.spotify}>
              Click to play
            </a>
          </button>
          <Flex
            justify="space-between"
            style={{ padding: appTheme.paddingSmall }}
          >
            <div>Comments</div>
            <Input
              value={newComment}
              placeholder="Comment here"
              onChange={(e) => {
                setNewComment(e.target.value);
              }}
            />
            <CommentButton
              onClick={() => {
                handleAddComment();
              }}
            >
              Add Comment
            </CommentButton>
          </Flex>

          <Flex vertical gap={16} style={{ padding: 8 }}>
            {comments.length > 0
              ? comments.map((comment, index) => {
                  return (
                    <CommentCard key={index}>
                      <CommentCardDisplayPic src={comment.displayPicture} />
                      <Flex vertical>
                        <CommentCardName>{comment.username}</CommentCardName>
                        <CommentCardContent>
                          {comment.content}
                        </CommentCardContent>
                      </Flex>
                      <CommentCardDate>{comment.dateAddedJs}</CommentCardDate>
                    </CommentCard>
                  );
                })
              : "No comments"}
          </Flex>
        </SpotifyBodyContainer>
      </SpotifyBigContainer>
    </ThemeProvider>
  );
};

export default SpotifyTrackPage;
