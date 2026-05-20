import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { ThemePalette } from "@/constants/colors";
import { SIZES } from "@/constants";
import { useThemePalette } from "@/hooks/useThemePalette";
import { rolesService } from "@/services/users";
import { RoleResponse } from "@/types/api";

const ROLE_META: Record<string, { icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  SUPER_ADMIN:   { icon: "shield-checkmark", color: "#ef4444" },
  PRODUCT_OWNER: { icon: "briefcase",        color: "#a855f7" },
  SCRUM_MASTER:  { icon: "people",           color: "#f59e0b" },
  TESTEUR_QA:    { icon: "checkmark-circle", color: "#06b6d4" },
  DEVELOPPEUR:   { icon: "code-slash",       color: "#22c55e" },
};

const ACCESS_LABELS: Record<number, string> = {
  100: "Accès total",
  80:  "Accès étendu",
  70:  "Accès équipe",
  60:  "Accès tests",
  50:  "Accès dev",
};

function createStyles(c: ThemePalette) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: c.background },
    header: { marginBottom: SIZES.lg },
    pageTitle: { color: c.text, fontSize: SIZES.font2xl, fontWeight: "800" },
    pageSubtitle: { color: c.textSecondary, fontSize: SIZES.fontSm, marginTop: 2 },
    emptyWrap: { alignItems: "center", paddingTop: SIZES.xxl, gap: SIZES.md },
    emptyText: { color: c.textSecondary, fontSize: SIZES.fontBase },
    grid: { flexDirection: "row", flexWrap: "wrap", gap: SIZES.md },
    card: {
      width: "47%",
      backgroundColor: c.backgroundSecondary,
      borderRadius: SIZES.radiusLg,
      borderWidth: 1,
      borderColor: c.inputBorder,
      padding: SIZES.lg,
    },
    iconWrap: {
      width: 48, height: 48, borderRadius: SIZES.radiusLg,
      alignItems: "center", justifyContent: "center", marginBottom: SIZES.md,
    },
    roleName: { color: c.text, fontSize: SIZES.fontBase, fontWeight: "700", marginBottom: 2 },
    roleCode: { color: c.textSecondary, fontSize: SIZES.fontXs, marginBottom: SIZES.sm },
    divider: { height: 1, backgroundColor: c.inputBorder, marginVertical: SIZES.sm },
    levelRow: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: SIZES.sm },
    levelText: { color: c.textSecondary, fontSize: SIZES.fontXs },
    levelBar: {
      height: 4, borderRadius: 2,
      backgroundColor: c.inputBorder, overflow: "hidden",
    },
    levelFill: { height: 4, borderRadius: 2 },
  });
}

export default function RolesScreen() {
  const insets = useSafeAreaInsets();
  const c = useThemePalette();
  const styles = useMemo(() => createStyles(c), [c]);
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    try {
      const data = await rolesService.getAll();
      setRoles(data ?? []);
    } catch (e: any) {
      Alert.alert("Erreur", e.message ?? "Impossible de charger les rôles");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + SIZES.lg,
          paddingHorizontal: SIZES.lg,
          paddingBottom: 140,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); load(); }}
            tintColor={c.primary}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Rôles</Text>
          <Text style={styles.pageSubtitle}>{roles.length} rôle(s) sur la plateforme</Text>
        </View>

        {loading ? (
          <ActivityIndicator color={c.primary} style={{ marginTop: SIZES.xxl }} />
        ) : roles.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Ionicons name="shield-outline" size={48} color={c.textSecondary} />
            <Text style={styles.emptyText}>Aucun rôle trouvé</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {roles.map((role) => {
              const meta = ROLE_META[role.code] ?? { icon: "shield-outline" as const, color: c.primary };
              return (
                <View key={role.id} style={styles.card}>
                  <View style={[styles.iconWrap, { backgroundColor: `${meta.color}22` }]}>
                    <Ionicons name={meta.icon} size={26} color={meta.color} />
                  </View>
                  <Text style={styles.roleName}>{role.nom}</Text>
                  <Text style={styles.roleCode}>{role.code}</Text>
                  <View style={styles.divider} />
                  <View style={styles.levelRow}>
                    <Ionicons name="key-outline" size={12} color={c.textSecondary} />
                    <Text style={styles.levelText}>
                      {ACCESS_LABELS[role.niveau_acces ?? 0] ?? `Niveau ${role.niveau_acces ?? "—"}`}
                    </Text>
                  </View>
                  <View style={styles.levelBar}>
                    <View
                      style={[
                        styles.levelFill,
                        {
                          width: `${role.niveau_acces ?? 0}%` as any,
                          backgroundColor: meta.color,
                        },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
