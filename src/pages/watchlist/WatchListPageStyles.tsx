import styled from "styled-components";
import { AppTheme } from "../../theme";
declare module "styled-components" {
  export interface DefaultTheme extends AppTheme {}
}

export const TicketsContainer = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  width: 100%;
  justify-content: center;
`;
