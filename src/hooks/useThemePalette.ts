import { useMemo } from "react";
import { DARK_COLORS, LIGHT_COLORS, type ThemePalette } from "@/constants/colors";
import { useThemeStore } from "@/context/themeStore";

export function useThemePalette(): ThemePalette {
  const isDarkMode = useThemeStore((s) => s.isDarkMode);
  return useMemo(
    () => (isDarkMode ? DARK_COLORS : LIGHT_COLORS),
    [isDarkMode],
  );
}
