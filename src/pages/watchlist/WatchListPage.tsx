import { Button, Input } from "antd";
import WatchlistTicketComponent from "../../components/watchlistTicket/WatchlistTicketComponent";
import { TicketsContainer } from "./WatchListPageStyles";
import { useState } from "react";
import { getOmdbMovie } from "../../services/omdb";

const WatchListPage = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [year, setYear] = useState<string>("2020");

  const handleGetMovie = async () => {
    if (searchTerm !== "") {
      console.log("clicking", searchTerm);

      const response = await getOmdbMovie({
        searchTeam: searchTerm,
        year: year,
      });
    }
  };
  return (
    <div>
      Watch list page
      <Input
        required
        onChange={(e) => {
          setSearchTerm(e.target.value);
        }}
      />
      <Button
        onClick={() => {
          handleGetMovie();
        }}
      >
        Search
      </Button>
      <TicketsContainer>
        <WatchlistTicketComponent />
        <WatchlistTicketComponent />
        <WatchlistTicketComponent />
        <WatchlistTicketComponent />
      </TicketsContainer>
    </div>
  );
};

export default WatchListPage;
