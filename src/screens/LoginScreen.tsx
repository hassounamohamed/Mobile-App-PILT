import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { SocialButton } from "@/components/ui/SocialButton";
import { TextInputField } from "@/components/ui/TextInputField";
import type { ThemePalette } from "@/constants/colors";
import { SIZES } from "@/constants";
import { useThemePalette } from "@/hooks/useThemePalette";
import { useAuthStore } from "@/context/authStore";
import { AuthStackParamList } from "@/navigation/types";
import { authApi } from "@/services/auth";
import { Ionicons } from "@expo/vector-icons";
import * as AuthSession from "expo-auth-session";
import * as Linking from "expo-linking";
import React, { useMemo, useCallback, useState } from "react";
import * as WebBrowser from "expo-web-browser";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/hooks/useAuth";

function createStyles(c: ThemePalette) {
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.xl,
  },
  header: {
    marginBottom: SIZES.xl,
    alignItems: "center",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SIZES.xl,
  },
  logoImage: {
    height: 150,
    marginBottom: SIZES.sm,
   
  },
  logoText: {
    fontSize: SIZES.fontXl,
    fontWeight: "700",
    color: c.text,
    marginLeft: SIZES.sm,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: SIZES.font2xl,
    fontWeight: "700",
    color: c.text,
    marginBottom: SIZES.sm,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: SIZES.fontBase,
    color: c.textSecondary,
    fontWeight: "400",
  },
  errorCard: {
    marginBottom: SIZES.lg,
    backgroundColor: c.background,
    borderColor: c.error,
  },
  errorContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  errorText: {
    color: c.error,
    fontSize: SIZES.fontSm,
    marginLeft: SIZES.md,
    flex: 1,
  },
  form: {
    marginBottom: SIZES.xl,
  },
  formFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.lg,
    
  },
  forgotPasswordLink: {
    color: c.primary,
    fontSize: SIZES.fontSm,
    fontWeight: "600",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: SIZES.xl,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: c.inputBorder,
  },
  dividerText: {
    color: c.textSecondary,
    fontSize: SIZES.fontSm,
    marginHorizontal: SIZES.md,
    fontWeight: "500",
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: SIZES.md,
    marginBottom: SIZES.xl,
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signupText: {
    color: c.textSecondary,
    fontSize: SIZES.fontBase,
    fontWeight: "400",
  },
  signupLink: {
    color: c.primary,
    fontSize: SIZES.fontBase,
    fontWeight: "600",
  },
});
}

export const LoginScreen = () => {
  const c = useThemePalette();
  const styles = useMemo(() => createStyles(c), [c]);

  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const insets = useSafeAreaInsets();
  const { login, isLoading, error, clearError } = useAuth();
  const {
    setUser,
    setToken,
    setRefreshToken,
    setLoading,
    setError,
  } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const validateForm = useCallback(() => {
    const errors: Record<string, string> = {};

    if (!email) {
      errors.email = "Email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Email invalide";
    }

    if (!password) {
      errors.password = "Mot de passe est requis";
    } else if (password.length < 6) {
      errors.password = "Le mot de passe doit avoir au moins 6 caractères";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [email, password]);

  const handleLogin = useCallback(async () => {
    if (!validateForm()) return;

    try {
      clearError();
      await login(email, password, rememberMe);
    } catch (err) {
      console.error("Login error:", err);
    }
  }, [email, password, rememberMe, validateForm, login, clearError]);

  const getSingleParam = useCallback((value: unknown): string => {
    if (Array.isArray(value)) {
      return String(value[0] ?? "");
    }
    return typeof value === "string" ? value : "";
  }, []);

  const mapRoleCodeToLabel = useCallback((roleCode: string) => {
    switch (roleCode.toUpperCase()) {
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
  }, []);

  const handleOAuthLogin = useCallback(
    async (provider: "google" | "github") => {
      setLoading(true);
      clearError();

      try {
        const startUrl = authApi.getOAuthLoginUrl(provider, "login");
        const returnUrl = AuthSession.makeRedirectUri({
          scheme: "mobileapp",
          path: "auth/oauth/callback",
        });

        const callbackUrl = await new Promise<string>((resolve, reject) => {
          const timeout = setTimeout(() => {
            subscription.remove();
            reject(new Error("OAuth timeout: callback non recu."));
          }, 120000);

          const subscription = Linking.addEventListener("url", ({ url }) => {
            clearTimeout(timeout);
            subscription.remove();
            resolve(url);
          });

          void WebBrowser.openBrowserAsync(startUrl);
        });

        const parsed = Linking.parse(callbackUrl);
        const params = parsed.queryParams ?? {};
        const oauthError = getSingleParam(params.oauth_error);
        const needRole = getSingleParam(params.need_role) === "true";
        const accessToken = getSingleParam(params.access_token);
        const email = getSingleParam(params.email);
        const fullName = getSingleParam(params.nom) || email.split("@")[0];
        const roleCode = getSingleParam(params.role);
        const userId = getSingleParam(params.user_id);

        if (oauthError) {
          throw new Error(oauthError);
        }

        if (needRole) {
          throw new Error(
            "Compte OAuth cree sans role. Contactez le Super Admin pour finaliser l'activation."
          );
        }

        if (!accessToken || !email || !userId) {
          throw new Error("OAuth callback invalide (token ou utilisateur manquant).");
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
      } catch (oauthError) {
        const message =
          oauthError instanceof Error ? oauthError.message : "Erreur OAuth";
        setError(message);
        setLoading(false);
      }
    },
    [
      clearError,
      getSingleParam,
      mapRoleCodeToLabel,
      setError,
      setLoading,
      setRefreshToken,
      setToken,
      setUser,
    ],
  );

  const handleGoogleLogin = useCallback(() => {
    void handleOAuthLogin("google");
  }, [handleOAuthLogin]);

  const handleGitHubLogin = useCallback(() => {
    void handleOAuthLogin("github");
  }, [handleOAuthLogin]);

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              source={require("../../assets/images/flowpilot-logo.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>
            Connectez-vous a votre compte FlowPilot
          </Text>
        </View>

        {/* Error Message */}
        {error && (
          <Card style={styles.errorCard}>
            <View style={styles.errorContent}>
              <Ionicons
                name="alert-circle"
                size={SIZES.iconMd}
                color={c.error}
              />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          </Card>
        )}

        {/* Form */}
        <View style={styles.form}>
          <TextInputField
            label="Email Address"
            placeholder="name@company.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            error={validationErrors.email}
            icon="mail-outline"
          />

          <TextInputField
            label="Password"
            placeholder="Entrez votre mot de passe"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            error={validationErrors.password}
            icon="lock-closed-outline"
          />

          {/* Remember Me & Forgot Password */}
          <View style={styles.formFooter}>
            <Checkbox
              value={rememberMe}
              onPress={() => setRememberMe(!rememberMe)}
              label="Remember me"
            />
            <TouchableOpacity
              onPress={() => navigation.navigate("ForgotPassword")}
            >
              <Text style={styles.forgotPasswordLink}>Forgot password?</Text>
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <Button
            label="Sign in"
            onPress={handleLogin}
            loading={isLoading}
            disabled={isLoading || !email || !password}
            size="lg"
          />
        </View>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>Or continue with</Text>
          <View style={styles.divider} />
        </View>

        {/* Social Buttons */}
        <View style={styles.socialContainer}>
          <SocialButton provider="google" onPress={handleGoogleLogin} />
          <SocialButton provider="github" onPress={handleGitHubLogin} />
        </View>

        {/* Sign Up Link */}
        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Register")}>
            <Text style={styles.signupLink}> Sign up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};


