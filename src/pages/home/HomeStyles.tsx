import styled, { keyframes, css } from "styled-components";
import { AppTheme } from "../../theme";
import {
  addLineBreaksAfterSentences,
  formatFirebaseDate,
} from "../../utils/utils";
import style from "antd/es/affix/style";
import { Image } from "antd";
declare module "styled-components" {
  export interface DefaultTheme extends AppTheme {}
}

// Add the rotation keyframe
const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(720deg);  // 2.5 * 360 degrees = 900 degrees
  }
`;

export const HomePage = styled.div`
  padding: ${(props) => props.theme.paddingLg}px;
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100vh;
  background: ${(props) => props.theme.colorBgOrange};
  gap: 64px;
`;

export const HomeStatsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
  width: 100%;
  position: relative;
  margin-top: 16px;
`;

export const HomeStatCard = styled.div``;

interface HomeStatsCardProps {
  background?: string;
}

export const HomeStatsCard = styled.div<HomeStatsCardProps>`
  border: 2px solid ${(props) => props.theme.borderColor};
  border-radius: ${(props) => props.theme.borderRadius}px;
  padding: ${(props) => props.theme.paddingMed}px;
  background: ${(props) => props.background || props.theme.colorBg};
  max-width: 150px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 140px;
`;

export const HomeStatsCardNumber = styled.div`
  font-size: 28px;
`;

export const HomeStatsCardDescription = styled.div``;

export const HomeStatsBigCard = styled.div`
  border: 2px solid ${(props) => props.theme.borderColor};
  width: 320px;
  padding: ${(props) => props.theme.paddingMed}px;
  border-radius: ${(props) => props.theme.borderRadius}px;
  background: ${(props) => props.theme.colorBg};
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
`;

export const HomeStatsBigCardDisplayPic = styled.img`
  border: 2px solid ${(props) => props.theme.borderColor};
  border-radius: ${(props) => props.theme.borderRadius}px;
  width: 90px;
  height: 90px;
  object-fit: cover;
`;

export const HomeStatsBigCardName = styled.div`
  font-size: ${(props) => props.theme.fontSizeLgg}px;
  font-weight: bold;
`;

export const HomeStatsBigCardStatus = styled.div`
  font-size: ${(props) => props.theme.fontSizeMed}px;
`;

export const HomeStatsBigCardDate = styled.div`
  font-size: ${(props) => props.theme.fontSizeSmall}px;
  color: ${(props) => props.theme.textSecondary};
  position: absolute;
  bottom: 8px;
  right: 8px;
`;

export const HomeStatsBigCardLocation = styled.div`
  color: ${(props) => props.theme.textSecondary};
  font-size: ${(props) => props.theme.fontSizeSmall}px;
`;

export const HomePartnerText = styled.div`
  // position: absolute;
  // left: 0;
  // top: -32px;
  font-size: ${(props) => props.theme.fontSizeHuge}px;
  font-weight: bold;
  text-align: center;
`;

interface RefreshButtonProps {
  isSpinning?: boolean;
}

export const HomeBigCardRefreshButton = styled.div<RefreshButtonProps>`
  position: absolute;
  top: 8px;
  right: 8px;
  border: 1px solid ${(props) => props.theme.borderColor};
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(props) => props.theme.colorBgLightYellow};
  cursor: pointer;
  ${(props) =>
    props.isSpinning &&
    css`
      animation: ${rotate} 3s linear;
    `}
  transition: background 0.3s ease;

  &:hover {
    background: ${(props) => props.theme.colorBgLightYellow}80;
  }
`;

export const HomeSpaceContainer = styled.div`
  padding: ${(props) => props.theme.paddingLg}px
    ${(props) => props.theme.paddingLg}px;
  border: 2px solid ${(props) => props.theme.borderColor};
  border-radius: ${(props) => props.theme.borderRadius}px;
  width: 100%;
  background: ${(props) => props.theme.colorBg};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
`;
export const HomePartnerSubTitle = styled.div`
  font-size: ${(props) => props.theme.fontSizeLgg}px;
  font-weight: bold;
`;

export const HomePartnerSubText = styled.div``;

export const SpacePictureTitle = styled.div`
  font-weight: bold;
  font-size: ${(props) => props.theme.fontSizeLgg}px;
`;

export const SpacePictureExplanation = styled.div`
  white-space: pre-wrap;
  color: ${(props) => props.theme.text};
`;

export const SpacePictureContainer = styled(Image)`
  width: 100%;
  // max-height: 260px;
  object-fit: cover;
  border: 2px solid ${(props) => props.theme.borderColor};
  border-radius: ${(props) => props.theme.borderRadius}px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
`;

export const HomeFactContainer = styled.div`
  padding: ${(props) => props.theme.paddingLg}px
    ${(props) => props.theme.paddingLg}px;
  border: 2px solid ${(props) => props.theme.borderColor};
  border-radius: ${(props) => props.theme.borderRadius}px;
  width: 100%;
  background: ${(props) => props.theme.colorBg};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-top: 32px;
`;

export const HomeFactTitle = styled.div`
  font-size: ${(props) => props.theme.fontSizeLgg}px;
  font-weight: bold;
  color: ${(props) => props.theme.text};
`;

export const HomeFactText = styled.div`
  color: ${(props) => props.theme.text};
  font-size: ${(props) => props.theme.fontSizeMed}px;
  text-align: center;
  white-space: pre-line;
`;
