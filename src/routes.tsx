export interface RouteConfig {
  path: string;
  name: string;
}

export const ROUTES: Record<string, RouteConfig> = {
  HOME: {
    path: "/",
    name: "Home",
  },
  UPLOAD: {
    path: "/upload",
    name: "Upload",
  },
  SPACE: {
    path: "/space",
    name: "Space",
  },
  LOGIN: {
    path: "/login",
    name: "Login",
  },
  PLANTS: {
    path: "/plants",
    name: "Plants",
  },
  PLANTS_UPLOAD: {
    path: "/plantsUpload",
    name: "Upload Plants",
  },
} as const;
