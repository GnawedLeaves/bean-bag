import { useEffect, useState, useRef } from "react";
import {
  Draggable3DImageContainer,
  RotatingImage,
  ImageWrapper,
} from "./Draggable3DImageStyles";

interface Draggable3DImageProps {
  url: string;
  songCount?: number; // Make it optional with a default value
}

const Draggable3DImage = ({ url, songCount = 0 }: Draggable3DImageProps) => {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [lastPos, setLastPos] = useState<{ x: number; y: number } | null>(null);
  const animationRef = useRef<number | undefined>(undefined);

  const clamp = (val: number, min: number, max: number) =>
    Math.max(min, Math.min(val, max));

  const springBack = () => {
    setRotate((prev) => {
      const newX = prev.x * 0.9;
      const newY = prev.y * 0.9;

      if (Math.abs(newX) < 0.1 && Math.abs(newY) < 0.1) {
        cancelAnimationFrame(animationRef.current!);
        return { x: 0, y: 0 };
      }

      animationRef.current = requestAnimationFrame(springBack);
      return { x: newX, y: newY };
    });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    const touch = e.touches[0];
    setLastPos({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!lastPos) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - lastPos.x;
    const deltaY = touch.clientY - lastPos.y;

    setRotate((prev) => ({
      x: clamp(prev.x - deltaY * 0.3, -30, 30),
      y: clamp(prev.y + deltaX * 0.3, -30, 30),
    }));

    setLastPos({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = () => {
    setLastPos(null);
    animationRef.current = requestAnimationFrame(springBack);
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <Draggable3DImageContainer
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <ImageWrapper>
        <RotatingImage
          rotateX={rotate.x}
          rotateY={rotate.y}
          url={url}
          thickness={Math.min(60, Math.max(10, songCount * 0.75))} // Convert songCount to thickness (min 20px, max 40px)
        >
          <div className="left-edge" />
          <div className="top-edge" />
        </RotatingImage>
      </ImageWrapper>
    </Draggable3DImageContainer>
  );
};

export default Draggable3DImage;
