import { ArrowRightOutlined } from "@ant-design/icons";
import { Flex } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled, { ThemeProvider } from "styled-components";
import { token } from "../../../theme";
import { SpotifyCurrentPlaying } from "../../../types/spotifyTypes";
interface SpotifyPlayingBarProps {
  currentPlaying?: SpotifyCurrentPlaying | null;
}

const SpotifyPlayingBarContainer = styled.div`
  border: 2px solid ${(props) => props.theme.borderColor};
  background: ${(props) => props.theme.colorBg};
  border-radius: ${(props) => props.theme.borderRadius}px;
  width: 100%;
  height: 65px;
  padding: ${(props) => props.theme.paddingSmall}px;
  overflow: hidden;
  position: relative;
`;

const SpotifyPlayingBarTrackImg = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: 1px solid ${(props) => props.theme.borderColor};
  object-fit: cover;
  border: 2px solid ${(props) => props.theme.borderColor};
  background: ${(props) => props.theme.colorBg};
`;

const ProgressBarContainer = styled.div`
  position: absolute;
  bottom: 0;
  left: -10%;
  z-index: 1;
  width: 110%;
  height: 5px;
`;

const ProgressBar = styled.div<{
  progressPercentage: number;
}>`
  background: ${(props) => props.theme.colorBgTeal};
  width: ${(props) => props.progressPercentage + 10}%;
  height: 5px;
  transition: width 0.1s linear;
  border-radius: ${(props) => props.theme.borderRadius}px;
`;

const TruncatedText = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const SongArtistDetails = styled(TruncatedText)`
  max-width: 250px;
  font-size: ${(props) => props.theme.fontSizeMed}px;
`;

const SongAlbumDetails = styled(TruncatedText)`
  max-width: 250px;
  font-size: ${(props) => props.theme.fontSizeSmall}px;
`;

const GotoSongContainer = styled.div`
  width: 35px;
  height: 35px;
  border-radius: 100%;
  background: ${(props) => props.theme.colorBgTeal};
  border: 2px solid ${(props) => props.theme.borderColor};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: ${(props) => props.theme.paddingSmall}px;
`;

const SpotifyPlayingBar = ({ currentPlaying }: SpotifyPlayingBarProps) => {
  const [localCount, setLocalCount] = useState<number>(0);
  const navigate = useNavigate();
  useEffect(() => {
    if (currentPlaying) {
      setLocalCount(currentPlaying.progress_ms);
    } else {
      setLocalCount(0);
    }
  }, [currentPlaying]);

  useEffect(() => {
    if (!currentPlaying?.is_playing) return;
    const interval = setInterval(() => {
      setLocalCount((prev) => {
        const next = prev + 1000;
        if (next > currentPlaying?.item.duration_ms) {
          return prev;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentPlaying]);

  const caluclatePercentagePlayed = (current?: number, total?: number) => {
    const minPercent = 0;
    if (!total || total === 0) return minPercent;
    if (!current) return minPercent;
    const res = (current / total) * 100;
    if (res < minPercent) return minPercent;
    else return res;
  };

  const handleNavigateToTrack = () => {
    navigate(`/spotify/track/${currentPlaying?.item?.id}`);
  };

  return (
    <ThemeProvider theme={token}>
      <Flex
        style={{
          position: "fixed",
          bottom: 70,
          left: 0,
          width: "100%",
          zIndex: 1000,
          padding: token.paddingSmall,
          display: currentPlaying ? "" : "none",
        }}
      >
        <SpotifyPlayingBarContainer onClick={handleNavigateToTrack}>
          <Flex align="center" justify="space-between">
            <Flex>
              <SpotifyPlayingBarTrackImg
                src={currentPlaying?.item?.album.images[0].url}
              />
              <Flex
                gap={4}
                vertical
                style={{
                  marginLeft: token.paddingSmall,
                }}
                justify="center"
              >
                <SongArtistDetails>
                  <span style={{ fontWeight: "bold" }}>
                    {currentPlaying?.item.name}
                  </span>{" "}
                  • {currentPlaying?.item.artists[0].name}
                </SongArtistDetails>
                <SongAlbumDetails
                  style={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "250px",
                  }}
                >
                  {currentPlaying?.item?.album?.name}
                </SongAlbumDetails>
              </Flex>
            </Flex>

            <GotoSongContainer onClick={handleNavigateToTrack}>
              <ArrowRightOutlined />
            </GotoSongContainer>
          </Flex>

          <ProgressBarContainer>
            <ProgressBar
              progressPercentage={caluclatePercentagePlayed(
                localCount,
                currentPlaying?.item.duration_ms,
              )}
            />
          </ProgressBarContainer>
        </SpotifyPlayingBarContainer>
      </Flex>
    </ThemeProvider>
  );
};

export default SpotifyPlayingBar;
