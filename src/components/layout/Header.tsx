import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Layout, Menu, Button, Drawer, message } from "antd";
import {
  MenuOutlined,
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

const { Header: AntHeader } = Layout;

const Header: React.FC = () => {
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

  // Define navigation items in specific order: Home, Blog, Plants, Feedback
  const navigationItems = [
    {
      key: ROUTES.HOME.path,
      icon: <HomeOutlined />,
      label: "Home",
      path: ROUTES.HOME.path,
    },
    {
      key: ROUTES.SPACE?.path || "/space",
      icon: <CoffeeOutlined />,
      label: "Agendas",
      path: ROUTES.SPACE?.path || "/space",
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

  // Mobile bottom navigation items
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
      {/* Mobile Bottom Navigation */}
      <div
        className="mobile-bottom-nav"
        style={{ background: token.colorBgLightYellow }}
      >
        <div className="nav-container">
          {navigationItems.map((item) => (
            <Link
              key={item.key}
              to={item.path}
              className={`nav-item ${
                location.pathname === item.path ? "active" : ""
              }`}
            >
              <div className="nav-icon" style={{ color: token.text }}>
                {item.icon}
              </div>
              <span className="nav-label" style={{ color: token.text }}>
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Responsive CSS */}
      <style>
        {`
          /* Desktop styles */
          @media (min-width: 769px) {
            .desktop-header {
              display: flex !important;
            }
            .mobile-header,
            .mobile-bottom-nav {
              display: none !important;
            }
          }

          /* Mobile styles */
          @media (max-width: 768px) {
            .desktop-header {
              display: none !important;
            }
            
            .mobile-header {
              display: flex !important;
            }

            .mobile-bottom-nav {
              display: block !important;
              position: fixed;
              bottom: 0;
              left: 0;
              right: 0;
              background: #001529;
              border-top: 2px solid #352A24;
              z-index: 1000;
              padding: 8px 0;
            }

            .nav-container {
              display: flex;
              justify-content: space-around;
              align-items: center;
              max-width: 100%;
              // margin: 0 auto;
            }

            .nav-item {
              display: flex;
              flex-direction: column;
              align-items: center;
              text-decoration: none;
              color: rgba(255, 255, 255, 0.65);
              transition: color 0.3s ease;
              padding: 4px 8px;
              border-radius: 8px;
              min-width: 60px;
            }

            .nav-item:hover,
            .nav-item.active {
              color: #1890ff;
              background: rgba(24, 144, 255, 0.1);
            }

            .nav-icon {
              font-size: 20px;
              margin-bottom: 2px;
            }

            .nav-label {
              font-size: 11px;
              font-weight: 500;
              text-align: center;
            }

            /* Add bottom padding to main content to account for fixed nav */
            body {
              padding-bottom: 60px;
            }

            /* Ensure main content doesn't overlap with bottom nav */
            .ant-layout-content {
              margin-bottom: 70px;
            }
          }

        
        `}
      </style>
    </>
  );
};

export default Header;
