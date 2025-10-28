import {
  TicketContainer,
  TicketContainerMain,
  TicketContainerTearable,
  TicketContainerWhole,
} from "./WatchlistTicketComponentStyles";

interface WatchlistTicketComponentProps {}
const WatchlistTicketComponent = ({}: WatchlistTicketComponentProps) => {
  return (
    <>
      <TicketContainer>
        <TicketContainerMain></TicketContainerMain>
        <TicketContainerTearable />
      </TicketContainer>
    </>
  );
};

export default WatchlistTicketComponent;
