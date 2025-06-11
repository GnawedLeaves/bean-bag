import React, { useEffect, useState } from "react";
import {
  Card,
  Typography,
  Row,
  Col,
  Button,
  Space,
  Statistic,
  Timeline,
} from "antd";
import {
  HeartOutlined,
  BookOutlined,
  ExperimentOutlined,
  RocketOutlined,
  CalendarOutlined,
  CameraOutlined,
  StarOutlined,
  GiftOutlined,
} from "@ant-design/icons";
import { getBlogEntries } from "../../services/hygraph";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../routes";
import { token } from "../../theme";

const { Title, Paragraph, Text } = Typography;

// Your theme colors

const Home: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [recentEntries, setRecentEntries] = useState<any[]>([]);
  const [daysTogetherCount, setDaysTogetherCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Calculate days together (you can adjust this anniversary date)
  const anniversaryDate = new Date("2024-06-14"); // Replace with your actual anniversary date

  const fetchRecentEntries = async () => {
    try {
      const results = await getBlogEntries();
      // Get the 3 most recent entries
      setRecentEntries(results.slice(0, 3));
    } catch (error) {
      console.error("Error fetching entries:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDaysTogether = () => {
    const today = new Date();
    const timeDifference = today.getTime() - anniversaryDate.getTime();
    const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));
    setDaysTogetherCount(daysDifference);
  };

  useEffect(() => {
    fetchRecentEntries();
    calculateDaysTogether();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate(ROUTES.LOGIN.path);
      } else {
        setUser(currentUser);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const navigationCards = [
    {
      title: "Our Memories",
      description: "Share and relive our special moments together",
      icon: <BookOutlined style={{ fontSize: "2rem" }} />,
      color: token.colorBgPink,
      route: ROUTES.BLOG?.path || "/blog",
      action: "View Memories",
    },
    {
      title: "Our Plants",
      description: "Track and share our growing plant family",
      icon: <ExperimentOutlined style={{ fontSize: "2rem" }} />,
      color: token.colorBgGreen,
      route: ROUTES.PLANTS?.path || "/plants",
      action: "See Plants",
    },
    {
      title: "Space Together",
      description: "Explore the cosmos and NASA's daily discoveries",
      icon: <RocketOutlined style={{ fontSize: "2rem" }} />,
      color: token.colorBgVoliet,
      route: ROUTES.SPACE?.path || "/space",
      action: "Explore Space",
    },
  ];

  const quickStats = [
    {
      title: "Days Together",
      value: daysTogetherCount,
      suffix: "days",
      icon: <HeartOutlined style={{ color: token.colorBgRed }} />,
      color: token.colorBgLightYellow,
    },
    {
      title: "Memories Shared",
      value: recentEntries.length,
      suffix: "posts",
      icon: <CameraOutlined style={{ color: token.colorBgRed }} />,
      color: token.colorBgPink,
    },
    {
      title: "Love Level",
      value: 100,
      suffix: "%",
      icon: <StarOutlined style={{ color: token.colorBgRed }} />,
      color: token.colorBgGreen,
    },
  ];

  if (loading) {
    return (
      <div
        style={{
          padding: "2rem",
          backgroundColor: token.colorBg,
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Space direction="vertical" align="center">
          <HeartOutlined
            style={{ fontSize: "3rem", color: token.colorBgRed }}
            spin
          />
          <Text style={{ color: token.text }}>
            Loading our special space...
          </Text>
        </Space>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "2rem",
        backgroundColor: token.colorBg,
        minHeight: "100vh",
      }}
    >
      {/* Quick Stats */}
      <Row gutter={[24, 24]} style={{ marginBottom: "3rem" }}>
        {quickStats.map((stat, index) => (
          <Col xs={24} sm={8} key={index}>
            <Card
              hoverable
              style={{
                backgroundColor: stat.color,
                border: "none",
                borderRadius: "12px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
              }}
              bodyStyle={{ textAlign: "center", padding: "2rem 1rem" }}
            >
              <Space direction="vertical" size="small">
                {stat.icon}
                <Statistic
                  title={
                    <Text style={{ color: token.text, fontWeight: "600" }}>
                      {stat.title}
                    </Text>
                  }
                  value={stat.value}
                  suffix={stat.suffix}
                  valueStyle={{
                    color: token.text,
                    fontSize: "2rem",
                    fontWeight: "bold",
                  }}
                />
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Navigation Cards */}
      <Title
        level={2}
        style={{
          color: token.text,
          marginBottom: "2rem",
          textAlign: "center",
        }}
      >
        Explore Our World
      </Title>

      <Row gutter={[24, 24]} style={{ marginBottom: "3rem" }}>
        {navigationCards.map((card, index) => (
          <Col xs={24} md={8} key={index}>
            <Card
              hoverable
              style={{
                height: "100%",
                backgroundColor: card.color,
                border: "none",
                borderRadius: "16px",
                boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                transition: "all 0.3s ease",
              }}
              bodyStyle={{
                padding: "2rem",
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
              actions={[
                <Button
                  type="primary"
                  size="large"
                  onClick={() => navigate(card.route)}
                  style={{
                    backgroundColor: token.colorBgRed,
                    borderColor: token.colorBgRed,
                    fontWeight: "600",
                  }}
                >
                  {card.action}
                </Button>,
              ]}
            >
              <Space
                direction="vertical"
                size="large"
                style={{ textAlign: "center", flex: 1 }}
              >
                <div style={{ color: token.text }}>{card.icon}</div>
                <div>
                  <Title
                    level={3}
                    style={{
                      color: token.text,
                      marginBottom: "0.5rem",
                      fontWeight: "bold",
                    }}
                  >
                    {card.title}
                  </Title>
                  <Paragraph
                    style={{
                      color: token.text,
                      fontSize: "1rem",
                      margin: 0,
                    }}
                  >
                    {card.description}
                  </Paragraph>
                </div>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Recent Memories Preview */}
      {recentEntries.length > 0 && (
        <Card
          title={
            <Title level={3} style={{ color: token.text, margin: 0 }}>
              <GiftOutlined
                style={{ marginRight: "0.5rem", color: token.colorBgRed }}
              />
              Recent Memories
            </Title>
          }
          extra={
            <Button
              type="link"
              onClick={() => navigate(ROUTES.BLOG?.path || "/blog")}
              style={{ color: token.colorBgRed, fontWeight: "600" }}
            >
              View All
            </Button>
          }
          style={{
            backgroundColor: "white",
            borderRadius: "16px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
            border: "none",
          }}
          bodyStyle={{ padding: "2rem" }}
        >
          <Timeline
            items={recentEntries.map((entry, index) => ({
              dot: <CalendarOutlined style={{ color: token.colorBgRed }} />,
              children: (
                <div key={index}>
                  <Text
                    strong
                    style={{ color: token.text, fontSize: "1.1rem" }}
                  >
                    {entry.title}
                  </Text>
                  <br />
                  <Text type="secondary" style={{ color: token.text }}>
                    {new Date(entry.timestamp).toLocaleDateString()}
                  </Text>
                  {entry.content && (
                    <>
                      <br />
                      <Text style={{ color: token.text }}>
                        {entry.content.substring(0, 100)}
                        {entry.content.length > 100 ? "..." : ""}
                      </Text>
                    </>
                  )}
                </div>
              ),
            }))}
          />
        </Card>
      )}

      {/* Anniversary Message */}
      <Card
        style={{
          marginTop: "2rem",
          background: `linear-gradient(135deg, ${token.colorBgYellow}, ${token.colorBgLightYellow})`,
          border: "none",
          borderRadius: "16px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
        }}
        bodyStyle={{ padding: "2rem", textAlign: "center" }}
      >
        <Space direction="vertical" size="large">
          <HeartOutlined
            style={{ fontSize: "3rem", color: token.colorBgRed }}
          />
          <Title level={2} style={{ color: token.text, margin: 0 }}>
            Every Day is a Gift with You
          </Title>
          <Paragraph
            style={{
              fontSize: "1.1rem",
              color: token.text,
              fontStyle: "italic",
              margin: 0,
              maxWidth: "600px",
            }}
          >
            This app is our digital scrapbook - a place to capture the moments
            that make our love story unique. From our shared memories to the
            plants we nurture together, and even the stars we dream under.
          </Paragraph>
        </Space>
      </Card>
    </div>
  );
};

export default Home;
