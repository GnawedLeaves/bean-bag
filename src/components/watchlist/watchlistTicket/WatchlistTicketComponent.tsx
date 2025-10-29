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
  onWatched: (id: string) => void;
}
const WatchlistTicketComponent = ({
  item,
  onDelete,
  onWatched,
}: WatchlistTicketComponentProps) => {
  const [price, setPrice] = useState<string>("");
  const [ticketNo, setTicketNo] = useState<string>("");
  const [tearing, setTearing] = useState<boolean>(false);
  const [isTeared, setIsTeared] = useState<boolean>(false);

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
    if (item.isWatched) {
      setIsTeared(true);
    }
  }, []);

  const playTearAnimation = () => {
    if (!isTeared) {
      setTearing(true);
      onWatched(item.id);
    }
  };
  return (
    <TicketContainer
      onClick={() => {
        playTearAnimation();
      }}
    >
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
      <TicketContainerTearable tearing={tearing} isTeared={isTeared}>
        {formatFirebaseDate(item.dateWatched).slice(0, 11)}
      </TicketContainerTearable>
    </TicketContainer>
  );
};

export default WatchlistTicketComponent;
