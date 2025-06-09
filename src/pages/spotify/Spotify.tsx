import { useEffect, useState } from "react";
import { useUser } from "../../contexts/UserContext";
import { ThemeProvider } from "styled-components";
import { appTheme } from "../../theme";
import { Button, Flex, Input, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../routes";
import {
  getSpotifyAlbum,
  getSpotifyArtist,
  getSpotifyTrack,
} from "../../services/spotify/spotify";
import { SpotifyLinkInfo } from "../../types/spotifyTypes";

const SpotifyPage = () => {
  const { user, spotifyToken, loading } = useUser();
  const navigate = useNavigate();
  const [inputTrackLink, setInputTrackLink] = useState<string>("");
  const [inputTrackId, setInputTrackId] = useState<string | null>("");
  const [inputAlbumId, setInputAlbumId] = useState<string | null>("");

  const [isTrackLoading, setIsTrackLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const extractSpotifyLinkInfo = (url: string): SpotifyLinkInfo => {
    try {
      const parsedUrl = new URL(url);
      const parts = parsedUrl.pathname.split("/").filter(Boolean);

      const [type, id] = parts;

      if ((type === "track" || type === "album" || type === "artist") && id) {
        return {
          id,
          type,
          link: url,
        };
      }

      return null;
    } catch {
      return null;
    }
  };

  const handleGoToTrackDetails = async () => {
    const linkObj = extractSpotifyLinkInfo(inputTrackLink);
    if (linkObj?.type === "track" && spotifyToken) {
      setInputTrackId(linkObj?.id);
      setIsTrackLoading(true);
      const response = await getSpotifyTrack(
        linkObj.id,
        spotifyToken.accessToken
      );

      if (response) {
        setIsTrackLoading(false);
        navigate(ROUTES.SPOTIFY_TRACK.path.replace(":trackId", linkObj.id));
      } else {
        setIsTrackLoading(false);
        setErrorMessage("Unable to find track");
      }
    } else if (linkObj?.type === "album" && spotifyToken) {
      setInputAlbumId(linkObj?.id);
      setIsTrackLoading(true);
      const response = await getSpotifyAlbum(
        linkObj.id,
        spotifyToken.accessToken
      );
      if (response) {
        setIsTrackLoading(false);
        navigate(ROUTES.SPOTIFY_ALBUM.path.replace(":albumId", linkObj.id));
      } else {
        setIsTrackLoading(false);
        setErrorMessage("Unable to find album");
      }
    } else if (linkObj?.type === "artist" && spotifyToken) {
      // setInputAlbumId(linkObj?.id);
      setIsTrackLoading(true);
      const response = await getSpotifyArtist(
        linkObj.id,
        spotifyToken.accessToken
      );
      if (response) {
        setIsTrackLoading(false);
        navigate(ROUTES.SPOTIFY_ARTIST.path.replace(":artistId", linkObj.id));
      } else {
        setIsTrackLoading(false);
        setErrorMessage("Unable to find album");
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
          placeholder="Album or Track or Artist Link"
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
          {isTrackLoading ? <Spin size="default" /> : "Find "}
        </Button>
      </Flex>
      {errorMessage !== "" && (
        <div style={{ color: appTheme.colorBgRed }}>{errorMessage}</div>
      )}

      <div>Recent Tracks (10)</div>
    </ThemeProvider>
  );
};

export default SpotifyPage;
