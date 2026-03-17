import styled, { keyframes } from "styled-components";
import { AppTheme } from "../../../theme";
declare module "styled-components" {
  export interface DefaultTheme extends AppTheme {}
}

export const WatchListPosterContainer = styled.div<{
  clicked: boolean;
}>`
  perspective: 1000px;
  position: relative;

  // ratio is 0.66 / 1.51
  width: 250px;
  height: 375px;
  z-index: ${(props) => (props.clicked ? 5 : 1)};
`;

export const WatchListPosterInner = styled.div<{
  clicked: boolean;
}>`
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: 1s;
  curosr: pointer;
  transform: ${(props) =>
    props.clicked ? "rotateY(180deg)" : "rotateY(0deg)"};
`;

const scaleUp = keyframes`
0% {

}
100%{
}
`;

export const WatchListPoster = styled.img<{
  clicked: boolean;
}>`
  width: 100%;
  height: 100%;
  position: absolute;
  backface-visibility: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  ${(props) => (props.clicked ? "animation: 1s" : "")}

  // thickness
  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: rgba(255, 255, 255, 0.1);
    transform: translateZ(-5px);
  }
`;

export const WatchListPosterBack = styled.div<{
  clicked: boolean;
}>`
  width: 100%;
  height: 100%;
  transform: rotateY(180deg);
  backface-visibility: hidden;
  border: 2px solid ${(props) => props.theme.borderColor};
  background: ${(props) => props.theme.colorBg};
  padding: ${(props) => props.theme.paddingMed}px;
`;
