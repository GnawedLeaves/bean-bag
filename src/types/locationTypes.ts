export interface LocationModel {
  address: {
    ISO3166_2_lvl6: string;
    amenity?: string;
    city: string;
    city_district: string;
    country: string;
    country_code: string;
    house_number: string;
    neighbourhood: string;
    postcode: string;
    road: string;
    suburb: string;
  };
  addresstype: string;
  boundingbox: [string, string, string, string];
  class: string;
  display_name: string;
  importance: number;
  lat: string;
  licence: string;
  lon: string;
  name: string;
  osm_id: number;
  osm_type: string;
  place_id: number;
  place_rank: number;
  type: string;
}

export interface OutputLocationType extends LocationModel {
  longitude: number;
  latitude: number;
}
