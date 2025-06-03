const API_NASA_KEY = process.env.REACT_APP_NASA_API_KEY || "";

interface APODParams {
  date?: string;
  start_date?: string;
  end_date?: string;
  count?: number;
  thumbs?: boolean;
}

export const getAstronomyPictureOfTheDay = async (params: APODParams) => {
  const { date, start_date, end_date, count, thumbs } = params;

  const query = new URLSearchParams({ api_key: API_NASA_KEY! });

  if (date) query.append("date", date);
  if (start_date) query.append("start_date", start_date);
  if (end_date) query.append("start_date", end_date);
  if (count) query.append("count", String(count));
  if (thumbs) query.append("thumbs", "true");

  const url = `https://api.nasa.gov/planetary/apod?${query.toString()}`;
  console.log({ url });

  const response = await fetch(url);
  console.log({ response });

  if (!response.ok) {
    throw new Error("Failed to fetch NASA APOD");
  }

  const data = await response.json();
  return data;
};
