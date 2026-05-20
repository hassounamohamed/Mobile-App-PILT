import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  LinkingOptions,
  NavigationContainer,
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
} from "@react-navigation/native";
import * as Notifications from "expo-notifications";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { COLORS, setGlobalThemeMode } from "./src/constants/colors";
import { useAuthStore } from "./src/context/authStore";
import { useThemeStore } from "./src/context/themeStore";
import { NotificationPermissionScreen } from "./src/screens/NotificationPermissionScreen";

SplashScreen.preventAutoHideAsync();

const NOTIFICATION_PROMPT_KEY = "notification-permission-prompted";

export default function App() {
  // Wait for Zustand persist rehydration
  const [authHydrated, setAuthHydrated] = useState(false);
  const [themeHydrated, setThemeHydrated] = useState(false);
  const [notificationPromptChecked, setNotificationPromptChecked] = useState(false);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  const [isRequestingNotification, setIsRequestingNotification] = useState(false);
  const isDarkMode = useThemeStore((state) => state.isDarkMode);

  const AppNavigator = authHydrated && themeHydrated
    ? require("./src/navigation/AppNavigator").AppNavigator
    : null;

  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      setAuthHydrated(true);
    });
    // In case hydration already finished before this effect runs
    if (useAuthStore.persist.hasHydrated()) {
      setAuthHydrated(true);
    }
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = useThemeStore.persist.onFinishHydration(() => {
      const mode = useThemeStore.getState().mode;
      setGlobalThemeMode(mode);
      setThemeHydrated(true);
    });
    if (useThemeStore.persist.hasHydrated()) {
      const mode = useThemeStore.getState().mode;
      setGlobalThemeMode(mode);
      setThemeHydrated(true);
    }
    return unsub;
  }, []);

  useEffect(() => {
    if (authHydrated && themeHydrated) {
      SplashScreen.hideAsync();
    }
  }, [authHydrated, themeHydrated]);

  useEffect(() => {
    if (!authHydrated || !themeHydrated) return;
    let isMounted = true;

    const checkNotificationPrompt = async () => {
      const [settings, prompted] = await Promise.all([
        Notifications.getPermissionsAsync(),
        AsyncStorage.getItem(NOTIFICATION_PROMPT_KEY),
      ]);

      if (!isMounted) return;

      if (settings.status !== "granted" && !prompted) {
        setShowNotificationPrompt(true);
      }
      setNotificationPromptChecked(true);
    };

    void checkNotificationPrompt();
    return () => {
      isMounted = false;
    };
  }, [authHydrated, themeHydrated]);

  const handleEnableNotifications = async () => {
    setIsRequestingNotification(true);
    await AsyncStorage.setItem(NOTIFICATION_PROMPT_KEY, "1");
    await Notifications.requestPermissionsAsync();
    setIsRequestingNotification(false);
    setShowNotificationPrompt(false);
  };

  const handleSkipNotifications = async () => {
    await AsyncStorage.setItem(NOTIFICATION_PROMPT_KEY, "1");
    setShowNotificationPrompt(false);
  };

  if (!authHydrated || !themeHydrated || !AppNavigator || !notificationPromptChecked) {
    return null;
  }

  const navigationTheme = isDarkMode
    ? {
        ...NavigationDarkTheme,
        colors: {
          ...NavigationDarkTheme.colors,
          primary: COLORS.primary,
          background: COLORS.background,
          card: COLORS.backgroundSecondary,
          text: COLORS.text,
          border: COLORS.inputBorder,
        },
      }
    : {
        ...NavigationDefaultTheme,
        colors: {
          ...NavigationDefaultTheme.colors,
          primary: COLORS.primary,
          background: COLORS.background,
          card: COLORS.backgroundSecondary,
          text: COLORS.text,
          border: COLORS.inputBorder,
        },
      };

  const linking: LinkingOptions<any> = {
    prefixes: ["mobileapp://"],
    config: {
      screens: {
        OAuthCallback: "auth/oauth/callback",
        ResetPassword: "auth/reset-password",
      },
    },
  };

  return (
    <SafeAreaProvider>
      {showNotificationPrompt ? (
        <NotificationPermissionScreen
          onEnable={handleEnableNotifications}
          onSkip={handleSkipNotifications}
          loading={isRequestingNotification}
        />
      ) : (
        <NavigationContainer theme={navigationTheme} linking={linking}>
          <AppNavigator />
        </NavigationContainer>
      )}
    </SafeAreaProvider>
  );
}
