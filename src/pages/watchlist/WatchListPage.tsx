import WatchlistTicketComponent from "../../components/watchlistTicket/WatchlistTicketComponent";
import { TicketsContainer } from "./WatchListPageStyles";

const WatchListPage = () => {
  return (
    <div>
      Watch list page
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
