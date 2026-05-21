import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SocialButton } from "@/components/ui/SocialButton";
import { TextInputField } from "@/components/ui/TextInputField";
import type { ThemePalette } from "@/constants/colors";
import { SIZES } from "@/constants";
import { useThemePalette } from "@/hooks/useThemePalette";
import { useThemeStore } from "@/context/themeStore";
import { USER_ROLES } from "@/constants/roles";
import { useAuthStore } from "@/context/authStore";
import { AuthStackParamList } from "@/navigation/types";
import { authApi } from "@/services/auth";
import { UserRole } from "@/types/auth";
import { Ionicons } from "@expo/vector-icons";
import * as AuthSession from "expo-auth-session";
import * as Linking from "expo-linking";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useMemo, useCallback, useState } from "react";
import * as WebBrowser from "expo-web-browser";
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
    alignItems: "center",
    marginBottom: SIZES.xl,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SIZES.xs,
  },
  logoImage: {
    height: 150,
    marginBottom: 0,
  },
  title: {
    fontSize: SIZES.font2xl,
    fontWeight: "700",
    color: c.text,
    marginTop: SIZES.xs,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: SIZES.fontBase,
    color: c.textSecondary,
    textAlign: "center",
    marginTop: SIZES.sm,
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
    fontWeight: "500",
  },
  formCard: {
    marginBottom: SIZES.xl,
    borderColor: c.inputBorder,
    backgroundColor: c.background,
  },
  form: {
    gap: SIZES.sm,
  },
  roleSection: {
    marginTop: SIZES.sm,
    marginBottom: SIZES.md,
  },
  roleLabel: {
    color: c.text,
    fontSize: SIZES.fontSm,
    fontWeight: "600",
    marginBottom: SIZES.xs,
    letterSpacing: 0.3,
  },
  roleHint: {
    color: c.textSecondary,
    fontSize: SIZES.fontXs,
    marginBottom: SIZES.md,
  },
  roleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SIZES.sm,
    marginBottom: SIZES.md,
  },
  roleButton: {
    width: "31%",
    minHeight: 74,
    backgroundColor: c.inputBackground,
    borderRadius: SIZES.radiusLg,
    borderWidth: 1,
    borderColor: c.inputBorder,
    justifyContent: "center",
    alignItems: "center",
    padding: SIZES.sm,
  },
  roleButtonSelected: {
    backgroundColor: c.backgroundSecondary,
    borderColor: c.primary,
  },
  roleButtonText: {
    color: c.textSecondary,
    fontSize: SIZES.fontXs,
    fontWeight: "600",
    marginTop: SIZES.xs,
    textAlign: "center",
  },
  roleButtonTextSelected: {
    color: c.primary,
    fontWeight: "600",
  },
  registerButton: {
    marginTop: SIZES.sm,
  },
  termsText: {
    color: c.textSecondary,
    fontSize: SIZES.fontXs,
    textAlign: "center",
    marginTop: SIZES.md,
    lineHeight: SIZES.fontSm * SIZES.lineHeightNormal,
  },
  termsLink: {
    color: c.primary,
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
    fontSize: SIZES.fontXs,
    marginHorizontal: SIZES.md,
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: SIZES.md,
    marginBottom: SIZES.xl,
  },
  signinContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signinText: {
    color: c.textSecondary,
    fontSize: SIZES.fontBase,
    fontWeight: "400",
  },
  signinLink: {
    color: c.primary,
    fontSize: SIZES.fontBase,
    fontWeight: "600",
  },
  successState: {
    gap: SIZES.md,
    alignItems: "center",
    paddingVertical: SIZES.md,
  },
  successTitle: {
    fontSize: SIZES.fontLg,
    fontWeight: "700",
    color: c.text,
    textAlign: "center",
  },
  successText: {
    fontSize: SIZES.fontBase,
    color: c.textSecondary,
    textAlign: "center",
    lineHeight: SIZES.fontBase * SIZES.lineHeightNormal,
  },
  strengthContainer: {
    marginBottom: SIZES.lg,
    padding: SIZES.md,
    backgroundColor: c.inputBackground,
    borderRadius: SIZES.radiusLg,
    borderWidth: 1,
    borderColor: c.inputBorder,
  },
  strengthHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.sm,
  },
  strengthLabel: {
    fontSize: SIZES.fontXs,
    color: c.textSecondary,
    fontWeight: "500",
  },
  strengthValueText: {
    fontSize: SIZES.fontXs,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  strengthBarBackground: {
    height: 6,
    backgroundColor: c.inputBorder,
    borderRadius: SIZES.radiusRound,
    overflow: "hidden",
    marginBottom: SIZES.md,
  },
  strengthBarActive: {
    height: "100%",
    borderRadius: SIZES.radiusRound,
  },
  rulesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: SIZES.sm,
    columnGap: SIZES.xs,
  },
  ruleItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "48%",
    gap: SIZES.xs,
  },
  ruleItemFull: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    gap: SIZES.xs,
    marginTop: 2,
  },
  ruleText: {
    fontSize: SIZES.fontXs - 1,
    color: c.textSecondary,
    fontWeight: "400",
  },
  ruleTextValid: {
    color: c.success,
    fontWeight: "500",
  },
  themeToggle: {
    position: "absolute",
    right: SIZES.lg,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: c.inputBackground,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: c.inputBorder,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
}

export const RegisterScreen = () => {
  const c = useThemePalette();
  const styles = useMemo(() => createStyles(c), [c]);
  const { isDarkMode, toggleMode } = useThemeStore();

  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const insets = useSafeAreaInsets();
  const { register, isLoading, error, clearError } = useAuth();
  const { setLoading, setError } = useAuthStore();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const passwordChecks = useMemo(() => {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    };
  }, [password]);

  const passwordStrength = useMemo(() => {
    if (!password) return 0;
    let score = 0;
    if (passwordChecks.length) score++;
    if (passwordChecks.uppercase) score++;
    if (passwordChecks.lowercase) score++;
    if (passwordChecks.number) score++;
    if (passwordChecks.special) score++;
    return score;
  }, [password, passwordChecks]);

  const validateForm = useCallback(() => {
    const errors: Record<string, string> = {};

    if (!fullName.trim()) {
      errors.fullName = "Le nom complet est requis";
    }

    if (!email) {
      errors.email = "Email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Email invalide";
    }

    if (!phoneNumber.trim()) {
      errors.phoneNumber = "Le numéro de téléphone est requis";
    }

    if (!selectedRole) {
      errors.role = "Sélectionnez un rôle";
    }

    if (!password) {
      errors.password = "Le mot de passe est requis";
    } else if (passwordStrength < 5) {
      errors.password = "Le mot de passe doit remplir toutes les conditions de sécurité";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Confirmez le mot de passe";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Les mots de passe ne correspondent pas";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [fullName, email, phoneNumber, selectedRole, password, confirmPassword, passwordStrength]);

  const handleRegister = useCallback(async () => {
    if (!validateForm()) return;

    try {
      clearError();
      await register(fullName, email, phoneNumber, selectedRole, password);
      setSubmitted(true);
    } catch (err) {
      console.error("Register error:", err);
    }
  }, [
    fullName,
    email,
    phoneNumber,
    selectedRole,
    password,
    validateForm,
    register,
    clearError,
  ]);

  const handleGoogleSignup = useCallback(() => {
    void (async () => {
      setLoading(true);
      clearError();
      try {
        const startUrl = authApi.getOAuthLoginUrl("google", "register");
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
        const oauthError =
          typeof params.oauth_error === "string" ? params.oauth_error : "";
        const pendingActivation =
          String(params.pending_activation ?? "") === "1";

        if (oauthError) {
          throw new Error(oauthError);
        }
        if (pendingActivation) {
          setSubmitted(true);
          return;
        }

        setSubmitted(true);
      } catch (oauthError) {
        const message =
          oauthError instanceof Error ? oauthError.message : "Erreur OAuth";
        setError(message);
      } finally {
        setLoading(false);
      }
    })();
  }, [clearError, setError, setLoading]);

  const handleGitHubSignup = useCallback(() => {
    void (async () => {
      setLoading(true);
      clearError();
      try {
        const startUrl = authApi.getOAuthLoginUrl("github", "register");
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
        const oauthError =
          typeof params.oauth_error === "string" ? params.oauth_error : "";
        const pendingActivation =
          String(params.pending_activation ?? "") === "1";

        if (oauthError) {
          throw new Error(oauthError);
        }
        if (pendingActivation) {
          setSubmitted(true);
          return;
        }

        setSubmitted(true);
      } catch (oauthError) {
        const message =
          oauthError instanceof Error ? oauthError.message : "Erreur OAuth";
        setError(message);
      } finally {
        setLoading(false);
      }
    })();
  }, [clearError, setError, setLoading]);

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
      <TouchableOpacity
        style={[styles.themeToggle, { top: insets.top > 0 ? insets.top + SIZES.sm : SIZES.md }]}
        onPress={toggleMode}
        activeOpacity={0.8}
      >
        <Ionicons
          name={isDarkMode ? "sunny-outline" : "moon-outline"}
          size={SIZES.iconMd}
          color={c.text}
        />
      </TouchableOpacity>

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
          <Text style={styles.title}>Create your account</Text>
          <Text style={styles.subtitle}>
            Start managing your Agile projects today.
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
        <Card style={styles.formCard}>
          {submitted ? (
            <View style={styles.successState}>
              <Ionicons
                name="checkmark-circle"
                size={SIZES.iconXl}
                color={c.success}
              />
              <Text style={styles.successTitle}>Compte cree avec succes</Text>
              <Text style={styles.successText}>
                Vous pouvez vous connecter a votre compte apres l'activation du
                Super Admin.
              </Text>
              <Button
                label="Aller au login"
                onPress={() => navigation.navigate("Login")}
                size="lg"
              />
            </View>
          ) : (
          <View style={styles.form}>
          <TextInputField
            label="Full Name"
            placeholder="Jane Doe"
            value={fullName}
            onChangeText={setFullName}
            error={validationErrors.fullName}
            icon="person-outline"
          />

          <TextInputField
            label="Work Email"
            placeholder="jane@company.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            error={validationErrors.email}
            icon="mail-outline"
          />

          <TextInputField
            label="Phone Number"
            placeholder="+1234567890"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            error={validationErrors.phoneNumber}
            icon="call-outline"
          />

          {/* Role Selection */}
          <View style={styles.roleSection}>
            <Text style={styles.roleLabel}>Your Role</Text>
            <Text style={styles.roleHint}>
              Select the role that matches your responsibilities.
            </Text>
            <View style={styles.roleGrid}>
              {USER_ROLES.filter((role) => role.label !== "Super Admin").map((role) => (
                <TouchableOpacity
                  key={role.label}
                  style={[
                    styles.roleButton,
                    selectedRole === role.label && styles.roleButtonSelected,
                  ]}
                  onPress={() => setSelectedRole(role.label as UserRole)}
                  activeOpacity={0.85}
                >
                  <Ionicons
                    name={role.icon as any}
                    size={SIZES.iconMd}
                    color={
                      selectedRole === role.label
                        ? c.primary
                        : c.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.roleButtonText,
                      selectedRole === role.label &&
                        styles.roleButtonTextSelected,
                    ]}
                  >
                    {role.label === "Développeur" && "Dev"}
                    {role.label === "Testeur QA" && "QA"}
                    {role.label === "Product Owner" && "PO"}
                    {role.label === "Scrum Master" && "Scrum"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {validationErrors.role && (
              <Text style={styles.errorText}>{validationErrors.role}</Text>
            )}
          </View>

          <TextInputField
            label="Password"
            placeholder="Min. 8 characters"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            error={validationErrors.password}
            icon="lock-closed-outline"
          />

          {password.length > 0 && (
            <View style={styles.strengthContainer}>
              <View style={styles.strengthHeader}>
                <Text style={styles.strengthLabel}>Force du mot de passe :</Text>
                <Text
                  style={[
                    styles.strengthValueText,
                    passwordStrength <= 2 && { color: c.error },
                    (passwordStrength === 3 || passwordStrength === 4) && { color: c.warning },
                    passwordStrength === 5 && { color: c.success },
                  ]}
                >
                  {passwordStrength <= 2 && "Faible"}
                  {(passwordStrength === 3 || passwordStrength === 4) && "Moyen"}
                  {passwordStrength === 5 && "Sécurisé"}
                </Text>
              </View>

              {/* Progress Bar Container */}
              <View style={styles.strengthBarBackground}>
                <View
                  style={[
                    styles.strengthBarActive,
                    {
                      width: `${(passwordStrength / 5) * 100}%`,
                      backgroundColor:
                        passwordStrength <= 2
                          ? c.error
                          : passwordStrength <= 4
                          ? c.warning
                          : c.success,
                    },
                  ]}
                />
              </View>

              {/* Rules Checklist Grid */}
              <View style={styles.rulesGrid}>
                <View style={styles.ruleItem}>
                  <Ionicons
                    name={passwordChecks.length ? "checkmark-circle" : "ellipse-outline"}
                    size={SIZES.iconXs}
                    color={passwordChecks.length ? c.success : c.textSecondary}
                  />
                  <Text
                    style={[
                      styles.ruleText,
                      passwordChecks.length && styles.ruleTextValid,
                    ]}
                  >
                    Min. 8 caractères
                  </Text>
                </View>

                <View style={styles.ruleItem}>
                  <Ionicons
                    name={passwordChecks.uppercase ? "checkmark-circle" : "ellipse-outline"}
                    size={SIZES.iconXs}
                    color={passwordChecks.uppercase ? c.success : c.textSecondary}
                  />
                  <Text
                    style={[
                      styles.ruleText,
                      passwordChecks.uppercase && styles.ruleTextValid,
                    ]}
                  >
                    Une majuscule (A-Z)
                  </Text>
                </View>

                <View style={styles.ruleItem}>
                  <Ionicons
                    name={passwordChecks.lowercase ? "checkmark-circle" : "ellipse-outline"}
                    size={SIZES.iconXs}
                    color={passwordChecks.lowercase ? c.success : c.textSecondary}
                  />
                  <Text
                    style={[
                      styles.ruleText,
                      passwordChecks.lowercase && styles.ruleTextValid,
                    ]}
                  >
                    Une minuscule (a-z)
                  </Text>
                </View>

                <View style={styles.ruleItem}>
                  <Ionicons
                    name={passwordChecks.number ? "checkmark-circle" : "ellipse-outline"}
                    size={SIZES.iconXs}
                    color={passwordChecks.number ? c.success : c.textSecondary}
                  />
                  <Text
                    style={[
                      styles.ruleText,
                      passwordChecks.number && styles.ruleTextValid,
                    ]}
                  >
                    Un chiffre (0-9)
                  </Text>
                </View>

                <View style={styles.ruleItemFull}>
                  <Ionicons
                    name={passwordChecks.special ? "checkmark-circle" : "ellipse-outline"}
                    size={SIZES.iconXs}
                    color={passwordChecks.special ? c.success : c.textSecondary}
                  />
                  <Text
                    style={[
                      styles.ruleText,
                      passwordChecks.special && styles.ruleTextValid,
                    ]}
                  >
                    Un caractère spécial (ex: @, #, $, %, etc.)
                  </Text>
                </View>
              </View>
            </View>
          )}

          <TextInputField
            label="Confirm Password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            error={validationErrors.confirmPassword}
            icon="lock-closed-outline"
          />

          {/* Register Button */}
          <Button
            label="Create My Account"
            onPress={handleRegister}
            loading={isLoading}
            disabled={
              isLoading ||
              !fullName ||
              !email ||
              !phoneNumber ||
              !selectedRole ||
              !password
            }
            size="lg"
            style={styles.registerButton}
          />

          <Text style={styles.termsText}>
            By clicking "Create My Account", you agree to our{" "}
            <Text style={styles.termsLink}>Terms of Service</Text> and{" "}
            <Text style={styles.termsLink}>Privacy Policy</Text>.
          </Text>
          </View>
          )}
        </Card>

        {!submitted && (
          <>
            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
              <View style={styles.divider} />
            </View>

            {/* Social Buttons */}
            <View style={styles.socialContainer}>
              <SocialButton provider="google" onPress={handleGoogleSignup} />
              <SocialButton provider="github" onPress={handleGitHubSignup} />
            </View>
          </>
        )}

        {/* Sign In Link */}
        <View style={styles.signinContainer}>
          <Text style={styles.signinText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.signinLink}> Sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};


