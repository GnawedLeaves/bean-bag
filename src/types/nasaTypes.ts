export interface NasaApodObject {
  date: string; // e.g., "2021-06-15"
  explanation: string;
  hdurl?: string; // high-res image (optional, sometimes missing)
  media_type: "image" | "video"; // limited to known types
  service_version: string; // e.g., "v1"
  title: string;
  url: string; // main media URL (image or video)
}

export interface AsteroidApiResponse {
  element_count: number;
  links: NasaLinksObject;
  near_earth_objects: Record<string, AsteroidObject[]>;
}

export interface NasaLinksObject {
  self: string;
  next?: string;
  previous?: string;
}

export interface AsteroidObject {
  id: string;
  neo_reference_id: string;
  name: string;
  nasa_jpl_url: string;
  absolute_magnitude_h: number;
  estimated_diameter: EstimatedDiameter;
  is_potentially_hazardous_asteroid: boolean;
  close_approach_data: CloseApproachData[];
  is_sentry_object: boolean;
  links: {
    self: string;
  };
}

export interface EstimatedDiameter {
  kilometers: DiameterMinMax;
  meters: DiameterMinMax;
  miles: DiameterMinMax;
  feet: DiameterMinMax;
}

export interface DiameterMinMax {
  estimated_diameter_min: number;
  estimated_diameter_max: number;
}

export interface CloseApproachData {
  close_approach_date: string;
  close_approach_date_full: string;
  epoch_date_close_approach: number;
  relative_velocity: {
    kilometers_per_second: string;
    kilometers_per_hour: string;
    miles_per_hour: string;
  };
  miss_distance: {
    astronomical: string;
    lunar: string;
    kilometers: string;
    miles: string;
  };
  orbiting_body: string;
}
