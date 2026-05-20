import { Button } from "@/components/ui/Button";
import type { ThemePalette } from "@/constants/colors";
import { SIZES } from "@/constants";
import { useThemePalette } from "@/hooks/useThemePalette";
import React, { useMemo } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

interface NotificationPermissionScreenProps {
  onEnable: () => void;
  onSkip: () => void;
  loading?: boolean;
}

function createStyles(c: ThemePalette) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.background,
      paddingHorizontal: SIZES.xl,
      paddingVertical: SIZES.xxl,
      justifyContent: "space-between",
    },
    content: {
      alignItems: "center",
      marginTop: SIZES.xxl,
    },
    logo: {
      height: 120,
      width: 180,
      marginBottom: SIZES.xl,
    },
    title: {
      fontSize: SIZES.font2xl,
      fontWeight: "700",
      color: c.text,
      marginBottom: SIZES.md,
      textAlign: "center",
    },
    body: {
      fontSize: SIZES.fontBase,
      color: c.textSecondary,
      textAlign: "center",
      lineHeight: SIZES.fontBase * SIZES.lineHeightNormal,
    },
    actions: {
      gap: SIZES.md,
    },
    skipButton: {
      backgroundColor: "transparent",
    },
  });
}

export const NotificationPermissionScreen = ({
  onEnable,
  onSkip,
  loading = false,
}: NotificationPermissionScreenProps) => {
  const c = useThemePalette();
  const styles = useMemo(() => createStyles(c), [c]);
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require("../../assets/images/flowpilot-logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Stay in the loop</Text>
        <Text style={styles.body}>
          We use notifications to send updates about projects, sprints, and test
          activity.
        </Text>
      </View>
      <View style={styles.actions}>
        <Button
          label="Enable notifications"
          onPress={onEnable}
          loading={loading}
          size="lg"
        />
        <Button
          label="Not now"
          onPress={onSkip}
          variant="outline"
          size="lg"
          style={styles.skipButton}
        />
      </View>
    </View>
  );
};
