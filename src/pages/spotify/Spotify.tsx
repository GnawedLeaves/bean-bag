import { useEffect, useState } from "react";
import { useUser } from "../../contexts/UserContext";
import { ThemeProvider } from "styled-components";
import { appTheme } from "../../theme";
import { Button, Flex, Input, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../routes";
import { getSpotifyTrack } from "../../services/spotify/spotify";

const SpotifyPage = () => {
  const { user, spotifyToken, loading } = useUser();
  const navigate = useNavigate();
  const [inputTrackLink, setInputTrackLink] = useState<string>("");
  const [inputTrackId, setInputTrackId] = useState<string | null>("");
  const [isTrackLoading, setIsTrackLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const extractTrackId = (url: string): string | null => {
    try {
      const pathname = new URL(url).pathname;
      const parts = pathname.split("/");
      return parts[1] === "track" ? parts[2] : null;
    } catch {
      return null;
    }
  };

  const handleGoToTrackDetails = async () => {
    const trackId = extractTrackId(inputTrackLink);
    setInputTrackId(trackId);

    if (trackId && spotifyToken) {
      setIsTrackLoading(true);
      const response = await getSpotifyTrack(trackId, spotifyToken.accessToken);

      if (response) {
        setIsTrackLoading(false);
        navigate(ROUTES.SPOTIFY_TRACK.path.replace(":trackId", trackId));
      } else {
        setIsTrackLoading(false);
        setErrorMessage("Unable to find track");
      }
    } else {
      setErrorMessage("Invalid URL");
    }
  };
  useEffect(() => {
    if (!loading) {
    }
  }, [loading]);
  return (
    <ThemeProvider theme={appTheme}>
      <Flex>
        <Input
          disabled={isTrackLoading}
          placeholder="Track Link"
          onChange={(e) => {
            setErrorMessage("");
            setInputTrackLink(e.target.value);
          }}
        />
        <Button
          onClick={() => {
            handleGoToTrackDetails();
          }}
        >
          {isTrackLoading ? <Spin size="default" /> : "Find Track"}
        </Button>
      </Flex>
      {errorMessage !== "" && (
        <div style={{ color: appTheme.colorBgRed }}>{errorMessage}</div>
      )}

      <Button
        onClick={() => {
          navigate(
            ROUTES.SPOTIFY_ARTIST.path.replace(
              ":artistId",
              "4Z8W4fKeB5YxbusRsdQVPb"
            )
          );
        }}
      >
        Radiohead
      </Button>
      <Button
        onClick={() => {
          navigate(
            ROUTES.SPOTIFY_TRACK.path.replace(
              ":trackId",
              "11dFghVXANMlKmJXsNCbNl"
            )
          );
        }}
      >
        Go to track
      </Button>
    </ThemeProvider>
  );
};

export default SpotifyPage;
