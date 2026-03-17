import { useState, useEffect, useMemo } from "react";
import {
  Card,
  Input,
  Row,
  Col,
  Image,
  Typography,
  Tag,
  Button,
  Space,
  Tooltip,
  Empty,
  Spin,
  message,
  Select,
} from "antd";
import {
  HeartOutlined,
  HeartFilled,
  SearchOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import { gql } from "@apollo/client";
import { client } from "../../services/hygraph";
import { ROUTES } from "../../routes";
import { useNavigate } from "react-router-dom";

const { Search } = Input;
const { Title, Text, Paragraph } = Typography;
const { Meta } = Card;

// Your existing GraphQL query
export const getPlantEntries = async () => {
  const GET_ALL_ENTRIES = gql`
    query GetAllPlants {
      plantEntries {
        id
        title
        content
        plantName
        timestamp
        images {
          url
          fileName
        }
        location {
          latitude
          longitude
        }
      }
    }
  `;

  try {
    const result = await client.query({
      query: GET_ALL_ENTRIES,
      fetchPolicy: "network-only",
    });

    return result.data.plantEntries;
  } catch (error) {
    console.error("Error fetching entries:", error);
    throw error;
  }
};

// Enhanced interface with reaction system
interface PlantEntry {
  id: string;
  title: string;
  content: string;
  plantName: string;
  timestamp: string;
  images: Array<{
    url: string;
    fileName: string;
  }>;
  location: {
    latitude: number;
    longitude: number;
  };
  // Add these for the reaction system
  hearts?: number;
  isLiked?: boolean;
}

interface PlantsPageProps {}

const PlantsPage = ({}: PlantsPageProps) => {
  const [plants, setPlants] = useState<PlantEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlantNames, setSelectedPlantNames] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "mostLiked">(
    "newest"
  );
  const navigate = useNavigate();
  // Load plant entries
  useEffect(() => {
    const loadPlants = async () => {
      try {
        setLoading(true);
        const entries = await getPlantEntries();

        // Add reaction data (you'll want to fetch this from your backend)
        const entriesWithReactions = entries.map((entry: any) => ({
          ...entry,
          hearts: Math.floor(Math.random() * 50), // Mock data
          isLiked: false, // Mock data
        }));

        setPlants(entriesWithReactions);
      } catch (error) {
        message.error("Failed to load plant entries");
      } finally {
        setLoading(false);
      }
    };

    loadPlants();
  }, []);

  // Get unique plant names for filter dropdown
  const uniquePlantNames = useMemo(() => {
    return Array.from(new Set(plants.map((plant) => plant.plantName))).sort();
  }, [plants]);

  // Filter and sort plants
  const filteredAndSortedPlants = useMemo(() => {
    let filtered = plants.filter((plant) => {
      const matchesSearch =
        plant.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plant.plantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plant.content.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesPlantName =
        selectedPlantNames.length === 0 ||
        selectedPlantNames.includes(plant.plantName);

      return matchesSearch && matchesPlantName;
    });

    // Sort plants
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
        case "oldest":
          return (
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );
        case "mostLiked":
          return (b.hearts || 0) - (a.hearts || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [plants, searchTerm, selectedPlantNames, sortBy]);

  // Handle heart reaction
  const handleHeartClick = async (plantId: string) => {
    try {
      // Here you would make an API call to toggle the like
      // For now, we'll update the local state
      setPlants((prevPlants) =>
        prevPlants.map((plant) => {
          if (plant.id === plantId) {
            const isCurrentlyLiked = plant.isLiked;
            return {
              ...plant,
              isLiked: !isCurrentlyLiked,
              hearts: (plant.hearts || 0) + (isCurrentlyLiked ? -1 : 1),
            };
          }
          return plant;
        })
      );

      message.success("Reaction updated!");
    } catch (error) {
      message.error("Failed to update reaction");
    }
  };

  // Format date
  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format location
  const formatLocation = (location: {
    latitude: number;
    longitude: number;
  }) => {
    return `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Loading plant entries...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      <Title level={2} style={{ marginBottom: "24px" }}>
        Plant Collection ({plants.length} entries)
      </Title>

      <Button
        onClick={() => {
          navigate(ROUTES.PLANTS_UPLOAD.path);
        }}
      >
        Add Plant
      </Button>

      {/* Filters */}
      <Card style={{ marginBottom: "24px" }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="Search plants, titles, or content..."
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Select
              mode="multiple"
              placeholder="Filter by plant names"
              style={{ width: "100%" }}
              value={selectedPlantNames}
              onChange={setSelectedPlantNames}
              allowClear
              suffixIcon={<FilterOutlined />}
            >
              {uniquePlantNames.map((name) => (
                <Select.Option key={name} value={name}>
                  {name}
                </Select.Option>
              ))}
            </Select>
          </Col>

          <Col xs={24} sm={24} md={8}>
            <Select
              value={sortBy}
              onChange={setSortBy}
              style={{ width: "100%" }}
            >
              <Select.Option value="newest">Newest First</Select.Option>
              <Select.Option value="oldest">Oldest First</Select.Option>
              <Select.Option value="mostLiked">Most Liked</Select.Option>
            </Select>
          </Col>
        </Row>

        {(searchTerm || selectedPlantNames.length > 0) && (
          <div style={{ marginTop: "16px" }}>
            <Text type="secondary">
              Showing {filteredAndSortedPlants.length} of {plants.length}{" "}
              entries
            </Text>
            {selectedPlantNames.length > 0 && (
              <div style={{ marginTop: "8px" }}>
                {selectedPlantNames.map((name) => (
                  <Tag
                    key={name}
                    closable
                    onClose={() =>
                      setSelectedPlantNames((prev) =>
                        prev.filter((n) => n !== name)
                      )
                    }
                  >
                    {name}
                  </Tag>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Plant Cards */}
      {filteredAndSortedPlants.length === 0 ? (
        <Empty
          description="No plants found matching your criteria"
          style={{ margin: "50px 0" }}
        />
      ) : (
        <Row gutter={[16, 16]}>
          {filteredAndSortedPlants.map((plant) => (
            <Col xs={24} sm={12} lg={8} xl={6} key={plant.id}>
              <Card
                hoverable
                style={{ height: "100%" }}
                cover={
                  plant.images && plant.images.length > 0 ? (
                    <div style={{ height: "200px", overflow: "hidden" }}>
                      <Image
                        alt={plant.title}
                        src={plant.images[0].url}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        preview={{
                          src: plant.images[0].url,
                          mask: "Preview",
                        }}
                      />
                    </div>
                  ) : (
                    <div
                      style={{
                        height: "200px",
                        backgroundColor: "#f0f0f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text type="secondary">No Image</Text>
                    </div>
                  )
                }
                actions={[
                  <Tooltip title={plant.isLiked ? "Unlike" : "Like"}>
                    <Button
                      type="text"
                      icon={
                        plant.isLiked ? (
                          <HeartFilled style={{ color: "#ff4d4f" }} />
                        ) : (
                          <HeartOutlined />
                        )
                      }
                      onClick={() => handleHeartClick(plant.id)}
                    >
                      {plant.hearts || 0}
                    </Button>
                  </Tooltip>,
                ]}
              >
                <Meta
                  title={
                    <div>
                      <Text strong>{plant.title}</Text>
                      <br />
                      <Tag color="green" style={{ marginTop: "4px" }}>
                        {plant.plantName}
                      </Tag>
                    </div>
                  }
                  description={
                    <div>
                      <Paragraph
                        ellipsis={{ rows: 3, expandable: true }}
                        style={{ marginBottom: "12px" }}
                      >
                        {plant.content}
                      </Paragraph>

                      <Space
                        direction="vertical"
                        size="small"
                        style={{ width: "100%" }}
                      >
                        <div>
                          <CalendarOutlined style={{ marginRight: "4px" }} />
                          <Text type="secondary" style={{ fontSize: "12px" }}>
                            {formatDate(plant.timestamp)}
                          </Text>
                        </div>

                        {plant.location && (
                          <div>
                            <EnvironmentOutlined
                              style={{ marginRight: "4px" }}
                            />
                            <Text type="secondary" style={{ fontSize: "12px" }}>
                              {formatLocation(plant.location)}
                            </Text>
                          </div>
                        )}
                      </Space>
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export { PlantsPage };
export type { PlantsPageProps };
