export interface BlogImage {
  __typename: "Asset";
  fileName: string;
  url: string;
}

export interface BlogLocation {
  __typename: "Location";
  latitude: number;
  longitude: number;
}

export interface BlogEntry {
  __typename: "BlogEntry";
  title: string;
  content: string;
  timestamp: string;
  images: BlogImage[];
  location: BlogLocation;
  streetLocation?: BlogStreetLocation;
}

export interface BlogStreetLocation {
  street: string;
  country: string;
  fullAddress: any;
}
