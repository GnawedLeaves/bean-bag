import React from "react";
import styled, { keyframes } from "styled-components";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

const spinAnimation = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: ${(props) => props.theme.colorBgVoliet};
`;

const ImageLoadingContainer = styled.div`
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: ${(props) => props.theme.colorBg};
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid ${(props) => props.theme.borderColor};
`;

const StyledSpinner = styled(Spin)<{
  color?: string;
}>`
  .ant-spin-dot-item {
    background-color: ${(props) =>
      props.color ? props.color : props.theme.colorBgLightYellow};
  }
`;

const BlogEntryLoadingContainer = styled.div`
  width: 100%;
  background: ${(props) => props.theme.colorBg};
  border: 2px solid ${(props) => props.theme.borderColor};
  border-radius: ${(props) => props.theme.borderRadius}px;
  padding: ${(props) => props.theme.paddingLg}px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
`;

interface SpinnerProps {
  color?: string;
}

export const PageLoading = ({ color }: SpinnerProps) => (
  <LoadingContainer>
    <StyledSpinner size="large" color={color} />
  </LoadingContainer>
);

export const ImageLoading = ({ color }: SpinnerProps) => (
  <ImageLoadingContainer>
    <StyledSpinner size="default" color={color} />
  </ImageLoadingContainer>
);

export const BlogEntryLoading = () => (
  <BlogEntryLoadingContainer>
    <StyledSpinner size="default" />
  </BlogEntryLoadingContainer>
);

export const CustomSpin = ({ color }: SpinnerProps) => {
  return <StyledSpinner size="default" color={color} />;
};

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;
export const SpinnerIcon = () => <Spin indicator={antIcon} />;
