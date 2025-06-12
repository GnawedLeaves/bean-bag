import { useEffect, useState, useRef } from "react";
import {
  Draggable3DImageContainer,
  ImageWrapper,
  RotatingCard,
} from "./BlogDraggable3DImageStyles";
import {
  BlogImageDateStamp,
  BlogImagee,
} from "../blogImagesComponent/BlogImages";
import { Image } from "antd";
import { token } from "../../../theme";

interface Draggable3DImageProps {
  src: string;
  date: string;
  randomId: string;
  zIndex: number;
}

const BlogDraggable3DImage = ({
  src,
  date,
  randomId,
  zIndex,
}: Draggable3DImageProps) => {
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
      zIndex={zIndex}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <ImageWrapper>
        <RotatingCard
          rotateX={rotate.x}
          rotateY={rotate.y}
          url={src}
          thickness={5}
        >
          <div className="left-edge" />
          <div className="top-edge" />
          <Image
            width={"100%"}
            height={200}
            src={src}
            style={{
              objectFit: "cover",
              border: `2px solid ${token.borderColor}`,
            }}
          />
          {/* <BlogImagee src={src} /> */}
          <BlogImageDateStamp>
            {date}
            <br />
            {randomId}
          </BlogImageDateStamp>
        </RotatingCard>
      </ImageWrapper>
    </Draggable3DImageContainer>
  );
};

export default BlogDraggable3DImage;
