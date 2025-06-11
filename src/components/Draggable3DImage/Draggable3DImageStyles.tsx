import { url } from "inspector";
import React, { useState } from "react";
import styled from "styled-components";

export const Draggable3DImageContainer = styled.div`
  perspective: 4000px;
  width: 350px;
  height: 350px;
  touch-action: none;
`;

export const ImageWrapper = styled.div`
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  position: relative;
`;

export const RotatingImage = styled.div<{
  rotateX: number;
  rotateY: number;
  url: string;
  thickness: number;
}>`
  width: 100%;
  height: 100%;
  background-image: url(${(props) => props.url});
  background-size: cover;
  background-position: center;
  transform-style: preserve-3d;
  transition: transform 0.1s ease-out;
  transform: ${({ rotateX, rotateY }) =>
    `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`};
  will-change: transform;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  position: relative;

  // Bottom edge
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

  // Right edge
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

  // Left edge
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

  // Top edge
  > .top-edge {
    content: "";
    position: absolute;
    width: 100%;
    height: ${(props) => props.thickness}px;
    background: linear-gradient(
      to right,
      ${(props) => props.theme.textSecondary} 0%,
      rgba(255, 255, 255, 0.2) 45%,
      rgba(255, 255, 255, 0.3) 50%,
      rgba(255, 255, 255, 0.2) 55%,
      ${(props) => props.theme.textSecondary} 100%
    );
    top: -${(props) => props.thickness}px;
    left: 0;
    transform: rotateX(90deg);
    transform-origin: bottom;
  }
`;
