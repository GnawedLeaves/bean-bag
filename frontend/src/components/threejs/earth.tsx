import { useEffect, useState, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Sphere } from "@react-three/drei";
import * as THREE from "three";

// Type definitions
interface CloseApproachData {
  miss_distance: {
    kilometers: string;
  };
}

interface EstimatedDiameter {
  kilometers: {
    estimated_diameter_max: number;
  };
}

interface Asteroid {
  id: string;
  name: string;
  is_potentially_hazardous_asteroid: boolean;
  close_approach_data: CloseApproachData[];
  estimated_diameter: EstimatedDiameter;
}

interface AsteroidComponentProps {
  asteroid: Asteroid;
  index: number;
}

interface AsteroidSceneProps {
  asteroids: Asteroid[];
}

// Earth component
const Earth = () => {
  const earthRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.005;
    }
  });

  return (
    <Sphere ref={earthRef} args={[1, 32, 32]} position={[0, 0, 0]}>
      <meshStandardMaterial color="#4A90E2" wireframe={false} />
      <Text
        position={[0, 1.5, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        Earth
      </Text>
    </Sphere>
  );
};

// Individual Asteroid component
const Asteroid = ({ asteroid, index }: AsteroidComponentProps) => {
  const asteroidRef = useRef<THREE.Mesh>(null);
  const orbitRef = useRef<THREE.Group>(null);

  // Calculate orbital parameters based on asteroid data
  const approachData = asteroid.close_approach_data[0];
  const missDistance = parseFloat(
    approachData?.miss_distance.kilometers || "1000000"
  );

  // Scale down the distances for visualization (real distances are too large)
  const orbitRadius = Math.max(2, Math.min(15, (missDistance / 1000000) * 3));
  const asteroidSize = Math.max(
    0.02,
    Math.min(
      0.2,
      asteroid.estimated_diameter.kilometers.estimated_diameter_max * 1000
    )
  );

  // Different orbit speeds and starting positions
  const orbitSpeed = 0.01 + index * 0.005;
  const startAngle = (index * Math.PI * 2) / 10;

  useFrame((state) => {
    if (orbitRef.current && asteroidRef.current) {
      const time = state.clock.elapsedTime;
      const angle = startAngle + time * orbitSpeed;

      // Orbital motion
      orbitRef.current.rotation.y = angle;

      // Asteroid rotation
      asteroidRef.current.rotation.x += 0.02;
      asteroidRef.current.rotation.z += 0.01;
    }
  });

  return (
    <group ref={orbitRef}>
      <mesh ref={asteroidRef} position={[orbitRadius, 0, 0]}>
        <sphereGeometry args={[asteroidSize, 8, 8]} />
        <meshStandardMaterial
          color={
            asteroid.is_potentially_hazardous_asteroid ? "#FF4444" : "#FFD700"
          }
          emissive={
            asteroid.is_potentially_hazardous_asteroid ? "#440000" : "#332200"
          }
        />
      </mesh>

      {/* Orbit trail */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[orbitRadius - 0.01, orbitRadius + 0.01, 64]} />
        <meshBasicMaterial
          color={
            asteroid.is_potentially_hazardous_asteroid ? "#FF4444" : "#666666"
          }
          transparent
          opacity={0.2}
        />
      </mesh>

      {/* Asteroid label */}
      <Text
        position={[orbitRadius, asteroidSize + 0.3, 0]}
        fontSize={0.15}
        color={
          asteroid.is_potentially_hazardous_asteroid ? "#FF6666" : "#CCCCCC"
        }
        anchorX="center"
        anchorY="middle"
      >
        {asteroid.name.replace(/[()]/g, "").substring(0, 20)}
      </Text>
    </group>
  );
};

// Main 3D Scene component
export const AsteroidScene = ({ asteroids }: AsteroidSceneProps) => {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />

      {/* Earth */}
      <Earth />

      {/* Asteroids */}
      {asteroids.slice(0, 20).map((asteroid, index) => (
        <Asteroid key={asteroid.id} asteroid={asteroid} index={index} />
      ))}

      {/* Stars background */}
      {Array.from({ length: 200 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            (Math.random() - 0.5) * 100,
            (Math.random() - 0.5) * 100,
            (Math.random() - 0.5) * 100,
          ]}
        >
          <sphereGeometry args={[0.05, 4, 4]} />
          <meshBasicMaterial color="white" />
        </mesh>
      ))}

      {/* Camera controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={3}
        maxDistance={30}
      />
    </>
  );
};
