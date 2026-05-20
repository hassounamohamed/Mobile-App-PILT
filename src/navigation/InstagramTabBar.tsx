import React, { useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemePalette } from "@/hooks/useThemePalette";
import type { ThemePalette } from "@/constants/colors";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

const ICON_MAP: Record<string, { filled: IoniconName; outline: IoniconName }> = {
  Home:     { filled: "home",                outline: "home-outline" },
  Sprints:  { filled: "flash",               outline: "flash-outline" },
  Stories:  { filled: "list",                outline: "list-outline" },
  Tests:    { filled: "checkmark-circle",     outline: "checkmark-circle-outline" },
  Reports:  { filled: "bar-chart",            outline: "bar-chart-outline" },
  Projects: { filled: "folder",              outline: "folder-outline" },
  Backlog:  { filled: "layers",              outline: "layers-outline" },
  Team:     { filled: "people",              outline: "people-outline" },
  Users:    { filled: "person",              outline: "person-outline" },
  Roles:    { filled: "shield",              outline: "shield-outline" },
  Logs:     { filled: "document-text",       outline: "document-text-outline" },
  Profile:  { filled: "person-circle",       outline: "person-circle-outline" },
};

function createStyles(c: ThemePalette) {
  return StyleSheet.create({
    container: {
      flexDirection: "row",
      backgroundColor: c.backgroundSecondary,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.inputBorder,
      paddingTop: 10,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.12,
          shadowRadius: 12,
        },
        android: { elevation: 16 },
      }),
    },
    tab: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 4,
      gap: 4,
    },
    centerTab: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    centerPill: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: c.primary,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 4,
      shadowColor: c.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 10,
      elevation: 8,
    },
    dot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: c.primary,
      marginTop: 2,
    },
  });
}

export const InstagramTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const c = useThemePalette();
  const styles = useMemo(() => createStyles(c), [c]);

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom || 10 }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const icons = ICON_MAP[route.name] ?? {
          filled: "ellipse",
          outline: "ellipse-outline",
        };

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name as any);
          }
        };

        const onLongPress = () => {
          navigation.emit({ type: "tabLongPress", target: route.key });
        };

        const isCenterBtn =
          state.routes.length === 5 && index === 2;

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={onPress}
            onLongPress={onLongPress}
            style={[styles.tab, isCenterBtn && styles.centerTab]}
            activeOpacity={0.7}
          >
            {isCenterBtn ? (
              <View style={styles.centerPill}>
                <Ionicons
                  name={isFocused ? icons.filled : icons.outline}
                  size={22}
                  color="#fff"
                />
              </View>
            ) : (
              <>
                <Ionicons
                  name={isFocused ? icons.filled : icons.outline}
                  size={26}
                  color={isFocused ? c.primary : c.textSecondary}
                />
                {isFocused && <View style={styles.dot} />}
              </>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
