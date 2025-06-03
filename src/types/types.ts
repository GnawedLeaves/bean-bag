export interface NasaApodObject {
  date: string; // e.g., "2021-06-15"
  explanation: string;
  hdurl?: string; // high-res image (optional, sometimes missing)
  media_type: "image" | "video"; // limited to known types
  service_version: string; // e.g., "v1"
  title: string;
  url: string; // main media URL (image or video)
}
