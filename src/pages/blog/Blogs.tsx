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
  CalendarOutlined,
  EnvironmentOutlined,
  FrownOutlined,
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
  BlogEntriesContainer,
  BlogEntryContainer,
  BlogEntryContent,
  BlogEntryLocation,
  BlogEntryTitle,
  BlogHeroContainer,
  BlogMainPage,
  BlogTopBar,
  BlogTopBarSubtitle,
} from "./BlogStyles";
import BlogCalendar from "../../components/blog/blogCalendarComponent/BlogCalendar";
import dayjs, { Dayjs } from "dayjs";
import { BlogEntry } from "../../types/blogTypes";
import {
  convertISOToDayjs,
  convertISOToDDMMYYY,
  convertISOToDDMMYYYHHmm,
} from "../../utils/utils";
import {
  getAddressFromCoords,
  getLocationDetails,
} from "../../services/google";
import BlogImages from "../../components/blog/blogImagesComponent/BlogImages";
import {
  PageLoading,
  BlogEntryLoading,
} from "../../components/loading/LoadingStates";

const { Title, Paragraph, Text } = Typography;

const BlogPage: React.FC = () => {
  const [entries, setEntries] = useState<BlogEntry[]>([]);
  const [dayEntries, setDayEntries] = useState<BlogEntry[]>([]);
  const [uniqueDates, setUniqueDates] = useState<Dayjs[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const navigate = useNavigate();

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

    setDayEntries(entriesWithLocation);
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
    const location = await getAddressFromCoords(latitude, longitude);

    return location;
  };

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
      <BlogTopBar>
        {/* BLOGS
        <BlogTopBarSubtitle>we can dump our shit here!!</BlogTopBarSubtitle> */}
      </BlogTopBar>
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
              {/* <BlogTopBarSubtitle>we can dump our shit here!!</BlogTopBarSubtitle> */}
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
                  </BlogEntryContainer>
                ))
              )}
            </BlogEntriesContainer>{" "}
          </>
        ) : (
          <Flex vertical gap={16} align="center">
            {/* <FrownOutlined /> */}
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
