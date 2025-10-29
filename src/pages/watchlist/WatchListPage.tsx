import {
  Button,
  ConfigProvider,
  Flex,
  Input,
  message,
  Select,
  Spin,
} from "antd";
import { CheckOutlined } from "@ant-design/icons";
import WatchlistTicketComponent from "../../components/watchlist/watchlistTicket/WatchlistTicketComponent";
import {
  SearchContainer,
  TicketsContainer,
  WatchListBigSearchContainer,
  WatchListPosterWrapper,
  WatchlistSearchButton,
  WatchListSearchResults,
  WatchListSearchResultsContent,
  WatchListSearchResultsContentTitle,
  WatchListSearchResultsEmpty,
  WatchListSearchResultsImg,
  WatchListTicketComponentWrapper,
} from "./WatchListPageStyles";
import { useEffect, useMemo, useState } from "react";
import { getOmdbMovie } from "../../services/omdb";
import { OmdbDataModel, WatchlistModel } from "../../types/watchListTypes";
import { BaseOptionType } from "antd/es/select";
import { token } from "../../theme";
import { ThemeProvider } from "styled-components";
import { WatchListContentLayout } from "../../components/watchlist/watchContentLayout/WatchlistContentLayout";
import {
  CustomSpin,
  ImageLoading,
} from "../../components/loading/LoadingStates";
import {
  addDoc,
  collection,
  getDocs,
  Timestamp,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { AgendaItemType } from "../agenda/Agenda";
import { NoticeType } from "antd/es/message/interface";
import WatchlistPoster from "../../components/watchlist/watchlistPoster/WatchListPoster";

const WatchListPage = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [movieData, setMovieData] = useState<OmdbDataModel | undefined>(
    undefined
  );
  const [error, setError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [firebaseLoading, setFirebaseLoading] = useState<boolean>(false);
  const [watchListData, setWatchListData] = useState<WatchlistModel[]>([]);
  const [messageApi, contextHolder] = message.useMessage();

  const handleShowMessage = (message: string, type?: NoticeType) => {
    if (!message || message === "") return;
    messageApi.open({
      type: type,
      content: message,
    });
  };

  const handleGetMovie = async () => {
    if (searchTerm === "") return;

    setLoading(true);
    setError(undefined);
    setMovieData(undefined);

    const { data, error } = await getOmdbMovie({
      searchTeam: searchTerm,
    });

    if (error) {
      setError(error);
    } else if (data) {
      setMovieData(data);
    }
    setLoading(false);
  };

  const handleResetSearch = () => {
    setError(undefined);
    setLoading(false);
    setMovieData(undefined);
    setSearchTerm("");
  };

  const renderLoadingAndError = () => {
    if (loading)
      return (
        <WatchListSearchResultsEmpty>
          <CustomSpin color={token.colorBgGreen} />
        </WatchListSearchResultsEmpty>
      );
    if (!loading && error) {
      return <WatchListSearchResultsEmpty>{error}</WatchListSearchResultsEmpty>;
    }
  };

  const handleGetAllWatchList = async () => {
    try {
      const agendaRef = collection(db, "anniAppWatchlist");
      const snapshot = await getDocs(agendaRef);
      const data = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as WatchlistModel)
      );
      setWatchListData(data);
    } catch (e) {
      console.error("Error getting watch list");
    }
  };

  const handleAddWatchlistItem = async () => {
    if (!movieData) return;

    setFirebaseLoading(true);

    const newItem = {
      title: movieData.Title,
      imdbId: movieData.imdbID,
      isWatched: false,
      dateAdded: Timestamp.now(),
      posterUrl: movieData.Poster,
    };
    try {
      const docRef = await addDoc(collection(db, "anniAppWatchlist"), newItem);
      await handleGetAllWatchList();
      setFirebaseLoading(false);
      handleShowMessage("Successfully added", "success");
    } catch (e) {
      console.error("Error adding to watch list");
      setFirebaseLoading(false);
      handleShowMessage("Add failed", "error");
    }
  };

  // new delete function
  const handleDeleteWatchlistItem = async (id: string) => {
    if (!id) return;
    setFirebaseLoading(true);
    try {
      await deleteDoc(doc(db, "anniAppWatchlist", id));
      await handleGetAllWatchList();
      handleShowMessage("Successfully deleted", "success");
    } catch (e) {
      console.error("Error deleting watch list item", e);
      handleShowMessage("Delete failed", "error");
    } finally {
      setFirebaseLoading(false);
    }
  };

  useEffect(() => {
    handleGetAllWatchList();
  }, []);

  const isMovieExists = useMemo(() => {
    if (movieData)
      return watchListData.some(
        (watchListItem) => watchListItem.imdbId === movieData.imdbID
      );
  }, [movieData, watchListData]);

  const handleOnWatched = async (id: string) => {
    try {
      await updateDoc(doc(db, "anniAppWatchlist", id), {
        isWatched: true,
        dateWatched: Timestamp.now(),
      });
      await handleGetAllWatchList();
      // handleShowMessage("Marked as watched", "success");
    } catch (e) {
      console.error("Error updating watch list item", e);
      handleShowMessage("Update failed", "error");
    }
  };

  return (
    <ConfigProvider
      theme={{
        components: {
          Input: {
            fontFamily: token.fontFamily,
          },
          Message: {
            contentBg: token.colorBg,
            colorBorder: token.borderColor,
            fontFamily: token.fontFamily,
          },
        },
      }}
    >
      <ThemeProvider theme={token}>
        {contextHolder}
        <WatchListContentLayout>
          <h2>Watch list page</h2>
          <WatchListBigSearchContainer>
            <SearchContainer>
              <Input
                allowClear
                style={{
                  border: `2px solid ${token.borderColor}`,
                  borderRadius: token.borderRadius,
                  background: token.colorBg,
                  fontFamily: "monospace",
                }}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClear={handleResetSearch}
                type="text"
                value={searchTerm}
                placeholder="Search for movie or show"
                maxLength={50}
              />
              <WatchlistSearchButton onClick={handleGetMovie}>
                Search
              </WatchlistSearchButton>
            </SearchContainer>

            {movieData && (
              <WatchListSearchResults>
                <WatchListSearchResultsImg src={movieData.Poster} />
                <WatchListSearchResultsContent>
                  <WatchListSearchResultsContentTitle>
                    {movieData.Title} ({movieData.Year})
                  </WatchListSearchResultsContentTitle>
                  <div>
                    {movieData.Runtime} • {movieData.imdbRating}/10 rating
                  </div>
                  <div> {movieData.Actors}</div>
                  <div>{movieData.Plot}</div>
                  <Flex gap={8}>
                    <WatchlistSearchButton
                      width="100%"
                      onClick={() => {
                        if (!isMovieExists) handleAddWatchlistItem();
                      }}
                      background={
                        isMovieExists ? token.colorBg : token.colorBgGreen
                      }
                    >
                      {isMovieExists ? (
                        <Flex gap={4}>
                          <CheckOutlined />
                          Added
                        </Flex>
                      ) : (
                        "Add"
                      )}
                    </WatchlistSearchButton>
                  </Flex>
                </WatchListSearchResultsContent>
              </WatchListSearchResults>
            )}
            {renderLoadingAndError()}
          </WatchListBigSearchContainer>

          <TicketsContainer>
            {watchListData.map((item, index) => {
              return (
                <WatchListPosterWrapper key={index}>
                  <WatchlistPoster
                    url={item.posterUrl}
                    item={item}
                    onDelete={handleDeleteWatchlistItem}
                  />
                  <WatchListTicketComponentWrapper rotation="">
                    <WatchlistTicketComponent
                      key={item.id}
                      item={item}
                      onDelete={() => handleDeleteWatchlistItem(item.id)}
                      onWatched={handleOnWatched}
                    />
                  </WatchListTicketComponentWrapper>
                </WatchListPosterWrapper>
              );
            })}
          </TicketsContainer>
        </WatchListContentLayout>
      </ThemeProvider>
    </ConfigProvider>
  );
};

export default WatchListPage;
