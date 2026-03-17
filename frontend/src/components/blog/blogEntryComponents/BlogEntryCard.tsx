// src/components/blog/EntryCard.tsx
import React from "react";
import styled from "styled-components";

const Card = styled.article`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const CardHeader = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #eee;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.5rem;
`;

const Metadata = styled.div`
  color: #666;
  font-size: 0.9rem;
  margin-top: 0.5rem;
`;

const Content = styled.div`
  padding: 1rem;
  white-space: pre-wrap;
`;

const ImagesContainer = styled.div`
  display: flex;
  overflow-x: auto;
  gap: 0.5rem;
  padding: 1rem;

  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #ddd;
    border-radius: 3px;
  }
`;

const Image = styled.img`
  height: 200px;
  min-width: 200px;
  object-fit: cover;
  border-radius: 4px;
`;

interface EntryCardProps {
  entry: {
    id: string;
    title: string;
    content: string;
    timestamp: string;
    location: {
      latitude: number;
      longitude: number;
      city?: string;
      country?: string;
    };
    images: {
      id: string;
      url: string;
    }[];
  };
}

const EntryCard: React.FC<EntryCardProps> = ({ entry }) => {
  const { title, content, timestamp, location, images } = entry;

  const formattedDate = new Date(timestamp).toLocaleString();
  const locationDisplay =
    location.city && location.country
      ? `${location.city}, ${location.country}`
      : `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;

  return (
    <Card>
      <CardHeader>
        <Title>{title}</Title>
        <Metadata>
          {formattedDate} • {locationDisplay}
        </Metadata>
      </CardHeader>

      <Content>{content}</Content>

      {images && images.length > 0 && (
        <ImagesContainer>
          {images.map((image) => (
            <Image key={image.id} src={image.url} alt={title} />
          ))}
        </ImagesContainer>
      )}
    </Card>
  );
};

export default EntryCard;
