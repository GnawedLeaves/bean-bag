import { Button, Image } from "antd";
import {
  WatchListPoster,
  WatchListPosterBack,
  WatchListPosterContainer,
  WatchListPosterInner,
} from "./WatchListPosterStyles";
import { useState } from "react";
import { getOmdbMovie, getOmdbMovieByImdbId } from "../../../services/omdb";
import { OmdbDataModel, WatchlistModel } from "../../../types/watchListTypes";
import { WatchlistSearchButton } from "../../../pages/watchlist/WatchListPageStyles";
import { token } from "../../../theme";

interface WatchlistPosterProps {
  url: string;
  item: WatchlistModel;
  onDelete: (id: string) => void;
}

const WatchlistPoster = ({ url, item, onDelete }: WatchlistPosterProps) => {
  const [flipped, setFlipped] = useState<boolean>(false);
  const [movieData, setMovieData] = useState<OmdbDataModel | undefined>(
    undefined
  );
  const handleOnClick = async () => {
    if (!flipped) {
      const { data, error } = await getOmdbMovie({
        searchTeam: item.title,
      });

      if (error) {
        // setError(error);
      } else if (data) {
        setMovieData(data);
      }
    }
    // setLoading(false);
    setFlipped(!flipped);
  };
  return (
    <WatchListPosterContainer onClick={handleOnClick} clicked={flipped}>
      <WatchListPosterInner clicked={flipped}>
        <WatchListPoster src={url} onClick={handleOnClick} clicked={flipped} />
        <WatchListPosterBack clicked={flipped}>
          {movieData ? (
            <div
              style={{
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                overflow: "hidden",
              }}
            >
              <h3 style={{ margin: 0 }}>
                {movieData.Title} ({movieData.Year})
              </h3>

              <div>Rating: {movieData.imdbRating}/10</div>
              <div>Runtime: {movieData.Runtime}</div>
              <div style={{ fontSize: "12px" }}>
                Director: {movieData.Director}
              </div>
              <div style={{ fontSize: "12px", overflow: "hidden" }}>
                Cast: {movieData.Actors}
              </div>
              <div style={{ fontSize: "12px", overflow: "hidden" }}>
                Plot: {movieData.Plot}
              </div>
            </div>
          ) : (
            <div>Loading...</div>
          )}
          <WatchlistSearchButton
            background={token.colorBgPink}
            width="100%"
            onClick={() => {
              onDelete(item.id);
            }}
          >
            Delete
          </WatchlistSearchButton>
        </WatchListPosterBack>
      </WatchListPosterInner>
    </WatchListPosterContainer>
  );
};

export default WatchlistPoster;
