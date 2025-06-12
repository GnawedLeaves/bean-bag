import styled from "styled-components";
import { BlogImage } from "../../../types/blogTypes";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons";
import BlogDraggable3DImage from "../blogDraggable3DImage/BlogDraggable3DImage";
interface BlogImagesProps {
  images: BlogImage[];
  date: string;
}

interface BlogImageCardProps {
  zIndex: number;
}

interface ImageTransform {
  rotate: number;
  translateX: number;
  translateY: number;
}

export const BlogImagesContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  position: relative;
  align-items: center;
  gap: 16px;
  height: 300px;
`;

export const BlogImageCard = styled.div<BlogImageCardProps>`
  border: 2px solid ${(props) => props.theme.borderColor};
  padding: ${(props) => props.theme.paddingMed}px;
  align-items: center;
  gap: 8px;
  width: 150px;
  height: 300px;
  background: ${(props) => props.theme.colorBg};
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.25);
  transition: transform 0.3s ease;
  position: absolute;
  z-index: ${(props) => props.zIndex};
`;

export const BlogImageDateStamp = styled.div`
  position: absolute;
  bottom: 8px;
  right: 8px;
  color: ${(props) => props.theme.textSecondary};
  font-size: ${(props) => props.theme.fontSizeSmall}px;
  opacity: 0.5;
  text-align: right;
`;

export const BlogImagee = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  border: 2px solid ${(props) => props.theme.borderColor};
`;

export const ArrowContainer = styled.div`
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.25);
  padding: ${(props) => props.theme.paddingSmall}px;
  border-radius: 50%;
  border: 2px solid ${(props) => props.theme.borderColor};
  color: ${(props) => props.theme.text};
`;

const generateRandomTransforms = (count: number): ImageTransform[] => {
  const transforms: ImageTransform[] = [];
  const PI_4 = Math.PI / 10;

  for (let i = 0; i < count; i++) {
    transforms.push({
      rotate: (Math.random() * 2 - 1) * PI_4,
      translateX: Math.floor(Math.random() * 100) - 50,
      translateY: Math.floor(Math.random() * 41) - 20,
    });
  }

  return transforms;
};
const BlogImages = ({ images, date }: BlogImagesProps) => {
  const [pageCount, setPageCount] = useState<number>(0);

  const maxPages = useMemo(() => {
    return images?.length || 0;
  }, [images]);

  const transforms = useMemo(() => {
    return generateRandomTransforms(maxPages);
  }, [maxPages]);

  const generateRandomId = (): string => {
    const firstLength = Math.floor(Math.random() * 3) + 1;
    const secondLength = Math.floor(Math.random() * 5) + 1;
    const firstPart = Math.floor(Math.random() * Math.pow(10, firstLength));
    const secondPart = Math.floor(Math.random() * Math.pow(10, secondLength));

    return `${firstPart.toString().padStart(2, "0")}-${secondPart
      .toString()
      .padStart(5, "0")}`;
  };

  const handleIncreasePage = () => {
    if (pageCount + 1 > maxPages - 1) {
      setPageCount(0);
    } else {
      setPageCount((prev) => prev + 1);
    }
  };

  const handleDecreasePage = () => {
    if (pageCount - 1 < 0) {
      setPageCount(maxPages - 1);
    } else {
      setPageCount((prev) => prev - 1);
    }
  };

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <BlogImagesContainer>
      {maxPages > 1 && (
        <ArrowContainer onClick={handleDecreasePage}>
          <ArrowLeftOutlined />
        </ArrowContainer>
      )}

      {images.map((image, index) => {
        const transform = transforms[index] || {
          rotate: 0,
          translateX: 0,
          translateY: 0,
        };

        return index === pageCount ? (
          <BlogDraggable3DImage
            key={image.url}
            zIndex={pageCount === index ? maxPages : maxPages - index}
            src={image.url}
            date={date}
            randomId={generateRandomId()}
          />
        ) : (
          <BlogImageCard
            key={image.url}
            zIndex={pageCount === index ? maxPages : maxPages - index}
            style={{
              transform: `rotate(${transform.rotate}rad) 
                         translateX(${transform.translateX}px) 
                         translateY(${transform.translateY}px)`,
            }}
          >
            <BlogImagee src={image.url} />
            <BlogImageDateStamp>
              {date}
              <br />
              {generateRandomId()}
            </BlogImageDateStamp>
          </BlogImageCard>
        );
      })}

      {maxPages > 1 && (
        <ArrowContainer onClick={handleIncreasePage}>
          <ArrowRightOutlined />
        </ArrowContainer>
      )}
    </BlogImagesContainer>
  );
};

export default BlogImages;
