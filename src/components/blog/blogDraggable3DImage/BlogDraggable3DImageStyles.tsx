import { url } from "inspector";
import React, { useState } from "react";
import styled from "styled-components";
interface BlogImageCardProps {
  zIndex: number;
}
export const Draggable3DImageContainer = styled.div<BlogImageCardProps>`
  perspective: 5000px;
  width: 200px;
  height: 300px;
  touch-action: none;
  z-index: ${(props) => props.zIndex};
`;

export const ImageWrapper = styled.div`
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  position: relative;
`;

export const RotatingCard = styled.div<{
  rotatex: number;
  rotatey: number;
  url: string;
  thickness: number;
}>`
  width: 100%;
  height: 100%;
  background: ${(props) => props.theme.colorBg};
  border: 2px solid ${(props) => props.theme.borderColor};
  transform-style: preserve-3d;
  transition: transform 0.1s ease-out;
  transform: ${({ rotatex: rotateX, rotatey: rotateY }) =>
    `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`};
  will-change: transform;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
  position: relative;
  padding: ${(props) => props.theme.paddingMed}px;

  // bottom edge
  &::after {
    content: "";
    position: absolute;
    width: 100%;
    height: ${(props) => props.thickness}px;
    background: ${(props) => props.theme.textSecondary};
    bottom: -${(props) => props.thickness}px;
    left: 0;
    transform: rotateX(-90deg);
    transform-origin: top;
  }

  // right edge
  &::before {
    content: "";
    position: absolute;
    width: ${(props) => props.thickness}px;
    height: 100%;
    background: ${(props) => props.theme.textSecondary};

    right: -${(props) => props.thickness}px;
    top: 0;
    transform: rotateY(90deg);
    transform-origin: left;
  }

  // left edge
  > .left-edge {
    content: "";
    position: absolute;
    width: ${(props) => props.thickness}px;
    height: 100%;
    background: ${(props) => props.theme.textSecondary};

    left: -${(props) => props.thickness}px;
    top: 0;
    transform: rotateY(-90deg);
    transform-origin: right;
  }

  // top edge
  > .top-edge {
    content: "";
    position: absolute;
    width: 100%;
    height: ${(props) => props.thickness}px;
    background: ${(props) => props.theme.textSecondary};
    top: -${(props) => props.thickness}px;
    left: 0;
    transform: rotateX(90deg);
    transform-origin: bottom;
  }
`;
