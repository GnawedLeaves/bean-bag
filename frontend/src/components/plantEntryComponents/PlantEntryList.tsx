// src/components/blog/EntryList.tsx
import React from "react";
import styled from "styled-components";
import { gql, useQuery } from "@apollo/client";
import EntryCard from "./PlantEntryCard";

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const LoadingMessage = styled.div`
  padding: 2rem;
  text-align: center;
  font-style: italic;
`;

const ErrorMessage = styled.div`
  padding: 1rem;
  background-color: #ffeeee;
  color: #cc0000;
  border-radius: 4px;
`;

const GET_ENTRIES = gql`
  query GetEntries {
    entries(orderBy: timestamp_DESC) {
      id
      title
      content
      timestamp
      location
      images {
        id
        url
      }
    }
  }
`;

const EntryList: React.FC = () => {
  const { loading, error, data } = useQuery(GET_ENTRIES);

  if (loading) return <LoadingMessage>Loading entries...</LoadingMessage>;
  if (error)
    return <ErrorMessage>Error loading entries: {error.message}</ErrorMessage>;

  return (
    <ListContainer>
      {data?.entries.length === 0 ? (
        <p>No entries yet. Create your first one!</p>
      ) : (
        data?.entries.map((entry: any) => (
          <EntryCard key={entry.id} entry={entry} />
        ))
      )}
    </ListContainer>
  );
};

export default EntryList;
