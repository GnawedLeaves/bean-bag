import React, { useEffect, useState } from "react";
import {
  Card,
  Typography,
  Image,
  Space,
  Row,
  Col,
  Spin,
  Alert,
  Button,
  Flex,
} from "antd";
import {
  CommentOutlined,
  DeleteOutlined,
  SignatureOutlined,
} from "@ant-design/icons";
import { getBlogEntries } from "../../services/hygraph";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../routes";
import {
  BlogBodyPage,
  BlogButton,
  BlogCommentBox,
  BlogCommentButton,
  BlogCommentContainer,
  BlogCommentDeleteButton,
  BlogCommentInput,
  BlogEntriesContainer,
  BlogEntryContainer,
  BlogEntryContent,
  BlogEntryLocation,
  BlogEntryTitle,
  BlogHeroContainer,
  BlogMainPage,
  BlogTopBar,
} from "./BlogStyles";
import BlogCalendar from "../../components/blog/blogCalendarComponent/BlogCalendar";
import dayjs, { Dayjs } from "dayjs";
import { BlogEntry } from "../../types/blogTypes";
import {
  convertISOToDayjs,
  convertISOToDDMMYYY,
  convertISOToDDMMYYYHHmm,
  formatFirebaseDate,
} from "../../utils/utils";

import BlogImages from "../../components/blog/blogImagesComponent/BlogImages";
import {
  PageLoading,
  BlogEntryLoading,
} from "../../components/loading/LoadingStates";
import { useUser } from "../../contexts/UserContext";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  Timestamp,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { BlogComment } from "../../types/blogTypes";
import { CommentButton } from "../spotify/SpotifyStyles";
import { getLocationFromCoords } from "../../services/location";

const { Title, Paragraph, Text } = Typography;

const BlogPage: React.FC = () => {
  const [entries, setEntries] = useState<BlogEntry[]>([]);
  const [dayEntries, setDayEntries] = useState<BlogEntry[]>([]);
  const [uniqueDates, setUniqueDates] = useState<Dayjs[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [comments, setComments] = useState<
    Record<
      string,
      Array<BlogComment & { username: string; displayPicture: string }>
    >
  >({});
  const [newComment, setNewComment] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { user, userPartner, spotifyToken, getUserContextData } = useUser();
  const fetchEntries = async () => {
    try {
      setLoading(true);
      const results = await getBlogEntries();
      setEntries(results);
      setError(null);
    } catch (error) {
      console.error("Error fetching entries:", error);
      setError("Failed to load blog entries. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  useEffect(() => {
    if (entries.length > 0) {
      handleGetAllEntryDates();
      handleCalendarDayClick(dayjs());
    }
  }, [entries]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate(ROUTES.LOGIN.path);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleCalendarDayClick = async (date: Dayjs) => {
    setSelectedDate(date);
    const filteredEntries = entries.filter((entry) =>
      convertISOToDayjs(entry.timestamp).isSame(date, "day")
    );

    const entriesWithLocation = await Promise.all(
      filteredEntries.map(async (entry) => ({
        ...entry,
        streetLocation: await getStreetLocation(
          entry.location.latitude,
          entry.location.longitude
        ),
      }))
    );

    const sortedEntries = entriesWithLocation.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    setDayEntries(sortedEntries);
  };

  const handleGoToAddEntry = () => {
    navigate(
      ROUTES.UPLOAD.path.replace(":blogDate", selectedDate.format("YYYY-MM-DD"))
    );
  };

  const handleGetAllEntryDates = () => {
    const uniqueDatesMap = new Map();

    entries.forEach((entry) => {
      const date = convertISOToDayjs(entry.timestamp);
      const dateKey = date.format("YYYY-MM-DD");

      if (!uniqueDatesMap.has(dateKey)) {
        uniqueDatesMap.set(dateKey, date);
      }
    });

    const dates = Array.from(uniqueDatesMap.values());

    setUniqueDates(dates);
  };

  const getStreetLocation = async (latitude: number, longitude: number) => {
    try {
      const location = await getLocationFromCoords(latitude, longitude);
      return {
        street: location.address.road,
        country: location.address.country,
        fullAddress: location,
      };

      // return location;
    } catch (e) {
      return { street: "", country: "", fullAddress: "" };
    }
  };

  const fetchCommentsForEntries = async (entryIds: string[]) => {
    const commentsByEntry: Record<
      string,
      Array<BlogComment & { username: string; displayPicture: string }>
    > = {};
    for (const entryId of entryIds) {
      const q = query(
        collection(db, "anniAppBeansComments"),
        where("blogEntryId", "==", entryId),
        where("isDelete", "==", false)
      );
      const snapshot = await getDocs(q);
      const commentsWithUser = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const comment = { id: docSnap.id, ...docSnap.data() } as BlogComment;
          const userInfo = await fetchUserInfo(comment.userId);
          return { ...comment, ...userInfo };
        })
      );
      commentsByEntry[entryId] = commentsWithUser;
    }
    setComments(commentsByEntry);
  };

  const fetchUserInfo = async (userId: string) => {
    if (!userId) return { username: "Anon", displayPicture: "" };
    try {
      const userRef = collection(db, "anniAppUsers");
      const q = query(userRef, where("__name__", "==", userId));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        return {
          username: data.name || "Anon",
          displayPicture: data.displayPicture || "",
        };
      }
    } catch (e) {
      console.error("Error fetching user info", e);
    }
    return { username: "Anon", displayPicture: "" };
  };

  const handleAddComment = async (entryId: string) => {
    if (!newComment[entryId] || !user?.id) return;
    const commentData: BlogComment = {
      blogEntryId: entryId,
      userId: user.id,
      content: newComment[entryId].trim(),
      dateAdded: Timestamp.now(),
      isDelete: false,
    };
    try {
      await addDoc(collection(db, "anniAppBeansComments"), commentData);
      setNewComment((prev) => ({ ...prev, [entryId]: "" }));
      fetchCommentsForEntries(dayEntries.map((e) => e.id));
    } catch (e) {
      console.error("Error adding comment", e);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      const commentRef = doc(db, "anniAppBeansComments", commentId);
      await updateDoc(commentRef, { isDelete: true });
      fetchCommentsForEntries(dayEntries.map((e) => e.id));
    } catch (e) {
      console.error("Error deleting comment", e);
    }
  };

  useEffect(() => {
    if (dayEntries.length > 0) {
      fetchCommentsForEntries(dayEntries.map((e) => e.id));
    }
  }, [dayEntries]);

  if (loading) {
    return <PageLoading />;
  }

  if (error) {
    return (
      <BlogMainPage>
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          style={{ margin: "2rem" }}
        />
      </BlogMainPage>
    );
  }

  return (
    <BlogMainPage>
      <BlogHeroContainer>
        <BlogCalendar
          currentDate={selectedDate}
          onDayClick={handleCalendarDayClick}
          uniqueDates={uniqueDates}
        />
      </BlogHeroContainer>
      <BlogBodyPage>
        {dayEntries.length > 0 ? (
          <>
            <BlogTopBar>
              {selectedDate.format("DD MMM")} Bean
              {dayEntries.length > 1 ? "s" : ""}
            </BlogTopBar>
            <BlogButton
              onClick={() => {
                handleGoToAddEntry();
              }}
            >
              <SignatureOutlined /> Add Bean
            </BlogButton>
            <BlogEntriesContainer>
              {loading ? (
                <>
                  <BlogEntryLoading />
                  <BlogEntryLoading />
                  <BlogEntryLoading />
                </>
              ) : (
                dayEntries.map((entry, index) => (
                  <BlogEntryContainer key={index}>
                    <BlogImages
                      images={entry.images}
                      date={convertISOToDDMMYYY(entry.timestamp)}
                    />
                    <Flex vertical gap={8}>
                      <BlogEntryTitle>{entry.title}</BlogEntryTitle>
                      <BlogEntryContent>{entry.content}</BlogEntryContent>
                      <BlogEntryLocation>
                        {convertISOToDDMMYYYHHmm(entry.timestamp)} •{" "}
                        {entry.streetLocation?.street &&
                          entry.streetLocation?.street + ", "}
                        {entry.streetLocation?.country}
                      </BlogEntryLocation>
                    </Flex>

                    <BlogCommentContainer>
                      <div>Comments</div>
                      <div>
                        {(comments[entry.id] || []).length === 0 && (
                          <div style={{ color: "#888" }}>No comments yet.</div>
                        )}
                        <Flex vertical gap={8}>
                          {(comments[entry.id] || [])
                            .sort(
                              (a, b) =>
                                b.dateAdded.toMillis() - a.dateAdded.toMillis()
                            )
                            .map((comment) => (
                              <BlogCommentBox key={comment.id}>
                                {comment.displayPicture && (
                                  <img
                                    src={comment.displayPicture}
                                    alt={comment.username}
                                    style={{
                                      width: 28,
                                      height: 28,
                                      borderRadius: "50%",
                                      objectFit: "cover",
                                    }}
                                  />
                                )}
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontWeight: 500 }}>
                                    {comment.username || "Anon"}
                                    <span
                                      style={{
                                        fontSize: 12,
                                        color: "#aaa",
                                        marginLeft: 8,
                                      }}
                                    >
                                      {comment.dateAdded?.toDate()
                                        ? formatFirebaseDate(comment.dateAdded)
                                        : ""}
                                    </span>
                                  </div>
                                  <div>{comment.content}</div>
                                </div>
                                {comment.userId === user?.id && (
                                  <BlogCommentDeleteButton
                                    onClick={() =>
                                      handleDeleteComment(comment.id!)
                                    }
                                  >
                                    <DeleteOutlined />
                                  </BlogCommentDeleteButton>
                                )}
                              </BlogCommentBox>
                            ))}
                        </Flex>
                      </div>
                      <Flex gap={8} style={{ marginTop: 8 }}>
                        <BlogCommentInput
                          value={newComment[entry.id] || ""}
                          onChange={(e) =>
                            setNewComment((prev) => ({
                              ...prev,
                              [entry.id]: e.target.value,
                            }))
                          }
                          placeholder="Write comment"
                        />
                        <BlogCommentButton
                          onClick={() => handleAddComment(entry.id)}
                          disabled={
                            !newComment[entry.id] ||
                            !newComment[entry.id].trim()
                          }
                        >
                          <CommentOutlined />
                        </BlogCommentButton>
                      </Flex>
                    </BlogCommentContainer>
                  </BlogEntryContainer>
                ))
              )}
            </BlogEntriesContainer>{" "}
          </>
        ) : (
          <Flex vertical gap={16} align="center">
            No Beans for this date.
            <BlogButton
              onClick={() => {
                handleGoToAddEntry();
              }}
            >
              <SignatureOutlined /> Add Bean
            </BlogButton>
          </Flex>
        )}
      </BlogBodyPage>
    </BlogMainPage>
  );
};

export default BlogPage;
