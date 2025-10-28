import { Layout } from "antd";
import styled from "styled-components";

const { Content } = Layout;

const StyledContent = styled(Content)`
  background: ${(props) => props.theme.colorBg};
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: ${(props) => props.theme.paddingSmall}px;
`;

export const WatchListContentLayout: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return <StyledContent>{children}</StyledContent>;
};
