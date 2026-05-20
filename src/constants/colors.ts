export const DARK_COLORS = {
  // Main colors from FlowPilot platform
  primary: "#0066FF", // Bright blue
  primaryLight: "#007AFF",

  // Background colors
  background: "#0F1319", // Very dark almost black
  backgroundSecondary: "#1A1F2E",

  // Text colors
  text: "#FFFFFF",
  textSecondary: "#A0A9B8",

  // Input colors
  inputBackground: "#1A1F2E",
  inputBorder: "#2D3142",
  inputBorderFocused: "#0066FF",

  // Status colors
  success: "#10B981",
  error: "#EF4444",
  warning: "#F59E0B",
  info: "#3B82F6",

  // Neutral
  white: "#FFFFFF",
  black: "#000000",
  gray: {
    50: "#F9FAFB",
    100: "#F3F4F6",
    200: "#E5E7EB",
    300: "#D1D5DB",
    400: "#9CA3AF",
    500: "#6B7280",
    600: "#4B5563",
    700: "#2D3142",
    800: "#1A1F2E",
    900: "#0F1319",
  },
};

export const LIGHT_COLORS = {
  // Keep brand primary while providing a light UI palette.
  primary: "#0066FF",
  primaryLight: "#3B82F6",

  background: "#F5F7FB",
  backgroundSecondary: "#FFFFFF",

  text: "#111827",
  textSecondary: "#6B7280",

  inputBackground: "#FFFFFF",
  inputBorder: "#E5E7EB",
  inputBorderFocused: "#0066FF",

  success: "#10B981",
  error: "#EF4444",
  warning: "#F59E0B",
  info: "#3B82F6",

  white: "#FFFFFF",
  black: "#000000",
  gray: {
    50: "#F9FAFB",
    100: "#F3F4F6",
    200: "#E5E7EB",
    300: "#D1D5DB",
    400: "#9CA3AF",
    500: "#6B7280",
    600: "#4B5563",
    700: "#374151",
    800: "#1F2937",
    900: "#111827",
  },
};

export type ThemePalette = typeof LIGHT_COLORS;

export const COLORS = { ...DARK_COLORS };

export type AppThemeMode = "light" | "dark";

export const setGlobalThemeMode = (mode: AppThemeMode) => {
  const next = mode === "light" ? LIGHT_COLORS : DARK_COLORS;
  Object.assign(COLORS, next);
};

export const GRADIENTS = {
  primary: ["#0066FF", "#0052CC"],
  dark: ["#1A1F2E", "#0F1319"],
};
