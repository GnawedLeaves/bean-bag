// src/components/layout/Header.tsx
import React, { useState } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";

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

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <HeaderContainer>
      <Logo to="/">My Blog</Logo>

      <MenuButton onClick={toggleMenu}>{isMenuOpen ? "✕" : "☰"}</MenuButton>

      <NavContainer isOpen={isMenuOpen}>
        <NavList>
          <NavItem>
            <NavLink to="/" onClick={() => setIsMenuOpen(false)}>
              Home
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink to="/upload" onClick={() => setIsMenuOpen(false)}>
              New Entry
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink to="/entries" onClick={() => setIsMenuOpen(false)}>
              All Entries
            </NavLink>
          </NavItem>
        </NavList>
      </NavContainer>
    </HeaderContainer>
  );
};

export default Header;
