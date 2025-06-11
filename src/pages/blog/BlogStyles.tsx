import styled from "styled-components";
import { AppTheme } from "../../theme";
declare module "styled-components" {
  export interface DefaultTheme extends AppTheme {}
}
export const BlogMainPage = styled.div`
  background: ${(props) => props.theme.colorBgPink};
  min-height: 100vh;
  color: ${(props) => props.theme.text};
`;

export const BlogHeroContainer = styled.div`
  //   min-height: 50vh;
`;

export const BlogButton = styled.button`
  border: none;
  border: 2px solid ${(props) => props.theme.borderColor};
  border-radius: ${(props) => props.theme.borderRadius}px;
  font-size: ${(props) => props.theme.fontSizeMed}px;
  padding: 8px;
  background: ${(props) => props.theme.colorBgPink};
  align-items: center;
  justify-content: center;
  display: flex;
  color: ${(props) => props.theme.text};
`;
export const BlogBodyPage = styled.div`
  padding: ${(props) => props.theme.paddingMed}px;
  padding-top: ${(props) => props.theme.paddingLg}px;
  background: ${(props) => props.theme.colorBg};
  border: 2px solid ${(props) => props.theme.borderColor};
  border-top-left-radius: 32px;
  border-top-right-radius: 32px;
  min-height: 100vh;
  border-bottom: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  transition: 0.3s;
`;

export const BlogTopBar = styled.div`
  width: 100%;
  position: relative;
  padding: 32px 0;
  font-size: ${(props) => props.theme.fontSizeLgg}px;
  font-weight: bold;
  display: flex;
  gap: 4px;
  flex-direction: column;
  align-items: center;
`;

export const BlogTopBarSubtitle = styled.div`
  font-size: ${(props) => props.theme.fontSizeMed}px;
  color: ${(props) => props.theme.textSecondary};
`;
