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
      key: ROUTES.BLOG?.path || "/blogs",
      icon: <BookOutlined />,
      label: "Blog",
      path: ROUTES.BLOG?.path || "/blogs",
    },
    {
      key: ROUTES.PLANTS?.path || "/plants",
      icon: <SunOutlined />,
      label: "Plants",
      path: ROUTES.PLANTS?.path || "/plants",
    },
    {
      key: ROUTES.SPOTIFY?.path || "/spotify",
      icon: <SpotifyOutlined />,
      label: "Spotify",
      path: ROUTES.SPOTIFY?.path || "/spotify",
    },
    {
      key: ROUTES.SPACE?.path || "/space",
      icon: <ExperimentOutlined />,
      label: "Space",
      path: ROUTES.SPACE?.path || "/space",
    },
    {
      key: ROUTES.SETTINGS?.path || "/settings",
      icon: <SettingOutlined />,
      label: "Settings",
      path: ROUTES.SETTINGS?.path || "/feedback",
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

  // Desktop menu items (includes sign out)
  const desktopMenuItems = [
    ...mobileMenuItems,
    {
      key: "signout",
      label: (
        <Button
          type="link"
          danger
          onClick={async () => {
            await handleSignOut();
            setIsMenuOpen(false);
          }}
          style={{ color: "#ff4d4f" }}
        >
          Sign Out
        </Button>
      ),
    },
  ];

  return (
    <>
      {/* Desktop Header */}
      <AntHeader
        className="desktop-header"
        style={{
          background: "#001529",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 2rem",
          position: "sticky",
          top: 0,
          zIndex: 1000,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <Link
          to={ROUTES.HOME.path}
          style={{
            color: "white",
            fontSize: "1.8rem",
            fontWeight: "bold",
            textDecoration: "none",
          }}
        >
          Anni App
        </Link>

        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={desktopMenuItems}
          style={{
            background: "transparent",
            border: "none",
            flex: 1,
            justifyContent: "flex-end",
          }}
        />
      </AntHeader>

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

      {/* Mobile Top Header (minimal) */}
      {/* <AntHeader
        className="mobile-header"
        style={{
          background: "#001529",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 1rem",
          position: "sticky",
          top: 0,
          zIndex: 1000,
          height: "56px",
        }}
      >
        <Link
          to={ROUTES.HOME.path}
          style={{
            color: "white",
            fontSize: "1.4rem",
            fontWeight: "bold",
            textDecoration: "none",
          }}
        >
          Anni App
        </Link>

        <Button
          type="text"
          icon={<MenuOutlined />}
          style={{ color: "white", fontSize: "1.2rem" }}
          onClick={() => setIsMenuOpen(true)}
        />
      </AntHeader> */}

      {/* Mobile Drawer for additional options */}
      <Drawer
        title="Menu"
        placement="right"
        closable={true}
        onClose={() => setIsMenuOpen(false)}
        open={isMenuOpen}
        bodyStyle={{ padding: "1rem" }}
        className="mobile-drawer"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <Button
            type="primary"
            danger
            onClick={async () => {
              await handleSignOut();
              setIsMenuOpen(false);
            }}
            style={{ width: "100%" }}
          >
            Sign Out
          </Button>
        </div>
      </Drawer>

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
              border-top: 1px solid #434343;
              z-index: 1000;
              padding: 8px 0;
            }

            .nav-container {
              display: flex;
              justify-content: space-around;
              align-items: center;
              max-width: 100%;
              margin: 0 auto;
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
              padding-bottom: 70px;
            }

            /* Ensure main content doesn't overlap with bottom nav */
            .ant-layout-content {
              margin-bottom: 70px;
            }
          }

          /* Hide mobile elements on desktop */
          @media (min-width: 769px) {
            .mobile-bottom-nav,
            .mobile-header {
              display: none !important;
            }
          }
        `}
      </style>
    </>
  );
};

export default Header;
