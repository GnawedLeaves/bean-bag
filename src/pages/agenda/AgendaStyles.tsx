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
  width: 100%;
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
  gap: 32px;
  padding-top: ${(props) => props.theme.paddingLg}px;
  width: 100%;
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
  width: 110px;
`;

export const AgendaStatsCardNumber = styled.div`
  font-size: 28px;
`;

export const AgendaStatsCardDescription = styled.div``;

export const AgendaAddButton = styled.button`
  border: none;
  border: 2px solid ${(props) => props.theme.borderColor};
  border-radius: ${(props) => props.theme.borderRadius}px;
  font-size: ${(props) => props.theme.fontSizeMed}px;
  padding: 8px 16px;
  background: ${(props) => props.theme.colorBgYellow};
  align-items: center;
  justify-content: center;
  display: flex;
`;

export const SortButton = styled(AgendaAddButton)<AgendaItemProps>`
  background: ${(props) => props.background};
  gap: 8px;
`;
interface AgendaItemProps {
  background?: string;
}

export const AgendaItem = styled.div<AgendaItemProps>`
  border: 2px solid ${(props) => props.theme.borderColor};
  border-radius: ${(props) => props.theme.borderRadius}px;
  padding: ${(props) => props.theme.paddingMed}px;
  background: ${(props) => props.background};
  width: 100%;
  transition: 0.3s;
  display: flex;
  gap: 16px;
  align-items: center;
  height: 100px;
  position: relative;
`;

export const AgendaDate = styled.div`
  color: ${(props) => props.theme.textSecondary};
  font-size: ${(props) => props.theme.fontSizeSmall}px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  text-align: right;
  position: absolute;
  bottom: 16px;
  right: 16px;
`;

export const AgendaDisplayPic = styled.img`
  border: 2px solid ${(props) => props.theme.borderColor};
  border-radius: ${(props) => props.theme.borderRadius}px;
  width: 50px;
  height: 50px;
  object-fit: cover;
`;
interface AgendaEditButtonProps {
  background?: string;
  show?: boolean;
}
export const AgendaEditButton = styled.button<AgendaEditButtonProps>`
  border: none;
  border: 2px solid ${(props) => props.theme.borderColor};
  border-radius: ${(props) => props.theme.borderRadius}px;
  font-size: ${(props) => props.theme.fontSizeMed}px;
  padding: 8px;
  background: ${(props) => props.background};
  align-items: center;
  justify-content: center;
  display: flex;
  transition: 0.3s;
  pointer-events: ${(props) => (props.show ? "none" : "")};
  opacity: ${(props) => (props.show ? 0 : 1)};
`;

export const AgendaContentContainer = styled.div`
  width: 150px;
`;

export const AgendaBodyTitle = styled.div`
  font-size: ${(props) => props.theme.fontSizeLgg}px;
  font-weight: bold;
`;
