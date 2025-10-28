import { Image } from "antd";
import {
  WatchListPoster,
  WatchListPosterBack,
  WatchListPosterContainer,
  WatchListPosterInner,
} from "./WatchListPosterStyles";
import { useState } from "react";
import { getOmdbMovie, getOmdbMovieByImdbId } from "../../../services/omdb";
import { OmdbDataModel, WatchlistModel } from "../../../types/watchListTypes";

interface WatchlistPosterProps {
  url: string;
  item: WatchlistModel;
}

const WatchlistPoster = ({ url, item }: WatchlistPosterProps) => {
  const [flipped, setFlipped] = useState<boolean>(false);
  const [movieData, setMovieData] = useState<OmdbDataModel | undefined>(
    undefined
  );
  const handleOnClick = async () => {
    if (!flipped) {
      const { data, error } = await getOmdbMovie({
        searchTeam: item.title,
      });
      // const { data, error } = await getOmdbMovieByImdbId({
      //   imdbId: item.imdbId,
      // });

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
              {/* <Image
                src={movieData.Poster}
                alt={movieData.Title}
                width={100}
                style={{ alignSelf: "center" }}
              /> */}
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
        </WatchListPosterBack>
      </WatchListPosterInner>
    </WatchListPosterContainer>
  );
};

export default WatchlistPoster;
