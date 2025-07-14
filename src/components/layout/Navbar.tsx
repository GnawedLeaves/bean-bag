import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Layout, message } from "antd";
import {
  HomeOutlined,
  BookOutlined,
  ExperimentOutlined,
  SettingOutlined,
  SunOutlined,
  SpotifyOutlined,
  MehOutlined,
  CoffeeOutlined,
} from "@ant-design/icons";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import { ROUTES } from "../../routes";
import { token } from "../../theme";
import styled from "styled-components";

const { Header: AntHeader } = Layout;

const MobileBottomNav = styled.div`
  background: ${(props) => props.theme.colorBgLightYellow};
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  border-top: 2px solid #352a24;
  z-index: 1000;
  padding: 8px 0;
  padding-bottom: 32px;
  display: block;
`;

const NavContainer = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  max-width: 100%;
`;

interface NavItemProps {
  $active?: boolean;
}

const NavItem = styled(Link)<NavItemProps>`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.65);
  transition: color 0.3s ease, background 0.3s;
  padding: 4px 8px;
  border-radius: 8px;
  min-width: 60px;
  background: ${({ $active }) =>
    $active ? "rgba(24, 144, 255, 0.1)" : "none"};
  color: ${({ $active }) => ($active ? "#1890ff" : "rgba(255,255,255,0.65)")};

  &:hover {
    color: #1890ff;
    background: rgba(24, 144, 255, 0.1);
  }
`;

const NavIcon = styled.div`
  font-size: 20px;
  margin-bottom: 2px;
  color: ${(props) => props.theme.text};
`;

const NavLabel = styled.span`
  font-size: 11px;
  font-weight: 500;
  text-align: center;
  color: ${(props) => props.theme.text};
`;

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      message.success("Signed out successfully");
      navigate(ROUTES.LOGIN.path);
    } catch (error) {
      console.error("Error signing out:", error);
      message.error("Failed to sign out");
    }
  };

  const navigationItems = [
    {
      key: ROUTES.HOME.path,
      icon: <HomeOutlined />,
      label: "Home",
      path: ROUTES.HOME.path,
    },
    {
      key: ROUTES.AGENDA?.path || "/agenda",
      icon: <CoffeeOutlined />,
      label: "Agenda",
      path: ROUTES.AGENDA?.path || "/agenda",
    },
    {
      key: ROUTES.BLOG?.path || "/blogs",
      icon: <BookOutlined />,
      label: "Beans",
      path: ROUTES.BLOG?.path || "/blogs",
    },
    // {
    //   key: ROUTES.PLANTS?.path || "/plants",
    //   icon: <SunOutlined />,
    //   label: "Plants",
    //   path: ROUTES.PLANTS?.path || "/plants",
    // },
    {
      key: ROUTES.SPOTIFY?.path || "/spotify",
      icon: <SpotifyOutlined />,
      label: "Beanify",
      path: ROUTES.SPOTIFY?.path || "/spotify",
    },

    {
      key: ROUTES.PROFILE?.path || "/profile",
      icon: <MehOutlined />,
      label: "Profile",
      path: ROUTES.PROFILE?.path || "/profile",
    },
  ];

  const mobileMenuItems = navigationItems.map((item) => ({
    key: item.key,
    icon: item.icon,
    label: (
      <Link
        to={item.path}
        onClick={() => setIsMenuOpen(false)}
        style={{ color: "inherit", textDecoration: "none" }}
      >
        {item.label}
      </Link>
    ),
  }));

  return (
    <>
      <MobileBottomNav>
        <NavContainer>
          {navigationItems.map((item) => (
            <NavItem
              key={item.key}
              to={item.path}
              $active={location.pathname === item.path}
              onClick={() => setIsMenuOpen(false)}
            >
              <NavIcon>{item.icon}</NavIcon>
              <NavLabel>{item.label}</NavLabel>
            </NavItem>
          ))}
        </NavContainer>
      </MobileBottomNav>
    </>
  );
};

export default Navbar;
