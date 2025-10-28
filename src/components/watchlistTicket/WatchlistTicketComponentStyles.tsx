import styled from "styled-components";
import { AppTheme } from "../../theme";
import style from "antd/es/affix/style";
declare module "styled-components" {
  export interface DefaultTheme extends AppTheme {}
}

export const TicketContainerExperiment = styled.div`
  position: relative;
  width: 200px;
  height: 100px;
  border-radius: 8px;
  z-index: 1;
  border: 2px solid black;
  background: radial-gradient(
        circle 32px at left center,
        transparent 50%,
        salmon 100%
      )
      left,
    radial-gradient(circle 32px at center, transparent 99%, red 100%) center,
    radial-gradient(circle 32px at right center, transparent 50%, blue 100%)
      right;

  //   this is width and height
  background-size: 33.3% 100%;
  background-repeat: no-repeat;
`;

export const TicketContainerWhole = styled.div`
  position: relative;
  width: 200px;
  height: 100px;
  border-radius: 8px;
  background: radial-gradient(
        circle 16px at left center,
        transparent 99%,
        lime 100%
      )
      left,
    radial-gradient(circle 16px at right center, transparent 99%, lime 100%)
      right;
  background-size: 50% 100%;
  background-repeat: no-repeat;
`;
export const TicketContainer = styled.div`
  display: flex;
  width: 200px;
`;
export const TicketContainerMain = styled.div`
  position: relative;
  width: 66%;
  height: 100px;
  border-radius: 8px;
  background: radial-gradient(
    circle 16px at left center,
    transparent 99%,
    ${(props) => props.theme.colorTicketBg}
  );
  background-size: 100% 100%;
  background-repeat: no-repeat;
  padding: ${(props) => props.theme.paddingSmall}px;
`;

export const TicketContainerTearable = styled.div`
  position: relative;
  width: 33%;
  height: 100px;
  border-radius: 8px;
  background: radial-gradient(
    circle 16px at right center,
    transparent 99%,
    ${(props) => props.theme.colorTicketBg}
  );
  background-size: 100% 100%;
  background-repeat: no-repeat;
  padding: ${(props) => props.theme.paddingSmall}px;
  // border-left: 3px dotted red;
`;
