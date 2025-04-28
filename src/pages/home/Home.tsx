// src/pages/Home.tsx
import React, { useEffect } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { getEntries } from "../../services/hygraph";

const HomeContainer = styled.div`
  padding: 1rem;
`;

const CreateEntryButton = styled(Link)`
  display: inline-block;
  margin-bottom: 1rem;
  padding: 0.75rem 1.5rem;
  background-color: #0066cc;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-weight: bold;

  &:hover {
    background-color: #0055aa;
  }
`;

const Home: React.FC = () => {
  const fetchEntries = async () => {
    try {
      const results = await getEntries();
      console.log("Fetched entries:", results);
    } catch (error) {
      console.error("Error fetching entries:", error);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);
  return (
    <HomeContainer>
      <h1>My Blog</h1>
      {/* <CreateEntryButton to="/upload">Create New Entry</CreateEntryButton> */}
      {/* <EntryList /> */}
    </HomeContainer>
  );
};

export default Home;
