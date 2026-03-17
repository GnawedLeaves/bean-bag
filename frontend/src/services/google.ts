const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_API_KEY || "";
// NOT BEING USED ANYMORE COZ GOOGLE NEED PAY
export const getLocationDetails = async (
  latitude: number,
  longitude: number
): Promise<{
  street?: string;
  country?: string;
  error?: string;
}> => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`
    );

    const data = await response.json();

    if (data.status !== "OK") {
      throw new Error("Failed to get location details");
    }

    const addressComponents = data.results[0]?.address_components || [];
    let street = "";
    let country = "";

    addressComponents.forEach((component: any) => {
      if (component.types.includes("route")) {
        street = component.long_name;
      }
      if (component.types.includes("country")) {
        country = component.long_name;
      }
    });

    return {
      street,
      country,
    };
  } catch (error) {
    console.error("Error getting location details:", error);
    return {
      error: "Failed to get location details",
    };
  }
};

export async function getAddressFromCoords(lat: number, lng: number) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.status === "OK") {
    const result = data.results[0];
    const address = result.formatted_address;

    let street = "",
      country = "";
    for (const component of result.address_components) {
      if (component.types.includes("route")) {
        street = component.long_name;
      }
      if (component.types.includes("country")) {
        country = component.long_name;
      }
    }

    return { street, country, fullAddress: address };
  } else {
    throw new Error(`Geocoding error: ${data.status}`);
  }
}
