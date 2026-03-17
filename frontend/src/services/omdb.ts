import { OmdbDataModel } from "../types/watchListTypes";

interface getOmdbMovieParams {
  searchTeam: string;
  year?: string;
}

// Allow either REACT_APP_OMDB_API_URL (full URL) or REACT_APP_OMDB_API_KEY (apikey only)
const RAW_API_OMDB =
  process.env.REACT_APP_OMDB_API_URL || "https://www.omdbapi.com/";
const API_OMDB_URL = RAW_API_OMDB.replace(/^http:/i, "https:");
const API_OMDB_KEY = process.env.REACT_APP_OMDB_API_KEY || null;

const buildUrl = (params: Record<string, string | undefined>) => {
  // Use the API_OMDB_URL as the base and build query params safely
  const url = new URL(API_OMDB_URL);
  // If API key exists separately, ensure it's present
  if (API_OMDB_KEY && !url.searchParams.get("apikey")) {
    url.searchParams.set("apikey", API_OMDB_KEY);
  }
  // If API_OMDB_URL already included an apikey in its query, keep it.
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, v);
  });
  return url.toString();
};

export const getOmdbMovie = async ({
  searchTeam,
  year,
}: getOmdbMovieParams): Promise<{ data?: OmdbDataModel; error?: string }> => {
  try {
    const url = buildUrl({ t: searchTeam, y: year ?? undefined });
    const response = await fetch(url);
    const data = await response.json();

    if (!data || data.Response === "False") {
      return { error: data?.Error || "Movie not found" };
    }

    return { data };
  } catch (error) {
    return { error: "Failed to fetch movie data" };
  }
};

interface GetOmdbMovieByIdParams {
  imdbId: string;
}

export const getOmdbMovieByImdbId = async ({
  imdbId,
}: GetOmdbMovieByIdParams): Promise<{
  data?: OmdbDataModel;
  error?: string;
}> => {
  try {
    const url = buildUrl({ i: imdbId });
    const response = await fetch(url);
    const data = await response.json();

    if (!data || data.Response === "False") {
      return { error: data?.Error || "Movie not found" };
    }

    return { data };
  } catch (error) {
    return { error: "Failed to fetch movie data" };
  }
};
