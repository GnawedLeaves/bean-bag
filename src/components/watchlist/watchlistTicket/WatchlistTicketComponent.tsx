import { WatchlistModel } from "../../../types/watchListTypes";
import {
  TicketContainer,
  TicketContainerMain,
  TicketContainerTearable,
  TicketContainerWhole,
} from "./WatchlistTicketComponentStyles";

interface WatchlistTicketComponentProps {
  item: WatchlistModel;

  onDelete: (id: string) => void;
}
const WatchlistTicketComponent = ({
  item,
  onDelete,
}: WatchlistTicketComponentProps) => {
  return (
    <>
      <TicketContainer>
        <TicketContainerMain>{item.title}</TicketContainerMain>
        <TicketContainerTearable />
      </TicketContainer>
    </>
  );
};

export default WatchlistTicketComponent;
