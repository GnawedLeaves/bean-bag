import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getSpotifyArtist,
  getSpotifyPlaylist,
} from "../../services/spotify/spotify";
import { useUser } from "../../contexts/UserContext";
import { SpotifyArtist, SpotifyPlaylist } from "../../types/spotifyTypes";
import { Typography, Tag, Button, Card, Space, Image, Spin } from "antd";

const { Title, Text, Paragraph } = Typography;

const SpotifyPlaylistDetailsPage = () => {
  const { user, spotifyToken, loading } = useUser();
  const { playlistId } = useParams();
  const [spotifyPlaylist, setSpotifyPlaylist] = useState<SpotifyPlaylist>();
  const [isLoading, setIsLoading] = useState(true);

  const handleGetPlaylist = async () => {
    if (!playlistId || !spotifyToken?.accessToken) return;
    try {
      const response = await getSpotifyPlaylist(
        playlistId,
        spotifyToken?.accessToken
      );
      setSpotifyPlaylist(response);
    } catch (error) {
      console.error("Failed to fetch playlist", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && spotifyToken) {
      handleGetPlaylist();
    }
  }, [spotifyToken, loading]);

  if (isLoading || !spotifyPlaylist) {
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
            alt="Playlist"
            src={spotifyPlaylist.images?.[0]?.url}
            preview={false}
            style={{ borderRadius: "8px 8px 0 0", objectFit: "cover" }}
          />
        }
        style={{ borderRadius: 8 }}
      >
        <Title level={3}>{spotifyPlaylist.name}</Title>
        <Text>{spotifyPlaylist.description}</Text>
        <Text>Made by: {spotifyPlaylist.owner.display_name}</Text>

        <br />
        <Paragraph style={{ marginTop: 16 }}>
          <Text strong>Tracks:</Text>
          <br />
          <Space wrap>
            {spotifyPlaylist.tracks.items.map((track, index) => (
              <Tag key={index} color="green">
                {track.track.name}
              </Tag>
            ))}
          </Space>
        </Paragraph>
        <Button
          type="primary"
          block
          href={spotifyPlaylist.external_urls.spotify}
          target="_blank"
          rel="noopener noreferrer"
        >
          View on Spotify
        </Button>
      </Card>
    </div>
  );
};

export default SpotifyPlaylistDetailsPage;
