import { OmdbDataModel } from "../types/watchListTypes";

interface getOmdbMovieParams {
  searchTeam: string;
  year?: string;
}

const API_OMDB_URL = process.env.REACT_APP_OMDB_API_URL || "";

export const getOmdbMovie = async ({
  searchTeam,
  year,
}: getOmdbMovieParams): Promise<{ data?: OmdbDataModel; error?: string }> => {
  if (API_OMDB_URL === "") {
    return { error: "No OMDB API URL configured" };
  }
  let url = API_OMDB_URL + `&t=${searchTeam}`;
  if (year) {
    url += `&y=${year}`;
  }

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.Response === "False") {
      return { error: data.Error || "Movie not found" };
    }

    return { data };
  } catch (error) {
    return { error: "Failed to fetch movie data" };
  }
};
