import { SIZES } from "@/constants";
import { useThemePalette } from "@/hooks/useThemePalette";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import type { ThemePalette } from "@/constants/colors";

interface TextInputFieldProps {
  label?: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "phone-pad" | "numeric";
  error?: string;
  editable?: boolean;
  style?: StyleProp<ViewStyle>;
  icon?: string;
}

function createStyles(c: ThemePalette) {
  return StyleSheet.create({
    container: {
      marginBottom: SIZES.lg,
    },
    label: {
      color: c.text,
      fontSize: SIZES.fontSm,
      fontWeight: "600",
      marginBottom: SIZES.sm,
      letterSpacing: 0.3,
    },
    inputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      height: SIZES.inputHeight,
      backgroundColor: c.inputBackground,
      borderRadius: SIZES.radiusLg,
      borderWidth: 1,
      borderColor: c.inputBorder,
      paddingHorizontal: SIZES.md,
    },
    inputWrapperFocused: {
      borderColor: c.inputBorderFocused,
      backgroundColor: c.backgroundSecondary,
    },
    inputWrapperError: {
      borderColor: c.error,
    },
    icon: {
      marginRight: SIZES.sm,
    },
    input: {
      flex: 1,
      color: c.text,
      fontSize: SIZES.fontBase,
      fontWeight: "400",
    },
    inputWithIcon: {
      marginLeft: 0,
    },
    iconButton: {
      padding: SIZES.sm,
      marginLeft: SIZES.sm,
    },
    errorText: {
      color: c.error,
      fontSize: SIZES.fontSm,
      marginTop: SIZES.sm,
      fontWeight: "500",
    },
  });
}

export const TextInputField = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
  error,
  editable = true,
  style,
  icon,
}: TextInputFieldProps) => {
  const c = useThemePalette();
  const styles = useMemo(() => createStyles(c), [c]);
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(!secureTextEntry);

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputWrapperFocused,
          error && styles.inputWrapperError,
        ]}
      >
        {icon && (
          <Ionicons
            name={icon as any}
            size={SIZES.iconMd}
            color={isFocused ? c.primary : c.textSecondary}
            style={styles.icon}
          />
        )}
        <TextInput
          style={[styles.input, icon && styles.inputWithIcon]}
          placeholder={placeholder}
          placeholderTextColor={c.textSecondary}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          editable={editable}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.iconButton}
          >
            <Ionicons
              name={showPassword ? "eye-outline" : "eye-off-outline"}
              size={SIZES.iconMd}
              color={c.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};
