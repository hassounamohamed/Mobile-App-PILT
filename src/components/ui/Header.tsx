import { SIZES } from "@/constants";
import { useThemePalette } from "@/hooks/useThemePalette";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { ThemePalette } from "@/constants/colors";

interface HeaderProps {
  title: string;
  subtitle?: string;
  onBackPress?: () => void;
  showBackButton?: boolean;
  icon?: string;
}

function createStyles(c: ThemePalette) {
  return StyleSheet.create({
    container: {
      marginBottom: SIZES.xl,
      alignItems: "center",
    },
    backButton: {
      position: "absolute",
      left: 0,
      top: 0,
      padding: SIZES.md,
      zIndex: 10,
    },
    icon: {
      marginBottom: SIZES.md,
    },
    title: {
      color: c.text,
      fontSize: SIZES.font2xl,
      fontWeight: "700",
      letterSpacing: 0.5,
      marginBottom: SIZES.sm,
    },
    subtitle: {
      color: c.textSecondary,
      fontSize: SIZES.fontBase,
      fontWeight: "400",
      textAlign: "center",
    },
  });
}

export const Header = ({
  title,
  subtitle,
  onBackPress,
  showBackButton = false,
  icon,
}: HeaderProps) => {
  const c = useThemePalette();
  const styles = useMemo(() => createStyles(c), [c]);
  return (
    <View style={styles.container}>
      {showBackButton && (
        <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
          <Ionicons
            name="chevron-back"
            size={SIZES.iconLg}
            color={c.text}
          />
        </TouchableOpacity>
      )}
      {icon && (
        <Ionicons
          name={icon as any}
          size={SIZES.iconXl}
          color={c.primary}
          style={styles.icon}
        />
      )}
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
};
