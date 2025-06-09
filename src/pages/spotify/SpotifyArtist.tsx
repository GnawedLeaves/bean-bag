import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getSpotifyArtist } from "../../services/spotify/spotify";
import { useUser } from "../../contexts/UserContext";
import { SpotifyArtist } from "../../types/spotifyTypes";
import { Typography, Tag, Button, Card, Space, Image, Spin } from "antd";

const { Title, Text, Paragraph } = Typography;

const SpotifyArtistDetailsPage = () => {
  const { user, spotifyToken, loading } = useUser();
  const { artistId } = useParams();
  const [spotifyArtist, setSpotifyArtist] = useState<SpotifyArtist>();
  const [isLoading, setIsLoading] = useState(true);

  const handleGetArtist = async () => {
    if (!artistId || !spotifyToken?.accessToken) return;
    try {
      const response = await getSpotifyArtist(
        artistId,
        spotifyToken?.accessToken
      );
      setSpotifyArtist(response);
    } catch (error) {
      console.error("Failed to fetch artist", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && spotifyToken) {
      handleGetArtist();
    }
  }, [spotifyToken, loading]);

  if (isLoading || !spotifyArtist) {
    return (
      <div style={{ textAlign: "center", marginTop: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: "16px", maxWidth: 600, margin: "0 auto" }}>
      <Card
        cover={
          <Image
            alt="Artist"
            src={spotifyArtist.images?.[0]?.url}
            preview={false}
            style={{ borderRadius: "8px 8px 0 0", objectFit: "cover" }}
          />
        }
        style={{ borderRadius: 8 }}
      >
        <Title level={3}>{spotifyArtist.name}</Title>
        <Text type="secondary">
          Followers: {spotifyArtist.followers.total.toLocaleString()}
        </Text>
        <br />
        <Text>Popularity: {spotifyArtist.popularity}/100</Text>
        <Paragraph style={{ marginTop: 16 }}>
          <Text strong>Genres:</Text>
          <br />
          <Space wrap>
            {spotifyArtist.genres.map((genre) => (
              <Tag key={genre} color="green">
                {genre}
              </Tag>
            ))}
          </Space>
        </Paragraph>
        <Button
          type="primary"
          block
          href={spotifyArtist.external_urls.spotify}
          target="_blank"
          rel="noopener noreferrer"
        >
          View on Spotify
        </Button>
      </Card>
    </div>
  );
};

export default SpotifyArtistDetailsPage;
