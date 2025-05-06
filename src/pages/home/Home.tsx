import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { getEntries } from "../../services/hygraph";

const HomeContainer = styled.div`
  padding: 1rem;
`;

const EntryCard = styled.div`
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 1rem;
`;

const Image = styled.img`
  max-width: 100px;
  margin-right: 0.5rem;
`;

const Home: React.FC = () => {
  const [entries, setEntries] = useState<any[]>([]);

  const fetchEntries = async () => {
    try {
      const results = await getEntries();
      console.log("Fetched entries:", results);
      setEntries(results);
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
      {entries.map((entry, index) => (
        <EntryCard key={index}>
          <h2>{entry.title}</h2>
          <p>{entry.content}</p>
          <p>
            <strong>Posted on:</strong>{" "}
            {new Date(entry.timestamp).toLocaleString()}
          </p>
          {entry.location && (
            <p>
              <strong>Location:</strong> {entry.location.latitude},{" "}
              {entry.location.longitude}
            </p>
          )}
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            {entry.images?.map((img: any, i: number) => (
              <Image key={i} src={img.url} alt={img.fileName} />
            ))}
          </div>
        </EntryCard>
      ))}
    </HomeContainer>
  );
};

export default Home;
