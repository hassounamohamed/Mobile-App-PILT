import { SIZES } from "@/constants";
import { useThemePalette } from "@/hooks/useThemePalette";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import type { ThemePalette } from "@/constants/colors";

interface RadioButtonProps {
  label: string;
  value: string;
  selected: boolean;
  onPress: () => void;
  icon?: string;
  description?: string;
  style?: StyleProp<ViewStyle>;
}

function createStyles(c: ThemePalette) {
  return StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "flex-start",
      paddingVertical: SIZES.md,
      paddingHorizontal: SIZES.lg,
      marginVertical: SIZES.sm,
      borderRadius: SIZES.radiusLg,
      backgroundColor: c.inputBackground,
      borderWidth: 1,
      borderColor: c.inputBorder,
    },
    containerSelected: {
      backgroundColor: c.backgroundSecondary,
      borderColor: c.primary,
    },
    radio: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: c.textSecondary,
      justifyContent: "center",
      alignItems: "center",
      marginRight: SIZES.md,
      marginTop: SIZES.xs,
    },
    radioDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: c.primary,
    },
    content: {
      flex: 1,
    },
    labelContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    icon: {
      marginRight: SIZES.sm,
    },
    label: {
      color: c.textSecondary,
      fontSize: SIZES.fontBase,
      fontWeight: "500",
    },
    labelSelected: {
      color: c.primary,
      fontWeight: "600",
    },
    description: {
      color: c.textSecondary,
      fontSize: SIZES.fontSm,
      marginTop: SIZES.xs,
      fontWeight: "400",
    },
  });
}

export const RadioButton = ({
  label,
  value,
  selected,
  onPress,
  icon,
  description,
  style,
}: RadioButtonProps) => {
  const c = useThemePalette();
  const styles = useMemo(() => createStyles(c), [c]);
  return (
    <TouchableOpacity
      style={[styles.container, selected && styles.containerSelected, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.radio}>
        {selected && <View style={styles.radioDot} />}
      </View>
      <View style={styles.content}>
        <View style={styles.labelContainer}>
          {icon && (
            <Ionicons
              name={icon as any}
              size={SIZES.iconMd}
              color={selected ? c.primary : c.textSecondary}
              style={styles.icon}
            />
          )}
          <Text style={[styles.label, selected && styles.labelSelected]}>
            {label}
          </Text>
        </View>
        {description && <Text style={styles.description}>{description}</Text>}
      </View>
    </TouchableOpacity>
  );
};
