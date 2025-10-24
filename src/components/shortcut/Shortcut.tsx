import { ThemeProvider } from "styled-components";
import {
  ShortcutContainer,
  ShortcutIcon,
  ShortcutIconContainer,
} from "./ShortcutStyles";
import { token } from "../../theme";

export interface ShortcutComponentProps {
  iconNode?: React.ReactNode;
  iconImg?: string;
  title: string;
  color: string;
  onClick: (navigateLink: string) => void;
  navigateLink: string;
}

const ShortcutComponent = ({
  iconNode,
  iconImg,
  title,
  color,
  navigateLink,
  onClick,
}: ShortcutComponentProps) => {
  return (
    <ThemeProvider theme={token}>
      <ShortcutContainer
        onClick={() => {
          onClick(navigateLink);
        }}
      >
        <ShortcutIconContainer background={color}>
          {iconNode ? iconNode : <ShortcutIcon src={iconImg} />}
        </ShortcutIconContainer>

        {title}
      </ShortcutContainer>
    </ThemeProvider>
  );
};

export default ShortcutComponent;
