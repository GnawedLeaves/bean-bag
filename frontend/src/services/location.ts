import { LocationModel, OutputLocationType } from "../types/locationTypes";

export interface LocationData {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
}

export const getLocationFromCoords = (
  latitude: number,
  longitude: number
): Promise<LocationModel> => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      );
      const data: LocationModel = await response.json();
      resolve(data);
    } catch (e) {
      console.error("Error getting location");
    }
  });
};

export const getCurrentLocation = (): Promise<OutputLocationType> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data: LocationModel = await response.json();
          const outputData = {
            ...data,
            latitude: latitude,
            longitude: longitude,
          };

          resolve(outputData);
        } catch (error) {
          console.log("error getting location");
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        }
      },
      (error) => {
        reject(error);
      }
    );
  });
};
