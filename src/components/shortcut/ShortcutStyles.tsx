import styled from "styled-components";
import { AppTheme, token } from "../../theme";
declare module "styled-components" {
  export interface DefaultTheme extends AppTheme {}
}

export const ShortcutContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${(props) => props.theme.paddingSmall}px;
  text-align: center;
`;

export const ShortcutIconContainer = styled.div<{
  background: string;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  padding: 8px;
  border-radius: ${(props) => props.theme.borderRadius}px;
  background: ${(props) => props.background || token.colorBg};
  border: 2px solid ${(props) => props.theme.borderColor};
`;

export const ShortcutIcon = styled.img``;
