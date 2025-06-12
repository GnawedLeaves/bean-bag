import styled, { keyframes } from "styled-components";
import { Card, Input, Button } from "antd";
import { AppTheme } from "../../theme";

declare module "styled-components" {
  export interface DefaultTheme extends AppTheme {}
}

const gradientAnimation = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

export const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: ${(props) => props.theme.paddingLg}px;

  background: linear-gradient(
    300deg,
    ${(props) => props.theme.colorBgPink},
    ${(props) => props.theme.colorBgGreen},
    ${(props) => props.theme.colorBgTeal},
    ${(props) => props.theme.colorBgVoliet}
  );
  background-size: 400% 400%;
  animation: ${gradientAnimation} 10s ease infinite;
`;

export const LoginCard = styled(Card)`
  width: 100%;
  max-width: 400px;
  border: 2px solid ${(props) => props.theme.borderColor};
  border-radius: ${(props) => props.theme.borderRadius}px;
  background: ${(props) => props.theme.colorBg};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: ${(props) => props.theme.paddingLg}px;
  backdrop-filter: blur(5px);
  background-color: rgba(254, 250, 239, 0.9);
`;
export const LoginTitle = styled.h1`
  font-size: ${(props) => props.theme.fontSizeHuge}px;
  text-align: center;
  margin-bottom: 8px;
  color: ${(props) => props.theme.text};
`;

export const LoginInput = styled(Input)`
  border: 2px solid ${(props) => props.theme.borderColor};
  border-radius: ${(props) => props.theme.borderRadius}px;
  padding: 8px 12px;
  background: ${(props) => props.theme.colorBg};
  color: ${(props) => props.theme.text};

  &:hover,
  &:focus {
    border-color: ${(props) => props.theme.borderColor};
    box-shadow: none;
  }

  .ant-input-prefix {
    margin-right: 8px;
    color: ${(props) => props.theme.textSecondary};
  }
`;

export const LoginButton = styled(Button)`
  width: 100%;
  height: 40px;
  border-radius: ${(props) => props.theme.borderRadius}px;
  border: 2px solid ${(props) => props.theme.borderColor};
  background: ${(props) => props.theme.colorBgPink};
  color: ${(props) => props.theme.text};
  font-weight: bold;

  &:hover,
  &:focus {
    background: ${(props) => props.theme.colorBgPink}90;
    color: ${(props) => props.theme.text};
    border-color: ${(props) => props.theme.borderColor};
  }
`;
