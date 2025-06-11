import styled, { ThemeProvider } from "styled-components";
import { token } from "../../theme";
import { useEffect, useRef, useState } from "react";
import { SmileOutlined } from "@ant-design/icons";
import { BaseOptionType } from "antd/es/select";
import { SpotifyButtonSmallText } from "../../pages/spotify/SpotifyStyles";

interface SpotifyDropdownProps {
  onItemClick: (option: BaseOptionType) => void;
  dropdownOptions: BaseOptionType[];
}

const DropdownContainer = styled.div`
  position: relative;
  width: 50px;
`;

const DropdownButton = styled.button<{
  isOpen: boolean;
  dropdownLength: number;
}>`
  border: 2px solid ${(props) => props.theme.borderColor};
  display: flex;
  border-radius: ${(props) =>
    props.isOpen ? props.theme.borderRadius + "px" : "100%"};
  width: ${(props) => (props.isOpen ? "200px" : "50px")};
  height: ${(props) =>
    props.isOpen ? props.dropdownLength * 50 + "px" : "50px"};
  background: ${(props) => props.theme.colorBg};
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease-in-out;
  position: absolute;
  z-index: 1;
  right: 0;
  top: ${(props) => (props.isOpen ? "0" : "50%")};
  transform: ${(props) => (props.isOpen ? "none" : "translateY(-50%)")};
  transform-origin: right;
`;

const OptionsContainer = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: 0px;
  right: 0;
  width: 200px;
  background: ${(props) => props.theme.colorBg};
  border: 2px solid ${(props) => props.theme.borderColor};
  border-radius: ${(props) => props.theme.borderRadius}px;
  opacity: ${(props) => (props.isOpen ? 1 : 0)};
  transform: translateY(${(props) => (props.isOpen ? "0" : "-10px")});
  pointer-events: ${(props) => (props.isOpen ? "auto" : "none")};
  transition: all 0.3s ease-in-out;
  z-index: 2;
`;

const Option = styled.div`
  display: flex;
  align-items: center;
  padding: ${(props) => props.theme.paddingMed}px;
  cursor: pointer;
  height: 50px;
  &:hover {
    background: ${(props) => props.theme.colorBgTeal};
  }
`;

const SpotifyDropdownComponent = ({
  onItemClick,
  dropdownOptions,
}: SpotifyDropdownProps) => {
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleOptionClick = (option: BaseOptionType) => {
    onItemClick(option);
    setDropdownOpen(false);
  };

  return (
    <ThemeProvider theme={token}>
      <DropdownContainer ref={dropdownRef}>
        <DropdownButton
          dropdownLength={dropdownOptions.length}
          isOpen={dropdownOpen}
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <SmileOutlined
            style={{
              opacity: dropdownOpen ? 0 : 1,
              transition: "0.3s",
            }}
          />
        </DropdownButton>

        <OptionsContainer isOpen={dropdownOpen}>
          {dropdownOptions.map((option, index) => (
            <Option key={index} onClick={() => handleOptionClick(option)}>
              {option.label}
            </Option>
          ))}
        </OptionsContainer>
      </DropdownContainer>
    </ThemeProvider>
  );
};

export default SpotifyDropdownComponent;
