import { SIZES } from "@/constants";
import { useThemePalette } from "@/hooks/useThemePalette";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import type { ThemePalette } from "@/constants/colors";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "danger";
  disabled?: boolean;
  loading?: boolean;
  size?: "sm" | "md" | "lg";
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

function createStyles(c: ThemePalette) {
  return StyleSheet.create({
    base: {
      height: SIZES.buttonHeight,
      borderRadius: SIZES.radiusLg,
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "row",
    },
    primary: {
      backgroundColor: c.primary,
    },
    secondary: {
      backgroundColor: c.backgroundSecondary,
    },
    outline: {
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: c.inputBorder,
    },
    danger: {
      backgroundColor: c.error,
    },
    sizeSm: {
      height: 40,
    },
    sizeLg: {
      height: 56,
    },
    disabled: {
      opacity: 0.5,
    },
    text: {
      color: c.white,
      fontSize: SIZES.fontBase,
      fontWeight: "600",
      letterSpacing: 0.5,
    },
    textOutline: {
      color: c.primary,
    },
    textSm: {
      fontSize: SIZES.fontSm,
      fontWeight: "500",
    },
    textLg: {
      fontSize: SIZES.fontLg,
      fontWeight: "600",
    },
  });
}

export const Button = ({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  size = "md",
  style,
  textStyle,
}: ButtonProps) => {
  const c = useThemePalette();
  const styles = useMemo(() => createStyles(c), [c]);
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[variant],
        size === "sm" && styles.sizeSm,
        size === "lg" && styles.sizeLg,
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "outline" ? c.primary : c.white}
          size={24}
        />
      ) : (
        <Text
          style={[
            styles.text,
            variant === "outline" && styles.textOutline,
            size === "sm" && styles.textSm,
            size === "lg" && styles.textLg,
            textStyle,
          ]}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};
