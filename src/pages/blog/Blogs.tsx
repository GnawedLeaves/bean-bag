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
import { CalendarOutlined, EnvironmentOutlined } from "@ant-design/icons";
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
  BlogHeroContainer,
  BlogMainPage,
  BlogTopBar,
  BlogTopBarSubtitle,
} from "./BlogStyles";
import BlogCalendar from "../../components/blog/blogCalendarComponent/BlogCalendar";
import dayjs, { Dayjs } from "dayjs";
import { BlogEntry } from "../../types/blogTypes";
import { convertISOToDayjs } from "../../utils/utils";
import {
  getAddressFromCoords,
  getLocationDetails,
} from "../../services/google";
import BlogImages from "../../components/blog/blogImagesComponent/BlogImages";

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
      console.log("Fetched entries:", results);
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
    getStreetLocation(1.3608108, 103.8609839);
  }, []);

  useEffect(() => {
    if (entries.length > 0) {
      handleGetAllEntryDates();
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

  const handleCalendarDayClick = (date: Dayjs) => {
    setSelectedDate(date);
    const filteredEntries = entries.filter((entry) =>
      convertISOToDayjs(entry.timestamp).isSame(date, "day")
    );
    console.log({ filteredEntries });

    setDayEntries(filteredEntries);
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

    console.log({ dates });
    setUniqueDates(dates);
  };

  const getStreetLocation = async (latitude: number, longitude: number) => {
    const location = await getAddressFromCoords(latitude, longitude);
    console.log({ location });

    return location;
  };

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "2rem" }}>
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: "1rem" }}
        />
      </div>
    );
  }

  return (
    <BlogMainPage>
      <BlogTopBar>
        BLOG
        <BlogTopBarSubtitle>we can dump our shit here!!</BlogTopBarSubtitle>
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
          <BlogEntriesContainer>
            {dayEntries.map((entry, index) => (
              <BlogEntryContainer key={index}>
                <BlogImages images={entry.images} />
              </BlogEntryContainer>
            ))}
          </BlogEntriesContainer>
        ) : (
          <Flex vertical gap={16}>
            No Entry for this date.
            <BlogButton
              onClick={() => {
                handleGoToAddEntry();
              }}
            >
              Add Entry
            </BlogButton>
          </Flex>
        )}
      </BlogBodyPage>
      <Button
        onClick={() => {
          navigate(ROUTES.UPLOAD.path);
        }}
      >
        Add Entry
      </Button>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {entries.map((entry, index) => (
          <Card
            key={index}
            hoverable
            style={{ width: "100%" }}
            bodyStyle={{ padding: "1.5rem" }}
          >
            <Title level={2} style={{ marginBottom: "1rem" }}>
              {entry.title}
            </Title>

            <Paragraph style={{ marginBottom: "1rem", fontSize: "16px" }}>
              {entry.content}
            </Paragraph>

            <Space
              direction="vertical"
              size="small"
              style={{ marginBottom: "1rem" }}
            >
              <Text type="secondary">
                <CalendarOutlined style={{ marginRight: "0.5rem" }} />
                <strong>Posted on:</strong>{" "}
                {new Date(entry.timestamp).toLocaleString()}
              </Text>

              {entry.location && (
                <Text type="secondary">
                  <EnvironmentOutlined style={{ marginRight: "0.5rem" }} />
                  <strong>Location:</strong>
                  {entry.location.latitude}, {entry.location.longitude}
                </Text>
              )}
            </Space>

            {entry.images && entry.images.length > 0 && (
              <Row gutter={[8, 8]}>
                {entry.images.map((img: any, i: number) => (
                  <Col key={i}>
                    <Image
                      width={100}
                      src={img.url}
                      alt={img.fileName}
                      style={{
                        borderRadius: "4px",
                        objectFit: "cover",
                      }}
                    />
                  </Col>
                ))}
              </Row>
            )}
          </Card>
        ))}
      </Space>
      {entries.length === 0 && (
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <Text type="secondary">No blog entries found.</Text>
        </div>
      )}
    </BlogMainPage>
  );
};

export default BlogPage;
