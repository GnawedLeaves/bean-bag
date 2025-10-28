import { useEffect, useState } from "react";
import { WatchlistModel } from "../../../types/watchListTypes";
import { convertISOToDDMMYYY, formatFirebaseDate } from "../../../utils/utils";
import {
  TicketContainer,
  TicketContainerMain,
  TicketContainerTearable,
  TicketContainerWhole,
  TicketContentContainer,
  TicketNumber,
} from "./WatchlistTicketComponentStyles";

interface WatchlistTicketComponentProps {
  item: WatchlistModel;
  onDelete: (id: string) => void;
}
const WatchlistTicketComponent = ({
  item,
  onDelete,
}: WatchlistTicketComponentProps) => {
  const [price, setPrice] = useState<string>("");
  const [ticketNo, setTicketNo] = useState<string>("");

  const generateRandomPrice = () => {
    const dollars = Math.floor(Math.random() * 15) + 1;
    const cents = Math.floor(Math.random() * 100);
    setPrice(`$${dollars}.${cents.toString().padStart(2, "0")}`);
  };

  const generateRandomTicketNo = () => {
    const randomNumber = Math.floor(Math.random() * 90000) + 10000;
    setTicketNo(`N.${randomNumber}`);
  };

  useEffect(() => {
    generateRandomPrice();
    generateRandomTicketNo();
  }, []);
  return (
    <TicketContainer>
      <TicketContainerMain>
        <TicketContentContainer>
          <div>{formatFirebaseDate(item.dateAdded).slice(0, 11)}</div>
          <div> Ticket | Admit One</div>
          <div style={{ fontSize: 24, textAlign: "center" }}>
            {item.title.slice(0, 18)}
            {item.title.length > 18 && "..."}
          </div>
          <div>{price}</div>
        </TicketContentContainer>

        <TicketNumber>{ticketNo}</TicketNumber>
      </TicketContainerMain>
      <TicketContainerTearable>
        {formatFirebaseDate(item.dateWatched).slice(0, 11)}
      </TicketContainerTearable>
    </TicketContainer>
  );
};

export default WatchlistTicketComponent;
