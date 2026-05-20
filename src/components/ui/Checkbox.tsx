import { SIZES } from "@/constants";
import { useThemePalette } from "@/hooks/useThemePalette";
import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { ThemePalette } from "@/constants/colors";

interface CheckboxProps {
  value: boolean;
  onPress: () => void;
  label?: string;
}

function createStyles(c: ThemePalette) {
  return StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: SIZES.md,
    },
    checkbox: {
      width: 20,
      height: 20,
      borderRadius: SIZES.radiusSm,
      borderWidth: 2,
      borderColor: c.inputBorder,
      justifyContent: "center",
      alignItems: "center",
      marginRight: SIZES.sm,
    },
    checkboxChecked: {
      backgroundColor: c.primary,
      borderColor: c.primary,
    },
    checkmark: {
      color: c.white,
      fontSize: SIZES.fontBase,
      fontWeight: "bold",
    },
    label: {
      color: c.text,
      fontSize: SIZES.fontSm,
      fontWeight: "500",
    },
  });
}

export const Checkbox = ({ value, onPress, label }: CheckboxProps) => {
  const c = useThemePalette();
  const styles = useMemo(() => createStyles(c), [c]);
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.checkbox, value && styles.checkboxChecked]}
        onPress={onPress}
      >
        {value && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>
      {label && <Text style={styles.label}>{label}</Text>}
    </View>
  );
};
