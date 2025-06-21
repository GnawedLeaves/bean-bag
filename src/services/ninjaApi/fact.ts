import { resolve } from "dns";
import { FactModel } from "../../types/ninjaApiTypes";

const REACT_APP_NINJA_API_KEY = process.env.REACT_APP_NINJA_API_KEY || "";

export const getFact = async (): Promise<FactModel[]> => {
  const url = "https://api.api-ninjas.com/v1/facts";

  try {
    const response = await fetch(url, {
      headers: { "X-Api-Key": REACT_APP_NINJA_API_KEY },
    });

    const data = await response.json();

    return data;
  } catch (e) {
    console.log("error getting fact");
    return [];
  }
};
