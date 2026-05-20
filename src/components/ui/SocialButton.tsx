import { SIZES } from "@/constants";
import { useThemePalette } from "@/hooks/useThemePalette";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";
import type { ThemePalette } from "@/constants/colors";

interface SocialButtonProps {
  provider: "google" | "github";
  onPress: () => void;
  loading?: boolean;
}

function createStyles(c: ThemePalette) {
  return StyleSheet.create({
    button: {
      width: SIZES.inputHeight,
      height: SIZES.inputHeight,
      borderRadius: SIZES.radiusLg,
      backgroundColor: c.inputBackground,
      borderWidth: 1,
      borderColor: c.inputBorder,
      justifyContent: "center",
      alignItems: "center",
    },
  });
}

export const SocialButton = ({
  provider,
  onPress,
  loading = false,
}: SocialButtonProps) => {
  const c = useThemePalette();
  const styles = useMemo(() => createStyles(c), [c]);
  const iconName = provider === "google" ? "logo-google" : "logo-github";
  const iconColor = provider === "google" ? "#EA4335" : c.text;

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={c.text} size={24} />
      ) : (
        <Ionicons
          name={iconName as any}
          size={SIZES.iconLg}
          color={iconColor}
        />
      )}
    </TouchableOpacity>
  );
};
