import styled, { css, keyframes } from "styled-components";
import { AppTheme } from "../../../theme";
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
  width: 320px;
  height: 120px;
`;
export const TicketContainerMain = styled.div`
  position: relative;
  width: 85%;
  border-radius: 8px;
  background: radial-gradient(
    circle 16px at left center,
    transparent 99%,
    ${(props) => props.theme.colorTicketBg}
  );
  background-size: 100% 100%;
  background-repeat: no-repeat;
  padding: ${(props) => props.theme.paddingSmall}px;
  box-shadow: 5px 4px 5px -4px rgba(156, 156, 156, 0.75);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding-left: 24px;
`;

const tearingAnimation = keyframes`
0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(30deg);
  }
`;

export const TicketContainerTearable = styled.div<{
  tearing: boolean;
  isTeared: boolean;
}>`
  position: relative;
  width: 15%;
  border-radius: 8px;
  background: ${(props) => props.theme.colorTicketBg};
  // background: radial-gradient(
  //   circle 16px at right center,
  //   transparent 99%,
  //   ${(props) => props.theme.colorTicketBg}
  // );
  background-size: 100% 100%;
  background-repeat: no-repeat;
  padding: ${(props) => props.theme.paddingSmall}px;
  box-shadow: 5px 4px 5px -4px rgba(156, 156, 156, 0.75);
  writing-mode: sideways-lr; /* top-to-bottom, right-to-left */
  text-orientation: mixed;
  text-align: center;
  transform-origin: bottom right;
  ${(props) =>
    props.tearing &&
    !props.isTeared &&
    css`
      animation: ${tearingAnimation} 2s ease-in-out forwards;
    `}

  ${(props) =>
    props.isTeared
      ? ` transform: rotate(30deg);`
      : `
       transform: rotate(0deg);`}
`;

export const TicketContentContainer = styled.div`
  border: 2px solid ${(props) => props.theme.borderColor};
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
`;

export const TicketNumber = styled.div`
  position: absolute;
  bottom: 8px;
  right: 12px;
`;
