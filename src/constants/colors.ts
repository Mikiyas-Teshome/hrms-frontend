export const ORGANIZATION_THEME_COLORS = [
  { id: "blue", value: "#2865E3" },
  { id: "cyan", value: "#57ACDC" },
  { id: "green", value: "#50C689" },
  { id: "purple", value: "#9C2780" },
  { id: "orange", value: "#FF4500" },
  { id: "light-brown", value: "#CA955F" },
] as const;

export type ThemeColorId = (typeof ORGANIZATION_THEME_COLORS)[number]["id"];

export const DEFAULT_THEME_COLOR_ID: ThemeColorId = "blue";
