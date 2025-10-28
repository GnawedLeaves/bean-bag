import { OmdbDataModel } from "../types/watchListTypes";

interface getOmdbMovieParams {
  searchTeam: string;
  year?: string;
}

const API_OMDB_URL = process.env.REACT_APP_OMDB_API_URL || "";

export const getOmdbMovie = async ({
  searchTeam,
  year,
}: getOmdbMovieParams): Promise<OmdbDataModel | undefined> => {
  if (API_OMDB_URL === "") {
    console.error("No omdb link ");
    return undefined;
  }
  let url = API_OMDB_URL + `&t=${searchTeam}`;
  if (year) {
    url += `&y=${year}`;
  }

  console.log({ url, year });

  const response = await fetch(url);

  console.log({ response });
  return response.json();
};
