// src/services/location.ts
export interface LocationData {
    latitude: number;
    longitude: number;
    city?: string;
    country?: string;
  }
  
  export const getCurrentLocation = (): Promise<LocationData> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            
            // Get city and country using reverse geocoding (optional)
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            
            resolve({
              latitude,
              longitude,
              city: data.address?.city || data.address?.town,
              country: data.address?.country
            });
          } catch (error) {
            // If reverse geocoding fails, just return coordinates
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            });
          }
        },
        (error) => {
          reject(error);
        }
      );
    });
  };