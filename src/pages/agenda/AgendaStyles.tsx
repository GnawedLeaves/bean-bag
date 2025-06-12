import styled from "styled-components";
import { AppTheme } from "../../theme";
declare module "styled-components" {
  export interface DefaultTheme extends AppTheme {}
}

export const AgendaMain = styled.div`
  background: ${(props) => props.theme.colorBgYellow};
  //   min-height: 100vh;
  display: flex;
  align-items: center;
  flex-direction: column;
`;

export const AgendaHeroContainer = styled.div`
  height: 300px;
  padding: ${(props) => props.theme.paddingMed}px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 32px;
`;

export const AgendaBodyContainer = styled.div`
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

export const AgendaTitle = styled.div`
  font-size: ${(props) => props.theme.fontSizeHuge}px;
  font-weight: bold;
`;

interface HomeStatsCardProps {
  background?: string;
}

export const AgendaStatsCard = styled.div<HomeStatsCardProps>`
  border: 2px solid ${(props) => props.theme.borderColor};
  border-radius: ${(props) => props.theme.borderRadius}px;
  padding: ${(props) => props.theme.paddingMed}px;
  background: ${(props) => props.background || props.theme.colorBg};
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100px;
`;

export const AgendaStatsCardNumber = styled.div`
  font-size: 28px;
`;

export const AgendaStatsCardDescription = styled.div``;
