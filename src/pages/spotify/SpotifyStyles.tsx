import styled from "styled-components";
import { AppTheme } from "../../theme";
declare module "styled-components" {
  export interface DefaultTheme extends AppTheme {}
}
export const AlbumContainer = styled.div``;

export const CommentCard = styled.div`
  border: 1px solid ${(props) => props.theme.borderColor};
  border-radius: ${(props) => props.theme.borderRadius}px;
  display: flex;
  align-items: center;
  position: relative;
  padding: ${(props) => props.theme.paddingMed}px;
  gap: 8px;
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
  padding-top: 128px;
  position: relative;
`;
export const SpotifyFeaturedImg = styled.img`
  width: 100%;
  height: auto;
  object-fit: cover;
  border: 1px solid ${(props) => props.theme.borderColor};
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15); // subtle 3D effect
`;

export const SpotifyBodyContainer = styled.div`
  border: 2px solid ${(props) => props.theme.borderColor};
  border-top-left-radius: 32px;
  border-top-right-radius: 32px;
  min-height: 50vh;
  border-bottom: none;
  padding: ${(props) => props.theme.paddingMed}px;
  background: ${(props) => props.theme.colorBg};
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
