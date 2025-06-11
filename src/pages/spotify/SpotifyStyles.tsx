import styled, { keyframes } from "styled-components";
import { AppTheme } from "../../theme";
declare module "styled-components" {
  export interface DefaultTheme extends AppTheme {}
}
export const AlbumContainer = styled.div``;

export const CommentCard = styled.div`
  border: 1px solid ${(props) => props.theme.borderColor};
  border-top-left-radius: ${(props) => props.theme.borderRadius}px;
  border-top-right-radius: ${(props) => props.theme.borderRadius}px;
  border-bottom-right-radius: ${(props) => props.theme.borderRadius}px;
  border-bottom-left-radius: 0; /* No radius here */
  display: flex;
  align-items: center;
  position: relative;
  padding: ${(props) => props.theme.paddingMed}px;
  gap: 8px;
  width: 100%;
`;
export const CommentCardDisplayPic = styled.img`
  width: 50px;
  border-radius: 100%;
  height: 100%;
  object-fit: cover;
`;
export const CommentCardName = styled.div`
  font-size: ${(props) => props.theme.fontSizeSmall}px;
`;

export const CommentCardContent = styled.div`
  font-size: ${(props) => props.theme.fontSizeMed}px;
`;
export const CommentCardDate = styled.div`
  position: absolute;
  right: ${(props) => props.theme.paddingMed}px;
  top: ${(props) => props.theme.paddingSmall}px;
  color: ${(props) => props.theme.textSecondary};
  font-size: ${(props) => props.theme.fontSizeSmall}px;
`;

export const CommentButton = styled.button`
  border: none;
  background: ${(props) => props.theme.colorBgTeal};
  padding: ${(props) => props.theme.paddingSmall}px
    ${(props) => props.theme.paddingMed}px;
  border: 1px solid ${(props) => props.theme.borderColor};
  border-radius: ${(props) => props.theme.borderRadius}px;
  font-size: ${(props) => props.theme.fontSizeMed}px;
`;

export const SpotifyFeaturedContainer = styled.div`
  padding: 32px;
  padding-top: 64px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;
export const SpotifyFeaturedImg = styled.img`
  width: 100%;
  height: auto;
  object-fit: cover;
  // border: 1px solid ${(props) => props.theme.borderColor};
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
  margin-top: ${(props) => props.theme.paddingMed}px;
  margin-bottom: ${(props) => props.theme.paddingMed}px;
`;

export const SpotifyBodyContainer = styled.div`
  border: 2px solid ${(props) => props.theme.borderColor};
  border-top-left-radius: 32px;
  border-top-right-radius: 32px;
  min-height: 50vh;
  border-bottom: none;
  padding: ${(props) => props.theme.paddingMed}px;
  background: ${(props) => props.theme.colorBg};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding-top: ${(props) => props.theme.paddingLg}px;
`;

export const SpotifyBigContainer = styled.div`
  background: ${(props) => props.theme.colorBgTeal};
  min-height: 100vh;
`;

export const SpotifyBackButton = styled.button`
  position: absolute;
  left: 16px;
  top: 16px;
  border: none;
  border: 2px solid ${(props) => props.theme.borderColor};
  border-radius: 100%;
  display: flex;
  padding: ${(props) => props.theme.paddingSmall}px;
  background: ${(props) => props.theme.colorBg};
`;

export const SpotifyShareButton = styled.button`
  position: absolute;
  right: 16px;
  top: 16px;
  border: none;
  // border: 2px solid ${(props) => props.theme.borderColor};
  border-radius: 100%;
  display: flex;
  padding: ${(props) => props.theme.paddingSmall}px;
  // background: ${(props) => props.theme.colorBg};
  background: transparent;
  font-size: ${(props) => props.theme.fontSizeLg}px;
`;

export const SpoitfyTrackTitle = styled.div`
  font-size: ${(props) => props.theme.fontSizeHuge}px;
  font-weight: bold;
  text-align: center;
  color: ${(props) => props.theme.text};
`;

export const SpoitfyTrackSubTitle = styled.div`
  font-size: 18px;
  color: ${(props) => props.theme.text};
`;

export const SpotifyButtonsContainer = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-around;
`;

export const SpotifyButtonSmall = styled.button`
  border: none;
  border: 2px solid ${(props) => props.theme.borderColor};
  border-radius: 100%;
  width: 50px;
  height: 50px;
  background: ${(props) => props.theme.colorBgTeal};
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(props) => props.theme.colorBg};
`;

export const SpotifyButtonSmallText = styled.div`
  // color: ${(props) => props.theme.textSecondary};
`;

export const SpotifyTrackPlayButton = styled.button`
  border: none;
  border: 3px solid ${(props) => props.theme.borderColor};
  border-radius: 100%;
  width: 100px;
  height: 100px;
  background: ${(props) => props.theme.colorBgTeal};
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(props) => props.theme.colorBg};
  // box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`;

export const SpotifyRatingContainer = styled.div`
  display: flex;
  gap: 8px;
  padding: ${(props) => props.theme.paddingMed}px;
  align-items: center;
  border: 2px solid ${(props) => props.theme.borderColor};
  border-radius: ${(props) => props.theme.borderRadius}px;
  background: ${(props) => props.theme.colorBg};
`;
export const SpotifyRatingNumber = styled.div``;
export const SpotifyRatingDisplay = styled.img`
  width: 50px;
  height: 50px;
  border: 1px solid ${(props) => props.theme.borderColor};
  border-radius: 100%;
`;

export const BarBigContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const SpotifyBarContainer = styled.div`
  width: 100%;
  border: 2px solid ${(props) => props.theme.borderColor};
  border-radius: 20px;
  height: 40px;
  background: ${(props) => props.theme.colorBg};
  display: flex;
  padding: 3px;
  gap: 12px;
  align-items: center;
`;
const widthAnimation = keyframes`
  0% {
    width: 10%;
  }
  // 50% {
  //   width: 100%;
  // }
  95% {
    width: 100%;
  }
    100%{
     width: 10%;
    }
`;
const gradientAnimation = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

export const SpotifyBarInnerContainer = styled.div<{ trackDuration: number }>`
  border: 2px solid ${(props) => props.theme.borderColor};
  border-radius: ${(props) => props.theme.borderRadius}px;
  background: linear-gradient(
    90deg,
    ${(props) => props.theme.colorBgTeal} 0%,
    ${(props) => props.theme.colorBgGreen} 25%,
    ${(props) => props.theme.colorBgLightYellow} 50%,
    ${(props) => props.theme.colorBgVoliet} 75%,
    ${(props) => props.theme.colorBgTeal} 100%
  );
  background-size: 200% 100%;
  height: 30px;
  width: 10%;
  animation: ${widthAnimation} ${(props) => props.trackDuration}s ease-in-out
      infinite,
    ${gradientAnimation} 5s ease-in-out infinite;
`;
export const SpotifyBarInnerContainerText = styled.span`
  color: ${(props) => props.theme.textSecondary};
`;

export const SpotifyAlbumContainer = styled.div`
  display: flex;
  width: 150px;
  align-items: center;
  gap: 12px;
  padding: ${(props) => props.theme.paddingSmall}px;
  border: 2px solid ${(props) => props.theme.borderColor};
  background: ${(props) => props.theme.colorBg};
  cursor: pointer;
  transition: background-color 0.2s;
  flex-direction: column;
`;

export const SpotifyAlbumPicture = styled.img`
  width: 100%;
  object-fit: cover;
`;

export const SpotifyMain = styled.div`
  // padding: ${(props) => props.theme.paddingLg}px;
  background: ${(props) => props.theme.colorBgTeal};
  min-height: 100vh;
`;

export const SpotifyHeroContainer = styled.div`
  height: 200px;
  padding: ${(props) => props.theme.paddingMed}px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;
export const SpotifyHeroTitle = styled.div`
  font-size: ${(props) => props.theme.fontSizeHuge}px;
  font-weight: bold;
`;

export const SpotifyHeroSubtitle = styled.div`
  width: 80%;
  text-align: center;
`;

export const SpotifyMainBodyContainer = styled.div`
  background: ${(props) => props.theme.colorBg};
  border: 2px solid ${(props) => props.theme.borderColor};
  border-top-left-radius: 32px;
  border-top-right-radius: 32px;
  min-height: 100vh;
  border-bottom: none;
  padding: ${(props) => props.theme.paddingMed}px;
  background: ${(props) => props.theme.colorBg};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  padding-top: ${(props) => props.theme.paddingLg}px;
`;

export const SpotifySearchContainer = styled.div`
  display: flex;
  gap: 8px;
  flex-direction: column;
`;
export const SpotifySearchTitle = styled.div`
  font-size: ${(props) => props.theme.fontSizeLg}px;
  font-weight: bold;
`;
export const SpotifySearchSubtitle = styled.div`
  font-size: ${(props) => props.theme.fontSizeSmall}px;
  color: ${(props) => props.theme.textSecondary};
`;

export const SpotifySearchButton = styled.button`
  border: none;
  border: 2px solid ${(props) => props.theme.borderColor};
  border-radius: ${(props) => props.theme.borderRadius}px;
  font-size: ${(props) => props.theme.fontSizeMed}px;
  padding: 8px 16px;
  background: ${(props) => props.theme.colorBgTeal};
  align-items: center;
  justify-content: center;
  display: flex;
`;

interface StatsCardProps {
  background?: string;
}

export const StatsCard = styled.div<StatsCardProps>`
  border: 2px solid ${(props) => props.theme.borderColor};
  border-radius: ${(props) => props.theme.borderRadius}px;
  padding: ${(props) => props.theme.paddingLg}px;
  background: ${(props) => props.background || props.theme.colorBg};
  max-width: 150px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const StatsCardNumber = styled.div`
  font-size: 28px;
`;

export const StatsCardDescription = styled.div``;

export const RecentReviewedContainer = styled.div`
  display: flex;
  gap: 8px;
  flex-direction: column;
`;

export const RecentReviewedTitle = styled.div`
  font-size: ${(props) => props.theme.fontSizeLg}px;
  font-weight: bold;
`;

export const SpotifyRecentlyContainer = styled.div`
  display: flex;
  padding: ${(props) => props.theme.paddingMed}px;
  border: 2px solid ${(props) => props.theme.borderColor};
  border-radius: ${(props) => props.theme.borderRadius}px;
  background: ${(props) => props.theme.colorBg};
  align-items: center;
  justify-content: space-between;
`;

export const SpotifyRecentlyImg = styled.img`
  width: 60px;
  border-radius: 50%;
  border: 2px solid ${(props) => props.theme.borderColor};
`;
export const SpotifyRecentlyTitle = styled.div`
  font-size: ${(props) => props.theme.fontSizeMed}px;
  font-weight: bold;
  color: ${(props) => props.theme.text};
`;

export const SpotifyMainItemContainer = styled.div`
  width: 200px;
  background: red;
`;

export const SpotifyMainAlbumContainer = styled.div``;
