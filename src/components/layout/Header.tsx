import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Layout, Menu, Button, Drawer, message } from "antd";
import { MenuOutlined, CloseOutlined } from "@ant-design/icons";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import { ROUTES } from "../../routes";

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

  const menuItems = Object.values(ROUTES)
    .filter((route) => route.path !== ROUTES.LOGIN.path)
    .map((route) => ({
      key: route.path,
      label: (
        <Link to={route.path} onClick={() => setIsMenuOpen(false)}>
          {route.name}
        </Link>
      ),
    }));

  // Add sign out as the last item
  menuItems.push({
    key: "signout",
    label: (
      <Button
        type="link"
        danger
        onClick={async () => {
          await handleSignOut();
          setIsMenuOpen(false);
        }}
      >
        Sign Out
      </Button>
    ),
  });

  return (
    <AntHeader
      style={{
        background: "#333",
        color: "white",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 1rem",
      }}
    >
      <Link
        to={ROUTES.HOME.path}
        style={{ color: "white", fontSize: "1.5rem", fontWeight: "bold" }}
      >
        My Blog
      </Link>

      {/* Desktop Menu */}
      <div className="desktop-menu" style={{ display: "none" }}>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          style={{ background: "#333" }}
        />
      </div>

      {/* Mobile Menu Button */}
      <Button
        type="text"
        icon={isMenuOpen ? <CloseOutlined /> : <MenuOutlined />}
        style={{ color: "white", fontSize: "1.5rem", display: "block" }}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="mobile-menu-button"
      />

      {/* Mobile Drawer */}
      <Drawer
        placement="top"
        closable={false}
        onClose={() => setIsMenuOpen(false)}
        open={isMenuOpen}
        bodyStyle={{ padding: 0 }}
        height="auto"
      >
        <Menu
          theme="dark"
          mode="vertical"
          selectedKeys={[location.pathname]}
          items={menuItems}
        />
      </Drawer>

      {/* Responsive CSS */}
      <style>
        {`
          @media (min-width: 769px) {
            .desktop-menu {
              display: block !important;
            }
            .mobile-menu-button {
              display: none !important;
            }
          }
        `}
      </style>
    </AntHeader>
  );
};

export default Header;
