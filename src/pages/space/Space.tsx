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

const SpacePage = () => {
  const [apodData, setApodData] = useState<NasaApodObject[]>([]);
  const [asteroidDataResponse, setAsteroidDataResponse] =
    useState<AsteroidApiResponse>();
  const [showVisualization, setShowVisualization] = useState(false);

  const getAPOD = async () => {
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];

    const response = await getAstronomyPictureOfTheDay({
      //   count: 5,
      thumbs: true,
      date: formattedDate,
    });
    console.log({ response });
    if (Array.isArray(response)) setApodData(response);
    else {
      setApodData([response]);
    }
  };

  const getAsteroids = async (params: AstroidsParams) => {
    const response: AsteroidApiResponse = await getAsteroidsApi(params);
    console.log({ response });
    setAsteroidDataResponse(response);
  };

  // Get all asteroids from the response
  const getAllAsteroids = (): AsteroidObject[] => {
    if (!asteroidDataResponse) return [];
    return Object.values(asteroidDataResponse.near_earth_objects).flat();
  };

  useEffect(() => {
    getAPOD();
    getAsteroids({});
  }, []);

  return (
    <>
      {/* Control Buttons */}
      <div style={{ padding: 24, display: "flex", gap: 12 }}>
        <button
          onClick={() => {
            getAsteroids({});
          }}
          style={{
            padding: "8px 16px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          Get Asteroids
        </button>

        {asteroidDataResponse && (
          <button
            onClick={() => setShowVisualization(!showVisualization)}
            style={{
              backgroundColor: showVisualization ? "#ff4444" : "#2196F3",
              color: "white",
              border: "none",
              padding: "8px 16px",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            {showVisualization
              ? "Hide 3D Visualization"
              : "Show 3D Visualization"}
          </button>
        )}
      </div>

      {/* 3D Asteroid Visualization */}
      {showVisualization && asteroidDataResponse && (
        <div
          style={{
            height: "80vh",
            width: "100%",
            backgroundColor: "#000011",
            position: "relative",
            marginBottom: 24,
          }}
        >
          <Canvas camera={{ position: [0, 5, 10], fov: 75 }}>
            <AsteroidScene asteroids={getAllAsteroids()} />
          </Canvas>

          {/* Legend */}
          <div
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              color: "white",
              backgroundColor: "rgba(0,0,0,0.8)",
              padding: 16,
              borderRadius: 8,
              fontSize: 12,
              fontFamily: "Arial, sans-serif",
            }}
          >
            <h4 style={{ margin: 0, marginBottom: 8, color: "#FFD700" }}>
              🌌 Asteroid Visualization
            </h4>
            <div style={{ marginBottom: 4 }}>🌍 Blue Sphere = Earth</div>
            <div style={{ marginBottom: 4 }}>🟡 Gold = Safe Asteroids</div>
            <div style={{ marginBottom: 4 }}>
              🔴 Red = Potentially Hazardous
            </div>
            <div style={{ marginBottom: 4 }}>💫 Rings = Orbital Paths</div>
            <div style={{ marginBottom: 8 }}>🎮 Mouse: Rotate, Zoom, Pan</div>
            <div style={{ fontSize: 10, color: "#888" }}>
              Showing {Math.min(getAllAsteroids().length, 20)} asteroids
            </div>
          </div>

          {/* Stats Panel */}
          <div
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              color: "white",
              backgroundColor: "rgba(0,0,0,0.8)",
              padding: 16,
              borderRadius: 8,
              fontSize: 12,
              fontFamily: "Arial, sans-serif",
            }}
          >
            <h4 style={{ margin: 0, marginBottom: 8, color: "#FF6B6B" }}>
              📊 Statistics
            </h4>
            <div>Total Asteroids: {asteroidDataResponse.element_count}</div>
            <div style={{ color: "#FFD700" }}>
              Safe:{" "}
              {
                getAllAsteroids().filter(
                  (a) => !a.is_potentially_hazardous_asteroid
                ).length
              }
            </div>
            <div style={{ color: "#FF4444" }}>
              Hazardous:{" "}
              {
                getAllAsteroids().filter(
                  (a) => a.is_potentially_hazardous_asteroid
                ).length
              }
            </div>
          </div>
        </div>
      )}

      {/* Asteroid Data Display */}
      {asteroidDataResponse && (
        <div
          style={{
            margin: 24,
            padding: 16,
            border: "2px solid #333",
            borderRadius: 8,
            backgroundColor: "#f5f5f5",
          }}
        >
          <h2 style={{ marginTop: 0, color: "#333" }}>Near Earth Objects</h2>
          <p style={{ color: "#666", fontSize: 14 }}>
            Total asteroids: {asteroidDataResponse.element_count}
          </p>

          {Object.entries(asteroidDataResponse.near_earth_objects).map(
            ([date, asteroids]) => (
              <div key={date} style={{ marginBottom: 20 }}>
                <h3
                  style={{
                    color: "#444",
                    borderBottom: "1px solid #ccc",
                    paddingBottom: 4,
                  }}
                >
                  {date}
                </h3>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  {asteroids.map((asteroid) => (
                    <div
                      key={asteroid.id}
                      style={{
                        border: "1px solid #ddd",
                        borderRadius: 6,
                        padding: 12,
                        backgroundColor:
                          asteroid.is_potentially_hazardous_asteroid
                            ? "#fff5f5"
                            : "white",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                        }}
                      >
                        <div>
                          <h4
                            style={{ margin: 0, color: "#333", fontSize: 16 }}
                          >
                            {asteroid.name}
                            {asteroid.is_potentially_hazardous_asteroid && (
                              <span
                                style={{
                                  color: "red",
                                  fontSize: 12,
                                  marginLeft: 8,
                                }}
                              >
                                ⚠️ Potentially Hazardous
                              </span>
                            )}
                          </h4>
                          <p
                            style={{
                              margin: "4px 0",
                              fontSize: 12,
                              color: "#666",
                            }}
                          >
                            ID: {asteroid.id}
                          </p>
                        </div>
                        <div
                          style={{
                            textAlign: "right",
                            fontSize: 12,
                            color: "#666",
                          }}
                        >
                          <div>Magnitude: {asteroid.absolute_magnitude_h}</div>
                          <div>
                            Diameter:{" "}
                            {asteroid.estimated_diameter.kilometers.estimated_diameter_min.toFixed(
                              3
                            )}{" "}
                            -{" "}
                            {asteroid.estimated_diameter.kilometers.estimated_diameter_max.toFixed(
                              3
                            )}{" "}
                            km
                          </div>
                        </div>
                      </div>

                      {asteroid.close_approach_data.map((approach, index) => (
                        <div
                          key={index}
                          style={{
                            marginTop: 8,
                            padding: 8,
                            backgroundColor: "#f9f9f9",
                            borderRadius: 4,
                          }}
                        >
                          <div style={{ fontSize: 12, color: "#555" }}>
                            <strong>Close Approach:</strong>{" "}
                            {approach.close_approach_date_full}
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color: "#555",
                              marginTop: 2,
                            }}
                          >
                            <strong>Velocity:</strong>{" "}
                            {parseFloat(
                              approach.relative_velocity.kilometers_per_hour
                            ).toLocaleString()}{" "}
                            km/h
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color: "#555",
                              marginTop: 2,
                            }}
                          >
                            <strong>Miss Distance:</strong>{" "}
                            {parseFloat(
                              approach.miss_distance.kilometers
                            ).toLocaleString()}{" "}
                            km
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color: "#555",
                              marginTop: 2,
                            }}
                          >
                            <strong>Orbiting:</strong> {approach.orbiting_body}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      )}

      <div
        style={{
          display: "flex",
          gap: 8,
          flexDirection: "column",
          margin: 24,
        }}
      >
        {apodData.map((item, index) => {
          return (
            <div
              key={index}
              style={{
                border: "1px solid grey",
                borderRadius: 4,
                padding: 8,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div style={{ fontSize: 11, color: "grey" }}>{item.date}</div>
              <div style={{ fontSize: 24, fontWeight: "bold" }}>
                {item.title}
              </div>
              <img
                src={item.url}
                style={{
                  objectFit: "contain",
                  width: "100%",
                  borderRadius: 4,
                }}
              />
              <div>{item.explanation}</div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default SpacePage;
