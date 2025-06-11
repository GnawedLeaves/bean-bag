interface BlogImage {
  __typename: "Asset";
  fileName: string;
  url: string;
}

interface BlogLocation {
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
}
