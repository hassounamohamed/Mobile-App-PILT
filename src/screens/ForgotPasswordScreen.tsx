import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TextInputField } from "@/components/ui/TextInputField";
import type { ThemePalette } from "@/constants/colors";
import { SIZES } from "@/constants";
import { useThemePalette } from "@/hooks/useThemePalette";
import { AuthStackParamList } from "@/navigation/types";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useMemo, useCallback, useState } from "react";
import {
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
  iconCircle: {
    width: SIZES.iconXl * 2,
    height: SIZES.iconXl * 2,
    borderRadius: SIZES.iconXl,
    backgroundColor: c.backgroundSecondary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SIZES.lg,
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
    textAlign: "center",
    lineHeight: SIZES.fontBase * SIZES.lineHeightRelaxed,
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
  backToLoginContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: SIZES.lg,
    paddingVertical: SIZES.md,
  },
  backToLoginLink: {
    color: c.primary,
    fontSize: SIZES.fontBase,
    fontWeight: "600",
    marginLeft: SIZES.sm,
  },
  helpCard: {
    backgroundColor: c.backgroundSecondary,
  },
  helpContent: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  helpTextContainer: {
    marginLeft: SIZES.md,
    flex: 1,
  },
  helpTitle: {
    color: c.text,
    fontSize: SIZES.fontSm,
    fontWeight: "600",
    marginBottom: SIZES.xs,
  },
  helpText: {
    color: c.textSecondary,
    fontSize: SIZES.fontSm,
    lineHeight: SIZES.fontSm * SIZES.lineHeightNormal,
  },
  helpLink: {
    color: c.primary,
    fontWeight: "600",
  },
  successContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: SIZES.xxl,
  },
  successTitle: {
    fontSize: SIZES.font2xl,
    fontWeight: "700",
    color: c.text,
    marginTop: SIZES.lg,
    marginBottom: SIZES.md,
  },
  successText: {
    fontSize: SIZES.fontBase,
    color: c.textSecondary,
    textAlign: "center",
    lineHeight: SIZES.fontBase * SIZES.lineHeightRelaxed,
  },
  footer: {
    alignItems: "center",
    marginTop: SIZES.xl,
  },
  footerText: {
    color: c.textSecondary,
    fontSize: SIZES.fontBase,
  },
  resendLink: {
    color: c.primary,
    fontWeight: "600",
  },
  buttonContainer: {
    paddingHorizontal: SIZES.lg,
  },
});
}

export const ForgotPasswordScreen = () => {
  const c = useThemePalette();
  const styles = useMemo(() => createStyles(c), [c]);

  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const insets = useSafeAreaInsets();
  const { forgotPassword, isLoading, error, clearError } = useAuth();

  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [validationError, setValidationError] = useState("");

  const validateEmail = useCallback(() => {
    if (!email) {
      setValidationError("Email est requis");
      return false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setValidationError("Email invalide");
      return false;
    }
    setValidationError("");
    return true;
  }, [email]);

  const handleSendReset = useCallback(async () => {
    if (!validateEmail()) return;

    try {
      clearError();
      await forgotPassword(email);
      setSubmitted(true);
    } catch (err) {
      console.error("Forgot password error:", err);
    }
  }, [email, validateEmail, forgotPassword, clearError]);

  if (submitted) {
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
          {/* Success Icon */}
          <View style={styles.successContainer}>
            <View style={styles.iconCircle}>
              <Ionicons
                name="checkmark-outline"
                size={SIZES.iconXl}
                color={c.success}
              />
            </View>
            <Text style={styles.successTitle}>Check your email</Text>
            <Text style={styles.successText}>
              We've sent a password reset link to {email}. Click the link in the
              email to reset your password.
            </Text>
          </View>

          {/* Back to Login */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Didn't receive an email?{" "}
              <Text
                style={styles.resendLink}
                onPress={() => {
                  setSubmitted(false);
                  setEmail("");
                }}
              >
                Try again
              </Text>
            </Text>
          </View>
        </ScrollView>

        <View style={[styles.buttonContainer, { paddingBottom: SIZES.lg }]}>
          <Button
            label="Back to Login"
            onPress={() => navigation.navigate("Login")}
            size="lg"
          />
        </View>
      </View>
    );
  }

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
          <View style={styles.iconCircle}>
            <Ionicons
              name="lock-open-outline"
              size={SIZES.iconXl}
              color={c.primary}
            />
          </View>
          <Text style={styles.title}>Forgot Password?</Text>
          <Text style={styles.subtitle}>
            No worries! Enter your email address and we'll send you a link to
            reset your password.
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
            error={validationError}
            icon="mail-outline"
          />

          <Button
            label="Send Reset Link"
            onPress={handleSendReset}
            loading={isLoading}
            disabled={isLoading || !email}
            size="lg"
          />

          <TouchableOpacity
            style={styles.backToLoginContainer}
            onPress={() => navigation.navigate("Login")}
          >
            <Ionicons
              name="arrow-back"
              size={SIZES.iconMd}
              color={c.primary}
            />
            <Text style={styles.backToLoginLink}>Back to Login</Text>
          </TouchableOpacity>
        </View>

        {/* Additional Help */}
        <Card style={styles.helpCard}>
          <View style={styles.helpContent}>
            <Ionicons
              name="help-circle-outline"
              size={SIZES.iconMd}
              color={c.info}
            />
            <View style={styles.helpTextContainer}>
              <Text style={styles.helpTitle}>Didn't receive the email?</Text>
              <Text style={styles.helpText}>
                Check your spam folder or{" "}
                <Text style={styles.helpLink}>contact support</Text>.
              </Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
};


