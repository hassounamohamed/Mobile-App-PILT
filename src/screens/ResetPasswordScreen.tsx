import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TextInputField } from "@/components/ui/TextInputField";
import type { ThemePalette } from "@/constants/colors";
import { SIZES } from "@/constants";
import { useAuth } from "@/hooks/useAuth";
import { useThemePalette } from "@/hooks/useThemePalette";
import { AuthStackParamList } from "@/navigation/types";
import { Ionicons } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useCallback, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ResetPasswordRouteProp = RouteProp<AuthStackParamList, "ResetPassword">;

function createStyles(c: ThemePalette) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    scrollContent: { flexGrow: 1, paddingHorizontal: SIZES.lg, paddingVertical: SIZES.xl },
    header: { alignItems: "center", marginBottom: SIZES.xl },
    title: { marginTop: SIZES.md, fontSize: SIZES.fontXl, fontWeight: "700", color: c.text },
    form: { gap: SIZES.md },
    errorCard: { borderColor: c.error, backgroundColor: c.background, marginBottom: SIZES.md },
    errorText: { color: c.error },
    successCard: { borderColor: c.success, backgroundColor: c.background, marginBottom: SIZES.md },
    successText: { color: c.success, fontWeight: "600" },
    backLink: { marginTop: SIZES.xl, alignItems: "center" },
    backText: { color: c.primary, fontWeight: "600" },
  });
}

export const ResetPasswordScreen = () => {
  const route = useRoute<ResetPasswordRouteProp>();
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const insets = useSafeAreaInsets();
  const { resetPassword, isLoading, error, clearError } = useAuth();
  const c = useThemePalette();
  const styles = useMemo(() => createStyles(c), [c]);

  const [token, setToken] = useState(route.params?.token ?? "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationError, setValidationError] = useState("");
  const [success, setSuccess] = useState(false);

  const validate = useCallback(() => {
    if (!token.trim()) {
      setValidationError("Token de reinitialisation requis.");
      return false;
    }
    if (newPassword.length < 8) {
      setValidationError("Le mot de passe doit contenir au moins 8 caracteres.");
      return false;
    }
    if (newPassword !== confirmPassword) {
      setValidationError("Les mots de passe ne correspondent pas.");
      return false;
    }
    setValidationError("");
    return true;
  }, [confirmPassword, newPassword, token]);

  const handleReset = useCallback(async () => {
    if (!validate()) return;

    try {
      clearError();
      await resetPassword(token.trim(), newPassword);
      setSuccess(true);
    } catch (err) {
      console.error("Reset password error:", err);
    }
  }, [clearError, newPassword, resetPassword, token, validate]);

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
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Ionicons name="key-outline" size={SIZES.iconXl} color={c.primary} />
          <Text style={styles.title}>Reinitialiser le mot de passe</Text>
        </View>

        {error && (
          <Card style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
          </Card>
        )}

        {validationError ? (
          <Card style={styles.errorCard}>
            <Text style={styles.errorText}>{validationError}</Text>
          </Card>
        ) : null}

        {success ? (
          <Card style={styles.successCard}>
            <Text style={styles.successText}>
              Mot de passe modifie avec succes. Vous pouvez vous connecter.
            </Text>
          </Card>
        ) : (
          <View style={styles.form}>
            <TextInputField
              label="Token"
              placeholder="Token recu par email"
              value={token}
              onChangeText={setToken}
              icon="key-outline"
            />
            <TextInputField
              label="Nouveau mot de passe"
              placeholder="Minimum 8 caracteres"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              icon="lock-closed-outline"
            />
            <TextInputField
              label="Confirmer le mot de passe"
              placeholder="Confirmer le mot de passe"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              icon="lock-closed-outline"
            />
            <Button
              label="Valider"
              onPress={handleReset}
              loading={isLoading}
              disabled={isLoading}
              size="lg"
            />
          </View>
        )}

        <TouchableOpacity onPress={() => navigation.navigate("Login")} style={styles.backLink}>
          <Text style={styles.backText}>Retour vers Login</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};
