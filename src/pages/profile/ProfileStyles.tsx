import styled from "styled-components";
import { AppTheme } from "../../theme";
declare module "styled-components" {
  export interface DefaultTheme extends AppTheme {}
}

export const ProfileMainContainer = styled.div`
  background: ${(props) => props.theme.colorBgVoliet};
  height: 100vh;
  width: 100%;
  display: flex;
  gap: 32px;
  flex-direction: column;
  padding: ${(props) => props.theme.paddingLgg}px
    ${(props) => props.theme.paddingLg}px;
  //   align-items: center;
`;

export const ProfileButton = styled.div`
  border: none;
  border: 2px solid ${(props) => props.theme.borderColor};
  border-radius: ${(props) => props.theme.borderRadius}px;
  padding: 12px 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  background: ${(props) => props.theme.colorBgLightYellow};
`;

export const ProfileHero = styled.div`
  font-size: ${(props) => props.theme.fontSizeHuge}px;
  font-weight: bold;
`;

export const ProfileSubtitle = styled.div`
  width: 80%;
  text-align: center;
`;

export const ProfileDisplayPictureContainer = styled.div`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: ${(props) => props.theme.colorBg};
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid ${(props) => props.theme.borderColor};
  cursor: pointer;
  transition: opacity 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    &::after {
      content: "Change Picture";
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: ${(props) => props.theme.text};
      font-size: ${(props) => props.theme.fontSizeSmall}px;
      text-align: center;
      z-index: 1;
    }

    img {
      opacity: 0.7;
    }
  }
`;

export const ProfileDisplayPictureInner = styled.img`
  width: 140px;
  height: 140px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid ${(props) => props.theme.borderColor};
  margin-top: 6px;
  transition: opacity 0.3s ease;
`;

export const ProfileDisplayName = styled.div`
  font-size: ${(props) => props.theme.fontSizeLgg}px;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: ${(props) => props.theme.borderRadius}px;
  transition: background 0.3s ease;
  text-align: center;
  &:hover {
    background: ${(props) => props.theme.colorBgLightYellow}20;
  }
`;
