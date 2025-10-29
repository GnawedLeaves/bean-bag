import { Layout } from "antd";
import styled from "styled-components";

const { Content } = Layout;

const StyledContent = styled(Content)`
  background: ${(props) => props.theme.colorBg};
  display: flex;
  flex-direction: column;
  padding: ${(props) => props.theme.paddingSmall}px;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
`;

export const WatchListContentLayout: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return <StyledContent>{children}</StyledContent>;
};
