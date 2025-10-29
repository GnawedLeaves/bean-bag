import styled, { css, keyframes } from "styled-components";
import { AppTheme } from "../../theme";
import e from "express";
declare module "styled-components" {
  export interface DefaultTheme extends AppTheme {}
}

export const TicketsContainer = styled.div`
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
  width: 100%;
  justify-content: center;
`;

export const SearchContainer = styled.div`
  width: 80%;
  display: flex;
  gap: 16px;
`;

export const WatchlistSearchButton = styled.button<{
  background?: string;
  width?: string;
}>`
  border: none;
  border: 2px solid ${(props) => props.theme.borderColor};
  border-radius: ${(props) => props.theme.borderRadius}px;
  font-size: ${(props) => props.theme.fontSizeMed}px;
  padding: 8px 16px;
  background: ${(props) => props.background ?? props.theme.colorBgGreen};
  align-items: center;
  justify-content: center;
  display: flex;
  width: ${(props) => props.width};
`;

export const WatchListBigSearchContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 16px;
  width: 100%;
`;

export const WatchListSearchResults = styled.div`
  display: flex;
  padding: ${(props) => props.theme.paddingMed}px;
  border-radius: ${(props) => props.theme.borderRadius}px;
  border: 2px solid ${(props) => props.theme.borderColor};
  gap: 16px;
  width: 100%;
  background: ${(props) => props.theme.colorBg};
`;

export const WatchListSearchResultsEmpty = styled(WatchListSearchResults)`
  justify-content: center;
`;

export const WatchListSearchResultsImg = styled.img`
  width: 100px;
  height: 150px;
  border: 2px solid ${(props) => props.theme.borderColor};
`;

export const WatchListSearchResultsContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: space-around;
  width: 100%;
`;

export const WatchListSearchResultsContentTitle = styled.div`
  font-size: ${(props) => props.theme.fontSizeLg}px;
  font-weight: bold;
`;

const rotation3dAnimation = keyframes`
  0% {
    transform: perspective(800px) rotateY(0deg);
  }
  100% {
    transform: perspective(800px) rotateY(360deg);
  }
`;

export const WatchListTicketComponentWrapper = styled.div<{
  rotation: string;
}>`
  position: absolute;
  transform: rotate(${(props) => props.rotation}) scale(0.8);
  bottom: 30px;
  left: -90px;
  z-index: 1;
`;

export const WatchListPosterWrapper = styled.div`
  position: relative;
`;

export const WatchListHeroContainer = styled.div`
  background: ${(props) => props.theme.colorBgGreen};
  border: 2px solid ${(props) => props.theme.borderColor};
  border-bottom-left-radius: 32px;
  border-bottom-right-radius: 32px;
  width: 100%;
  border-top: none;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: ${(props) => props.theme.paddingLg}px;
  transition: 0.3s;
  transition: max-height 0.6s ease;
  gap: 32px;
`;

export const WatchListHeroTitle = styled.div`
  font-size: ${(props) => props.theme.fontSizeHuge}px;
  font-weight: bold;
`;
