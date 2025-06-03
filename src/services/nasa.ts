import { AsteroidApiResponse } from "../types/nasaTypes";

const API_NASA_KEY = process.env.REACT_APP_NASA_API_KEY || "";

export interface APODParams {
  date?: string;
  start_date?: string;
  end_date?: string;
  count?: number;
  thumbs?: boolean;
}

export interface AstroidsParams {
  start_date?: string;
  end_date?: string;
}

export const getAstronomyPictureOfTheDay = async (params: APODParams) => {
  const { date, start_date, end_date, count, thumbs } = params;

  const query = new URLSearchParams({ api_key: API_NASA_KEY! });

  if (date) query.append("date", date);
  if (start_date) query.append("start_date", start_date);
  if (end_date) query.append("end_date", end_date);
  if (count) query.append("count", String(count));
  if (thumbs) query.append("thumbs", "true");

  const url = `https://api.nasa.gov/planetary/apod?${query.toString()}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch NASA APOD");
  }

  const data = await response.json();
  return data;
};

export const getAsteroidsApi = async (
  params: AstroidsParams
): Promise<AsteroidApiResponse> => {
  const { start_date, end_date } = params;

  const query = new URLSearchParams({ api_key: API_NASA_KEY! });
  if (start_date) query.append("start_date", start_date);
  if (end_date) query.append("end_date", end_date);

  const url = `https://api.nasa.gov/neo/rest/v1/feed?${query.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch NASA Astroids");
  }

  const data = await response.json();
  return data;
};
