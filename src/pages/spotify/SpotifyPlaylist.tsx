import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeftOutlined,
  CommentOutlined,
  ShareAltOutlined,
} from "@ant-design/icons";
import {
  SpotifyComment,
  SpotifyPlaylist,
  SpotifyReview,
} from "../../types/spotifyTypes";
import { useUser } from "../../contexts/UserContext";
import {
  getSpotifyArtist,
  getSpotifyPlaylist,
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
import { Flex, Input, message, Rate, Spin } from "antd";
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
  SpotifyTrackPlayButton,
} from "./SpotifyStyles";
import {
  formatFirebaseDate,
  formatMilliseconds,
  scrollToTop,
} from "../../utils/utils";
import { ThemeProvider } from "styled-components";
import { token } from "../../theme";
import { ROUTES } from "../../routes";
import SpotifyDropdownComponent from "../../components/spotifyDropdown/SpotifyDropdown";
import { BaseOptionType } from "antd/es/select";
import styled from "styled-components";
import {
  ItemInfo,
  ItemTitle,
  ItemSubtitle,
  ItemCard,
  ItemImage,
} from "./SpotifyArtist";
import Draggable3DImage from "../../components/Draggable3DImage/Draggable3DImage";
import { faPlay } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Additional styled components for playlist page
const PlaylistInfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
`;

const PlaylistInfoText = styled.div`
  font-size: ${(props) => props.theme.fontSizeMed}px;
  color: ${(props) => props.theme.textSecondary};
  text-align: center;
`;

const PlaylistDescription = styled.div`
  font-size: ${(props) => props.theme.fontSizeSmall}px;
  color: ${(props) => props.theme.textSecondary};
  text-align: center;
  max-width: 300px;
  margin-bottom: 8px;
`;

export const TrackListContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
`;

export const TrackItem = styled.div`
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

export const TrackItemContent = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const TrackAlbumArt = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;
  border: 1px solid ${(props) => props.theme.borderColor};
`;

export const TrackInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const TrackName = styled.div`
  color: ${(props) => props.theme.text};
  font-size: ${(props) => props.theme.fontSizeMed}px;
  font-weight: 500;
`;

export const TrackArtist = styled.div`
  color: ${(props) => props.theme.textSecondary};
  font-size: ${(props) => props.theme.fontSizeSmall}px;
`;

export const TrackDuration = styled.span`
  color: ${(props) => props.theme.textSecondary};
  font-size: ${(props) => props.theme.fontSizeSmall}px;
  align-self: flex-start;
`;

export const TrackListHeader = styled.div`
  font-size: ${(props) => props.theme.fontSizeLg}px;
  font-weight: bold;
  color: ${(props) => props.theme.text};
  margin-bottom: 12px;
  text-align: center;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
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

const SpotifyPlaylistDetailsPage = () => {
  const { playlistId } = useParams();
  const { user, userPartner, spotifyToken, loading } = useUser();
  const navigate = useNavigate();
  const [playlistDetails, setPlaylistDetails] = useState<SpotifyPlaylist>();
  const [reviews, setReviews] = useState<ReviewObj[]>([]);
  const [comments, setComments] = useState<CommentObj[]>([]);
  const [newComment, setNewComment] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  const handleGetPlaylistDetails = async () => {
    if (!playlistId || !spotifyToken?.accessToken) return;
    try {
      const response = await getSpotifyPlaylist(
        playlistId,
        spotifyToken?.accessToken
      );
      setPlaylistDetails(response);
    } catch (error) {
      console.error("Failed to fetch playlist", error);
    } finally {
      setIsLoading(false);
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

      // Construct the review and comment objects
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

      // Sort by date
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
    if (!newComment.trim() || !playlistId || !user?.id) return;

    const commentData: SpotifyComment = {
      content: newComment.trim(),
      userId: user.id,
      spotifyId: playlistId,
      dateAdded: Timestamp.now(),
      type: "playlist",
    };

    try {
      await addDoc(collection(db, "anniAppSpotifyReviewComment"), commentData);
      setNewComment("");
      handleGetReviewsAndComments(playlistId);
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  const handleAddReview = async (rating: number) => {
    if (!playlistId || !user?.id) return;

    try {
      const reviewQuery = query(
        collection(db, "anniAppSpotifyReview"),
        where("spotifyId", "==", playlistId),
        where("userId", "==", user.id)
      );

      const querySnapshot = await getDocs(reviewQuery);

      const reviewData: SpotifyReview = {
        rating: rating,
        userId: user.id,
        spotifyId: playlistId,
        dateAdded: Timestamp.now(),
        type: "playlist",
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

      handleGetReviewsAndComments(playlistId);
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

  const handleGoToArtist = async (artistId: string) => {
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

  // Get unique artists from all tracks for dropdown
  const createArtistOptions = (): BaseOptionType[] => {
    if (!playlistDetails?.tracks?.items) return [];

    const artistsMap = new Map();
    playlistDetails.tracks.items.forEach((item) => {
      item.track.artists.forEach((artist) => {
        artistsMap.set(artist.id, {
          label: artist.name,
          value: artist.id,
        });
      });
    });

    return Array.from(artistsMap.values());
  };

  useEffect(() => {
    if (!loading && playlistId) {
      handleGetPlaylistDetails();
      handleGetReviewsAndComments(playlistId);
      scrollToTop();
    }
  }, [loading]);

  if (isLoading) {
    return (
      <ThemeProvider theme={token}>
        <SpotifyBigContainer>
          <LoadingContainer>
            <Spin size="large" />
          </LoadingContainer>
        </SpotifyBigContainer>
      </ThemeProvider>
    );
  }

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

          <SpoitfyTrackTitle>{playlistDetails?.name}</SpoitfyTrackTitle>
          <SpoitfyTrackSubTitle>
            by {playlistDetails?.owner.display_name}
          </SpoitfyTrackSubTitle>

          {playlistDetails?.description && (
            <PlaylistDescription>
              {playlistDetails.description}
            </PlaylistDescription>
          )}

          <Draggable3DImage
            songCount={playlistDetails?.tracks.total}
            url={playlistDetails?.images?.[0]?.url ?? ""}
          />
          {/* <SpotifyFeaturedImg src={playlistDetails?.images?.[0]?.url} /> */}

          <PlaylistInfoContainer>
            <PlaylistInfoText>
              {playlistDetails?.tracks.total} tracks
            </PlaylistInfoText>
          </PlaylistInfoContainer>

          <SpotifyTrackPlayButton>
            <a target="_blank" href={playlistDetails?.external_urls.spotify}>
              <FontAwesomeIcon
                icon={faPlay}
                color={token.borderColor}
                fontSize={32}
              />
            </a>
          </SpotifyTrackPlayButton>

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
          <TrackListContainer>
            <TrackListHeader>Tracks</TrackListHeader>
            <Flex vertical gap={8} style={{ padding: 8 }}>
              {playlistDetails?.tracks?.items?.map((item) => (
                <ItemCard
                  key={item.track.id}
                  onClick={() => handleGoToTrack(item.track.id)}
                >
                  <ItemImage
                    src={item.track.album.images?.[0]?.url}
                    alt={item.track.name}
                  />
                  <ItemInfo>
                    <ItemTitle>{item.track.name}</ItemTitle>
                    <ItemSubtitle>
                      {item.track.artists.map((artist, i) =>
                        i === 0 ? artist.name : ", " + artist.name
                      )}{" "}
                      • {formatMilliseconds(item.track.duration_ms)}
                    </ItemSubtitle>
                  </ItemInfo>
                </ItemCard>
              ))}
            </Flex>
            {/* {playlistDetails?.tracks?.items?.map((item, index) => (
              <TrackItem
                key={item.track.id}
                onClick={() => handleGoToTrack(item.track.id)}
              >
                <TrackItemContent>
                  <TrackAlbumArt
                    src={item.track.album.images?.[0]?.url}
                    alt={item.track.name}
                  />
                  <TrackInfo>
                    <TrackName>{item.track.name}</TrackName>
                    <TrackArtist>
                      {item.track.artists.map((artist, i) =>
                        i === 0 ? artist.name : ", " + artist.name
                      )}
                    </TrackArtist>
                  </TrackInfo>
                  <TrackDuration>
                    {formatMilliseconds(item.track.duration_ms)}
                  </TrackDuration>
                </TrackItemContent>
              </TrackItem>
            ))} */}
          </TrackListContainer>
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
                console.log(e.target.value);
                setNewComment(e.target.value);
              }}
              style={{
                border: `1px solid ${token.borderColor}`,
                borderRadius: token.borderRadius,
                background: token.colorBg,
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

export default SpotifyPlaylistDetailsPage;
