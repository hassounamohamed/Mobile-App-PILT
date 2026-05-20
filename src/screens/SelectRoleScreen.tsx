import { Button } from "@/components/ui/Button";
import { RadioButton } from "@/components/ui/RadioButton";
import type { ThemePalette } from "@/constants/colors";
import { SIZES } from "@/constants";
import { USER_ROLES } from "@/constants/roles";
import { useThemePalette } from "@/hooks/useThemePalette";
import { UserRole } from "@/types/auth";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { AuthStackParamList } from "@/navigation/types";

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
    title: {
      fontSize: SIZES.font2xl,
      fontWeight: "700",
      color: c.text,
      marginTop: SIZES.lg,
      letterSpacing: 0.5,
    },
    subtitle: {
      fontSize: SIZES.fontBase,
      color: c.textSecondary,
      textAlign: "center",
      marginTop: SIZES.md,
      lineHeight: SIZES.fontBase * SIZES.lineHeightRelaxed,
    },
    rolesContainer: {
      marginBottom: SIZES.xl,
    },
    footer: {
      paddingHorizontal: SIZES.lg,
      backgroundColor: c.background,
    },
  });
}

export const SelectRoleScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const insets = useSafeAreaInsets();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const c = useThemePalette();
  const styles = useMemo(() => createStyles(c), [c]);

  const handleContinue = () => {
    if (selectedRole) {
      navigation.navigate("Login");
    }
  };

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
        <View style={styles.header}>
          <Ionicons
            name="person-circle-outline"
            size={SIZES.iconXl * 2}
            color={c.primary}
          />
          <Text style={styles.title}>Choisissez votre rôle</Text>
          <Text style={styles.subtitle}>
            Votre compte a été créé avec OAuth. Sélectionnez votre rôle pour
            terminer la configuration.
          </Text>
        </View>

        <View style={styles.rolesContainer}>
          {USER_ROLES.map((role) => (
            <RadioButton
              key={role.label}
              label={role.label}
              value={role.label}
              selected={selectedRole === role.label}
              onPress={() => setSelectedRole(role.label as UserRole)}
              icon={role.icon}
              description={role.description}
            />
          ))}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: SIZES.lg }]}>
        <Button
          label="Continuer"
          onPress={handleContinue}
          disabled={!selectedRole}
          size="lg"
        />
      </View>
    </View>
  );
};
