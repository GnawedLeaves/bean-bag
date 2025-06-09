import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import {
  AstroidsParams,
  getAsteroidsApi,
  getAstronomyPictureOfTheDay,
} from "../../services/nasa";
import {
  AsteroidApiResponse,
  NasaApodObject,
  AsteroidObject,
} from "../../types/nasaTypes";
import { AsteroidScene } from "../../components/threejs/earth";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../routes";
import {
  Button,
  Card,
  Typography,
  Tag,
  Collapse,
  Row,
  Col,
  Divider,
  Space,
} from "antd";

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

const SpacePage = () => {
  const [apodData, setApodData] = useState<NasaApodObject[]>([]);
  const [asteroidDataResponse, setAsteroidDataResponse] =
    useState<AsteroidApiResponse>();
  const [showVisualization, setShowVisualization] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate(ROUTES.LOGIN.path);
      }
    });
    return () => unsubscribe();
  }, []);

  const getAPOD = async () => {
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];

    const response = await getAstronomyPictureOfTheDay({
      thumbs: true,
      date: formattedDate,
    });

    setApodData(Array.isArray(response) ? response : [response]);
  };

  const getAsteroids = async (params: AstroidsParams) => {
    const response: AsteroidApiResponse = await getAsteroidsApi(params);
    setAsteroidDataResponse(response);
  };

  const getAllAsteroids = (): AsteroidObject[] => {
    if (!asteroidDataResponse) return [];
    return Object.values(asteroidDataResponse.near_earth_objects).flat();
  };

  useEffect(() => {
    getAPOD();
    getAsteroids({});
  }, []);

  return (
    <div style={{ padding: 24 }}>
      {/* Control Buttons */}

      <Row gutter={[16, 16]}>
        {apodData.map((item, index) => (
          <Col xs={24} md={12} lg={8} key={index}>
            <Card
              hoverable
              cover={
                <img
                  alt={item.title}
                  src={item.url}
                  style={{ objectFit: "cover", maxHeight: 240 }}
                />
              }
            >
              <Text type="secondary">{item.date}</Text>
              <Title level={4}>{item.title}</Title>
              <Paragraph
                ellipsis={{ rows: 4, expandable: true, symbol: "more" }}
              >
                {item.explanation}
              </Paragraph>
            </Card>
          </Col>
        ))}
      </Row>

      <Space style={{ margin: 24 }}>
        <Button type="primary" onClick={() => getAsteroids({})}>
          Refresh Asteroids
        </Button>
        {asteroidDataResponse && (
          <Button
            danger={showVisualization}
            type="default"
            onClick={() => setShowVisualization(!showVisualization)}
          >
            {showVisualization
              ? "Hide 3D Visualization"
              : "Show 3D Visualization"}
          </Button>
        )}
      </Space>

      {/* 3D Visualization */}
      {showVisualization && asteroidDataResponse && (
        <div style={{ position: "relative", marginBottom: 24 }}>
          <div style={{ height: "80vh", background: "#000011" }}>
            <Canvas camera={{ position: [0, 5, 10], fov: 75 }}>
              <AsteroidScene asteroids={getAllAsteroids()} />
            </Canvas>
          </div>

          {/* Legend */}
          <Card
            size="small"
            title="🌌 Asteroid Visualization"
            style={{ position: "absolute", top: 16, left: 16, width: 240 }}
            headStyle={{ backgroundColor: "#141414", color: "#FFD700" }}
            bodyStyle={{ fontSize: 12 }}
          >
            <p>🌍 Blue Sphere = Earth</p>
            <p>🟡 Gold = Safe Asteroids</p>
            <p>🔴 Red = Potentially Hazardous</p>
            <p>💫 Rings = Orbital Paths</p>
            <p>🎮 Mouse: Rotate, Zoom, Pan</p>
            <Divider />
            <Text type="secondary" style={{ fontSize: 10 }}>
              Showing {Math.min(getAllAsteroids().length, 20)} asteroids
            </Text>
          </Card>

          {/* Stats */}
          <Card
            size="small"
            title="📊 Statistics"
            style={{ position: "absolute", top: 16, right: 16, width: 240 }}
            headStyle={{ backgroundColor: "#141414", color: "#FF6B6B" }}
            bodyStyle={{ fontSize: 12 }}
          >
            <p>Total Asteroids: {asteroidDataResponse.element_count}</p>
            <p>
              <Tag color="gold">
                Safe:{" "}
                {
                  getAllAsteroids().filter(
                    (a) => !a.is_potentially_hazardous_asteroid
                  ).length
                }
              </Tag>
            </p>
            <p>
              <Tag color="red">
                Hazardous:{" "}
                {
                  getAllAsteroids().filter(
                    (a) => a.is_potentially_hazardous_asteroid
                  ).length
                }
              </Tag>
            </p>
          </Card>
        </div>
      )}

      {/* Asteroid List */}
      {asteroidDataResponse && (
        <Card title="☄️ Near Earth Objects" style={{ marginBottom: 32 }}>
          <Text type="secondary">
            Total asteroids: {asteroidDataResponse.element_count}
          </Text>
          <Divider />
          <Collapse accordion>
            {Object.entries(asteroidDataResponse.near_earth_objects).map(
              ([date, asteroids]) => (
                <Panel header={date} key={date}>
                  <Space direction="vertical" style={{ width: "100%" }}>
                    {asteroids.map((asteroid) => (
                      <Card
                        key={asteroid.id}
                        type="inner"
                        title={
                          <>
                            {asteroid.name}
                            {asteroid.is_potentially_hazardous_asteroid && (
                              <Tag color="red" style={{ marginLeft: 8 }}>
                                ⚠️ Hazardous
                              </Tag>
                            )}
                          </>
                        }
                        size="small"
                      >
                        <Row justify="space-between">
                          <Col>
                            <Text type="secondary">ID: {asteroid.id}</Text>
                          </Col>
                          <Col style={{ textAlign: "right" }}>
                            <Text>
                              Magnitude: {asteroid.absolute_magnitude_h}
                            </Text>
                            <br />
                            <Text>
                              Diameter:{" "}
                              {asteroid.estimated_diameter.kilometers.estimated_diameter_min.toFixed(
                                3
                              )}{" "}
                              -{" "}
                              {asteroid.estimated_diameter.kilometers.estimated_diameter_max.toFixed(
                                3
                              )}{" "}
                              km
                            </Text>
                          </Col>
                        </Row>
                        {asteroid.close_approach_data.map((approach, idx) => (
                          <Card
                            key={idx}
                            size="small"
                            style={{
                              marginTop: 8,
                              background: "#fafafa",
                              border: "1px dashed #d9d9d9",
                            }}
                          >
                            <Text strong>
                              Close Approach:{" "}
                              {approach.close_approach_date_full}
                            </Text>
                            <br />
                            <Text>
                              Velocity:{" "}
                              {parseFloat(
                                approach.relative_velocity.kilometers_per_hour
                              ).toLocaleString()}{" "}
                              km/h
                            </Text>
                            <br />
                            <Text>
                              Miss Distance:{" "}
                              {parseFloat(
                                approach.miss_distance.kilometers
                              ).toLocaleString()}{" "}
                              km
                            </Text>
                            <br />
                            <Text>Orbiting: {approach.orbiting_body}</Text>
                          </Card>
                        ))}
                      </Card>
                    ))}
                  </Space>
                </Panel>
              )
            )}
          </Collapse>
        </Card>
      )}

      {/* APOD Section */}
    </div>
  );
};

export default SpacePage;
