import { SIZES } from "@/constants";
import { useThemePalette } from "@/hooks/useThemePalette";
import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import type { ThemePalette } from "@/constants/colors";

interface CardProps {
  children: React.ReactNode;
  variant?: "default" | "elevated";
  style?: any;
}

function createStyles(c: ThemePalette) {
  return StyleSheet.create({
    card: {
      backgroundColor: c.backgroundSecondary,
      borderRadius: SIZES.radiusLg,
      padding: SIZES.lg,
      borderWidth: 1,
      borderColor: c.inputBorder,
    },
    elevated: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 5,
    },
  });
}

export const Card = ({ children, variant = "default", style }: CardProps) => {
  const c = useThemePalette();
  const styles = useMemo(() => createStyles(c), [c]);
  return (
    <View
      style={[styles.card, variant === "elevated" && styles.elevated, style]}
    >
      {children}
    </View>
  );
};
