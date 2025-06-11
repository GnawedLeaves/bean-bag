import styled from "styled-components";
import { AppTheme } from "../../theme";
declare module "styled-components" {
  export interface DefaultTheme extends AppTheme {}
}
export const BlogMainPage = styled.div`
  background: ${(props) => props.theme.colorBgVoliet};
  min-height: 100vh;
`;

export const BlogHeroContainer = styled.div`
  //   min-height: 50vh;
`;

export const BlogBodyPage = styled.div`
  padding: ${(props) => props.theme.paddingMed}px;
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
