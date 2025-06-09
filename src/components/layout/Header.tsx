// src/components/layout/Header.tsx
import React, { useState } from "react";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import { message } from "antd";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import { ROUTES } from "../../routes";

const HeaderContainer = styled.header`
  background-color: #333;
  color: white;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled(Link)`
  color: white;
  text-decoration: none;
  font-size: 1.5rem;
  font-weight: bold;
`;

const NavContainer = styled.nav<{ isOpen: boolean }>`
  @media (max-width: 768px) {
    position: fixed;
    top: 60px;
    left: 0;
    right: 0;
    background-color: #333;
    height: ${(props) => (props.isOpen ? "auto" : "0")};
    overflow: hidden;
    transition: height 0.3s ease-in-out;
  }
`;

const NavList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
  display: flex;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const NavItem = styled.li`
  margin-left: 1rem;

  @media (max-width: 768px) {
    margin: 0;
    padding: 1rem;
    border-top: 1px solid #444;
  }
`;

const NavLink = styled(Link)`
  color: white;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const MenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;

  @media (max-width: 768px) {
    display: block;
  }
`;

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

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

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <HeaderContainer>
      <Logo to={ROUTES.HOME.path}>My Blog</Logo>

      <MenuButton onClick={toggleMenu}>{isMenuOpen ? "✕" : "☰"}</MenuButton>

      <NavContainer isOpen={isMenuOpen}>
        <NavList>
          {Object.values(ROUTES).map(
            (route) =>
              // Skip login route in navigation
              route.path !== ROUTES.LOGIN.path && (
                <NavItem key={route.path}>
                  <NavLink to={route.path} onClick={() => setIsMenuOpen(false)}>
                    {route.name}
                  </NavLink>
                </NavItem>
              )
          )}
          <NavItem>
            <button
              style={{
                background: "none",
                border: "none",
                color: "white",
                cursor: "pointer",
              }}
              onClick={async () => {
                await handleSignOut();
                setIsMenuOpen(false);
              }}
            >
              Sign Out
            </button>
          </NavItem>
        </NavList>
      </NavContainer>
    </HeaderContainer>
  );
};

export default Header;
