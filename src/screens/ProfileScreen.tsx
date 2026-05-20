import { Ionicons } from "@expo/vector-icons";
import type { ThemePalette } from "@/constants/colors";
import { SIZES } from "@/constants";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuthStore } from "@/context/authStore";
import { useNotificationSettingsStore } from "@/context/notificationSettingsStore";
import { useThemeStore } from "@/context/themeStore";
import { useThemePalette } from "@/hooks/useThemePalette";
import { usersService } from "@/services/users";
import { UtilisateurResponse } from "@/types/api";

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: "#ef4444",
  PRODUCT_OWNER: "#a855f7",
  SCRUM_MASTER: "#f59e0b",
  TESTEUR_QA: "#06b6d4",
  DEVELOPPEUR: "#22c55e",
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

interface ActionRow {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  sublabel?: string;
  onPress: () => void;
  danger?: boolean;
}

function ActionItem({ item }: { item: ActionRow }) {
  const c = useThemePalette();
  const styles = useMemo(() => createStyles(c), [c]);

  return (
    <TouchableOpacity
      style={styles.actionRow}
      onPress={item.onPress}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.actionIcon,
          {
            backgroundColor: item.danger
              ? "#ef444420"
              : `${c.primary}20`,
          },
        ]}
      >
        <Ionicons
          name={item.icon}
          size={20}
          color={item.danger ? "#ef4444" : c.primary}
        />
      </View>
      <View style={styles.actionContent}>
        <Text style={[styles.actionLabel, item.danger && { color: "#ef4444" }]}>
          {item.label}
        </Text>
        {item.sublabel && (
          <Text style={styles.actionSublabel}>{item.sublabel}</Text>
        )}
      </View>
      <Ionicons
        name="chevron-forward"
        size={16}
        color={c.textSecondary}
      />
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuthStore();
  const { isDarkMode, toggleMode } = useThemeStore();
  const { enabled: notificationsEnabled, setEnabled: setNotificationsEnabled } =
    useNotificationSettingsStore();
  const c = useThemePalette();
  const styles = useMemo(() => createStyles(c), [c]);
  const [profile, setProfile] = useState<UtilisateurResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNotificationSettings, setShowNotificationSettings] =
    useState(false);

  useEffect(() => {
    usersService
      .getMe()
      .then((data) => setProfile(data ?? null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function handleLogout() {
    Alert.alert("Déconnexion", "Voulez-vous vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Déconnexion",
        style: "destructive",
        onPress: () => {
          logout();
        },
      },
    ]);
  }

  async function handleToggleTheme() {
    toggleMode();
  }

  const displayName = profile?.nom ?? user?.fullName ?? "Utilisateur";
  const displayEmail = profile?.email ?? user?.email ?? "";
  const displayRole = profile?.role ?? null;
  const roleCode = displayRole?.code ?? "";
  const roleColor = ROLE_COLORS[roleCode] ?? c.primary;

  const actions: ActionRow[] = [
    {
      icon: "lock-closed-outline",
      label: "Sécurité",
      sublabel: "Changer le mot de passe",
      onPress: () =>
        Alert.alert("Info", "Fonctionnalité disponible prochainement"),
    },
    {
      icon: "notifications-outline",
      label: "Notifications",
      sublabel: "Paramètres de notifications",
      onPress: () => setShowNotificationSettings(true),
    },
    {
      icon: "information-circle-outline",
      label: "À propos",
      sublabel: "FlowPilot v1.0",
      onPress: () => {},
    },
    {
      icon: "log-out-outline",
      label: "Déconnexion",
      onPress: handleLogout,
      danger: true,
    },
  ];

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + SIZES.lg,
          paddingHorizontal: SIZES.lg,
          paddingBottom: 140,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Profil</Text>

        <View style={styles.profileCard}>
          {loading ? (
            <ActivityIndicator color={c.primary} />
          ) : (
            <>
              <View
                style={[
                  styles.avatarBig,
                  { backgroundColor: `${roleColor}33` },
                ]}
              >
                <Text style={[styles.avatarBigText, { color: roleColor }]}>
                  {getInitials(displayName)}
                </Text>
              </View>
              <Text style={styles.profileName}>{displayName}</Text>
              <Text style={styles.profileEmail}>{displayEmail}</Text>
              {displayRole && (
                <View
                  style={[
                    styles.rolePill,
                    { backgroundColor: `${roleColor}22` },
                  ]}
                >
                  <Text style={[styles.roleText, { color: roleColor }]}>
                    {displayRole.nom}
                  </Text>
                </View>
              )}
              {profile?.telephone ? (
                <View style={styles.phoneRow}>
                  <Ionicons
                    name="call-outline"
                    size={14}
                    color={c.textSecondary}
                  />
                  <Text style={styles.phoneText}>{profile.telephone}</Text>
                </View>
              ) : null}
            </>
          )}
        </View>

        <View style={styles.themeCard}>
          <View style={styles.themeHeader}>
            <View style={styles.themeTitleWrap}>
              <Text style={styles.themeTitle}>Apparence</Text>
              <Text style={styles.themeSubtitle}>
                {isDarkMode ? "Mode sombre activé" : "Mode clair activé"}
              </Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={handleToggleTheme}
              thumbColor={isDarkMode ? "#ffffff" : "#f4f3f4"}
              trackColor={{ false: "#d1d5db", true: c.primary }}
            />
          </View>
        </View>

        <View style={styles.actionsCard}>
          {actions.map((item) => (
            <ActionItem key={item.label} item={item} />
          ))}
        </View>
      </ScrollView>

      <Modal
        visible={showNotificationSettings}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNotificationSettings(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Notifications</Text>
            <Text style={styles.modalSubtitle}>
              Activez ou desactivez les notifications en temps reel.
            </Text>
            <View style={styles.modalRow}>
              <Text style={styles.modalLabel}>Notifications temps reel</Text>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                thumbColor={notificationsEnabled ? "#ffffff" : "#f4f3f4"}
                trackColor={{ false: "#d1d5db", true: c.primary }}
              />
            </View>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setShowNotificationSettings(false)}
            >
              <Text style={styles.modalCloseText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function createStyles(c: ThemePalette) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: c.background },
    pageTitle: {
      color: c.text,
      fontSize: SIZES.font2xl,
      fontWeight: "800",
      marginBottom: SIZES.lg,
    },
    profileCard: {
      backgroundColor: c.backgroundSecondary,
      borderRadius: SIZES.radiusXl,
      borderWidth: 1,
      borderColor: c.inputBorder,
      padding: SIZES.xl,
      alignItems: "center",
      marginBottom: SIZES.lg,
    },
    avatarBig: {
      width: 80,
      height: 80,
      borderRadius: SIZES.radiusRound,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: SIZES.md,
    },
    avatarBigText: { fontSize: SIZES.font2xl, fontWeight: "800" },
    profileName: {
      color: c.text,
      fontSize: SIZES.fontXl,
      fontWeight: "700",
      marginBottom: 4,
    },
    profileEmail: {
      color: c.textSecondary,
      fontSize: SIZES.fontSm,
      marginBottom: SIZES.md,
    },
    rolePill: {
      paddingHorizontal: SIZES.md,
      paddingVertical: SIZES.sm,
      borderRadius: SIZES.radiusSm,
      marginBottom: SIZES.sm,
    },
    roleText: { fontSize: SIZES.fontSm, fontWeight: "700" },
    phoneRow: { flexDirection: "row", alignItems: "center", gap: SIZES.sm },
    phoneText: { color: c.textSecondary, fontSize: SIZES.fontSm },
    themeCard: {
      backgroundColor: c.backgroundSecondary,
      borderRadius: SIZES.radiusXl,
      borderWidth: 1,
      borderColor: c.inputBorder,
      paddingHorizontal: SIZES.lg,
      paddingVertical: SIZES.md,
      marginBottom: SIZES.lg,
    },
    themeHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    themeTitleWrap: {
      flex: 1,
      marginRight: SIZES.md,
    },
    themeTitle: {
      color: c.text,
      fontSize: SIZES.fontBase,
      fontWeight: "700",
    },
    themeSubtitle: {
      color: c.textSecondary,
      fontSize: SIZES.fontSm,
      marginTop: 4,
    },
    actionsCard: {
      backgroundColor: c.backgroundSecondary,
      borderRadius: SIZES.radiusXl,
      borderWidth: 1,
      borderColor: c.inputBorder,
      overflow: "hidden",
    },
    actionRow: {
      flexDirection: "row",
      alignItems: "center",
      padding: SIZES.lg,
      borderBottomWidth: 1,
      borderBottomColor: c.inputBorder,
    },
    actionIcon: {
      width: 38,
      height: 38,
      borderRadius: SIZES.radiusMd,
      alignItems: "center",
      justifyContent: "center",
      marginRight: SIZES.md,
    },
    actionContent: { flex: 1 },
    actionLabel: {
      color: c.text,
      fontSize: SIZES.fontBase,
      fontWeight: "600",
    },
    actionSublabel: {
      color: c.textSecondary,
      fontSize: SIZES.fontXs,
      marginTop: 2,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.45)",
      alignItems: "center",
      justifyContent: "center",
      padding: SIZES.lg,
    },
    modalCard: {
      width: "100%",
      backgroundColor: c.backgroundSecondary,
      borderRadius: SIZES.radiusXl,
      padding: SIZES.xl,
      borderWidth: 1,
      borderColor: c.inputBorder,
    },
    modalTitle: {
      color: c.text,
      fontSize: SIZES.fontLg,
      fontWeight: "700",
    },
    modalSubtitle: {
      color: c.textSecondary,
      fontSize: SIZES.fontSm,
      marginTop: 6,
    },
    modalRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: SIZES.lg,
    },
    modalLabel: {
      color: c.text,
      fontSize: SIZES.fontBase,
      fontWeight: "600",
    },
    modalCloseBtn: {
      marginTop: SIZES.lg,
      paddingVertical: SIZES.sm,
      borderRadius: SIZES.radiusMd,
      backgroundColor: c.primary,
      alignItems: "center",
    },
    modalCloseText: {
      color: "#fff",
      fontSize: SIZES.fontSm,
      fontWeight: "700",
    },
  });
}
