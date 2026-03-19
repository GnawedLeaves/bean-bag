import { message } from "antd";
import { useCallback, useState } from "react";

type SpotifyType = "artist" | "track" | "album" | "playlist";
interface AddCommentParams {
  userId: string;
  spotifyId: string;
  content: string;
  trackName?: string;
  username: string;
  type: SpotifyType;
}

interface AddReviewParams {
  userId: string;
  spotifyId: string;
  rating: number;
  trackName?: string;
  artistName?: string;
  username?: string;
  type: SpotifyType;
}

interface UseSpotifyReviewCommentsProps {
  onCommentAdded: () => void;
  onReviewAdded: () => void;
}

export const useSpotifyReviewComments = ({
  onCommentAdded,
  onReviewAdded,
}: UseSpotifyReviewCommentsProps) => {
  const API_BASE_URL =
    process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const addComment = useCallback(
    async (params: AddCommentParams) => {
      setIsLoading(true);
      const { userId, spotifyId, content, trackName, username, type } = params;

      if (!content.trim() || !spotifyId || !userId || !username) {
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/add-spotify-comment`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            spotifyId,
            content: content.trim(),
            trackName,
            username,
            type,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to add comment");
        }

        message.success("Comment added!");
        setIsLoading(false);
        onCommentAdded();
      } catch (error) {
        console.error("Failed to add comment:", error);
        message.error("Failed to add comment");
        setIsLoading(false);
      }
    },
    [API_BASE_URL, onCommentAdded],
  );

  const addReview = useCallback(
    async (params: AddReviewParams) => {
      setIsLoading(true);
      const {
        userId,
        spotifyId,
        rating,
        trackName,
        artistName,
        username,
        type,
      } = params;

      if (!spotifyId || !userId || !username) {
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/add-spotify-review`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            spotifyId,
            rating,
            trackName,
            artistName,
            username,
            type,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to add review");
        }

        message.success("Review added!");
        onReviewAdded();
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to add review:", error);
        message.error("Failed to add review");
        setIsLoading(false);
      }
    },
    [API_BASE_URL, onReviewAdded],
  );

  return {
    addComment,
    addReview,
    isLoading,
  };
};
