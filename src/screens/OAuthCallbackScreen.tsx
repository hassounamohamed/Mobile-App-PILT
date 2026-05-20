import type { ThemePalette } from "@/constants/colors";
import { SIZES } from "@/constants";
import { useAuthStore } from "@/context/authStore";
import { useThemePalette } from "@/hooks/useThemePalette";
import { AuthStackParamList } from "@/navigation/types";
import { authApi } from "@/services/auth";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useMemo } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

type OAuthCallbackRouteProp = RouteProp<AuthStackParamList, "OAuthCallback">;

function mapRoleCodeToLabel(roleCode?: string) {
  const normalized = (roleCode || "").toUpperCase();
  switch (normalized) {
    case "SUPER_ADMIN":
    case "SUPERADMIN":
    case "SUPER_ADMINISTRATEUR":
      return "Super Admin" as const;
    case "TESTEUR_QA":
      return "Testeur QA" as const;
    case "PRODUCT_OWNER":
      return "Product Owner" as const;
    case "SCRUM_MASTER":
      return "Scrum Master" as const;
    case "DEVELOPPEUR":
    default:
      return "Développeur" as const;
  }
}

function createStyles(c: ThemePalette) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.background,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: SIZES.lg,
    },
    text: {
      marginTop: SIZES.md,
      color: c.textSecondary,
      fontSize: SIZES.fontBase,
    },
  });
}

export const OAuthCallbackScreen = () => {
  const route = useRoute<OAuthCallbackRouteProp>();
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const { setUser, setToken, setRefreshToken, setError, setLoading } =
    useAuthStore();
  const c = useThemePalette();
  const styles = useMemo(() => createStyles(c), [c]);

  useEffect(() => {
    const params = route.params || {};
    const oauthError = params.oauth_error || "";
    const needRole = String(params.need_role || "") === "true";
    const pendingActivation = String(params.pending_activation || "") === "1";
    const accessToken = params.access_token || "";
    const email = params.email || "";
    const fullName = params.nom || email.split("@")[0] || "User";
    const roleCode = params.role || "";
    const userId = params.user_id || "";

    if (oauthError) {
      setError(oauthError);
      navigation.navigate("Login");
      return;
    }

    if (needRole || pendingActivation) {
      setError(
        "Votre compte sera active apres l'activation du Super Admin."
      );
      navigation.navigate("Register");
      return;
    }

    if (!accessToken || !email || !userId) {
      setError("OAuth callback invalide.");
      navigation.navigate("Login");
      return;
    }

    authApi.setAuthToken(accessToken);
    setUser({
      id: userId,
      email,
      fullName,
      phoneNumber: "",
      role: mapRoleCodeToLabel(roleCode),
      createdAt: new Date().toISOString(),
    });
    setToken(accessToken);
    setRefreshToken("");
    setError(null);
    setLoading(false);
  }, [navigation, route.params, setError, setLoading, setRefreshToken, setToken, setUser]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={c.primary} />
      <Text style={styles.text}>Connexion OAuth en cours...</Text>
    </View>
  );
};
