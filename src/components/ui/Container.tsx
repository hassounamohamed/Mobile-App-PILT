import { SIZES } from "@/constants";
import { useThemePalette } from "@/hooks/useThemePalette";
import React, { useMemo } from "react";
import {
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import type { ThemePalette } from "@/constants/colors";

interface ContainerProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  edges?: ("top" | "right" | "bottom" | "left")[];
  scrollable?: boolean;
}

function createStyles(c: ThemePalette) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: c.background,
    },
    container: {
      flex: 1,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
    },
  });
}

export const Container = ({
  children,
  style,
  edges = ["top", "bottom"],
  scrollable = false,
}: ContainerProps) => {
  const insets = useSafeAreaInsets();
  const c = useThemePalette();
  const styles = useMemo(() => createStyles(c), [c]);

  const containerContent = (
    <View
      style={[
        styles.container,
        {
          paddingTop: edges.includes("top") ? SIZES.lg + insets.top : SIZES.lg,
          paddingBottom: edges.includes("bottom")
            ? SIZES.lg + insets.bottom
            : SIZES.lg,
          paddingLeft: edges.includes("left")
            ? SIZES.lg + insets.left
            : SIZES.lg,
          paddingRight: edges.includes("right")
            ? SIZES.lg + insets.right
            : SIZES.lg,
        },
        style,
      ]}
    >
      {children}
    </View>
  );

  if (scrollable) {
    return (
      <SafeAreaView style={styles.safeArea} edges={edges}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {containerContent}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={edges}>
      {containerContent}
    </SafeAreaView>
  );
};
