import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { ThemePalette } from "@/constants/colors";
import { SIZES } from "@/constants";
import { useThemePalette } from "@/hooks/useThemePalette";
import { usersService } from "@/services/users";
import { UtilisateurResponse } from "@/types/api";

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: "#ef4444",
  PRODUCT_OWNER: "#a855f7",
  SCRUM_MASTER: "#f59e0b",
  TESTEUR_QA: "#06b6d4",
  DEVELOPPEUR: "#22c55e",
};

function createStyles(c: ThemePalette) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: c.background },
    header: { marginBottom: SIZES.lg },
    pageTitle: { color: c.text, fontSize: SIZES.font2xl, fontWeight: "800" },
    pageSubtitle: { color: c.textSecondary, fontSize: SIZES.fontSm, marginTop: 2 },
    section: { marginBottom: SIZES.xl },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: SIZES.sm,
      marginBottom: SIZES.md,
      paddingBottom: SIZES.sm,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.inputBorder,
    },
    sectionTitle: { color: c.text, fontSize: SIZES.fontLg, fontWeight: "800" },
    sectionCount: {
      color: c.textSecondary,
      fontSize: SIZES.fontSm,
      fontWeight: "600",
    },
    sectionHint: {
      color: c.textSecondary,
      fontSize: SIZES.fontXs,
      marginBottom: SIZES.md,
      lineHeight: 18,
    },
    emptyWrap: { alignItems: "center", paddingVertical: SIZES.lg, gap: SIZES.sm },
    emptyText: { color: c.textSecondary, fontSize: SIZES.fontSm },
    card: {
      backgroundColor: c.backgroundSecondary,
      borderRadius: SIZES.radiusLg,
      borderWidth: 1,
      borderColor: c.inputBorder,
      padding: SIZES.lg,
      marginBottom: SIZES.md,
    },
    cardRow: { flexDirection: "row", alignItems: "center" },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: SIZES.radiusRound,
      alignItems: "center",
      justifyContent: "center",
      marginRight: SIZES.md,
    },
    avatarText: { fontSize: SIZES.fontSm, fontWeight: "700" },
    userInfo: { flex: 1 },
    userName: { color: c.text, fontSize: SIZES.fontBase, fontWeight: "700" },
    userEmail: { color: c.textSecondary, fontSize: SIZES.fontXs, marginTop: 2 },
    metaRow: {
      flexDirection: "row",
      gap: SIZES.sm,
      marginTop: SIZES.sm,
      flexWrap: "wrap",
    },
    pill: { paddingHorizontal: SIZES.sm, paddingVertical: 2, borderRadius: SIZES.radiusSm },
    pillText: { fontSize: SIZES.fontXs, fontWeight: "600" },
    actions: { flexDirection: "row", gap: SIZES.sm },
    actionBtn: {
      width: 36,
      height: 36,
      borderRadius: SIZES.radiusMd,
      alignItems: "center",
      justifyContent: "center",
    },
  });
}

export default function UsersScreen() {
  const c = useThemePalette();
  const styles = useMemo(() => createStyles(c), [c]);
  const insets = useSafeAreaInsets();
  const [users, setUsers] = useState<UtilisateurResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const inactiveUsers = useMemo(
    () => users.filter((u) => !u.is_active),
    [users],
  );
  const activeUsers = useMemo(() => users.filter((u) => u.is_active), [users]);

  async function load() {
    try {
      /** GET /users — liste Super Admin (aligné sur plateforme-back `api/users.py`). */
      const data = await usersService.getAll();
      setUsers(data ?? []);
    } catch (e: any) {
      Alert.alert("Erreur", e.message ?? "Impossible de charger les utilisateurs");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleActive(user: UtilisateurResponse) {
    setActionLoading(user.id);
    try {
      if (user.is_active) {
        await usersService.deactivate(user.id);
      } else {
        await usersService.activate(user.id);
      }
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, is_active: !u.is_active } : u)),
      );
    } catch (e: any) {
      Alert.alert("Erreur", e.message);
    } finally {
      setActionLoading(null);
    }
  }

  function confirmDelete(user: UtilisateurResponse) {
    Alert.alert(
      "Supprimer l'utilisateur",
      `Confirmer la suppression de ${user.nom} ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            setActionLoading(user.id);
            try {
              await usersService.delete(user.id);
              setUsers((prev) => prev.filter((u) => u.id !== user.id));
            } catch (e: any) {
              Alert.alert("Erreur", e.message);
            } finally {
              setActionLoading(null);
            }
          },
        },
      ],
    );
  }

  const roleColor = (code?: string) => ROLE_COLORS[code ?? ""] ?? c.textSecondary;

  function renderUserCard(user: UtilisateurResponse) {
    const rc = roleColor(user.role?.code);
    return (
      <View key={user.id} style={styles.card}>
        <View style={styles.cardRow}>
          <View style={[styles.avatar, { backgroundColor: `${rc}33` }]}>
            <Text style={[styles.avatarText, { color: rc }]}>{getInitials(user.nom)}</Text>
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.nom}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <View style={styles.metaRow}>
              {user.role && (
                <View style={[styles.pill, { backgroundColor: `${rc}22` }]}>
                  <Text style={[styles.pillText, { color: rc }]}>{user.role.nom}</Text>
                </View>
              )}
              <View
                style={[
                  styles.pill,
                  { backgroundColor: user.is_active ? "#22c55e22" : "#f59e0b22" },
                ]}
              >
                <Text
                  style={[styles.pillText, { color: user.is_active ? "#22c55e" : "#d97706" }]}
                >
                  {user.is_active ? "Actif" : "Non activé"}
                </Text>
              </View>
            </View>
          </View>

          {actionLoading === user.id ? (
            <ActivityIndicator color={c.primary} size="small" />
          ) : (
            <View style={styles.actions}>
              <TouchableOpacity
                style={[
                  styles.actionBtn,
                  { backgroundColor: user.is_active ? "#ef444420" : "#22c55e20" },
                ]}
                onPress={() => toggleActive(user)}
              >
                <Ionicons
                  name={user.is_active ? "pause-circle-outline" : "play-circle-outline"}
                  size={20}
                  color={user.is_active ? "#ef4444" : "#22c55e"}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: "#ef444415" }]}
                onPress={() => confirmDelete(user)}
              >
                <Ionicons name="trash-outline" size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  }

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
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
            tintColor={c.primary}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Utilisateurs</Text>
          <Text style={styles.pageSubtitle}>
            {users.length} compte(s) — {activeUsers.length} actif(s), {inactiveUsers.length} en attente
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator color={c.primary} style={{ marginTop: SIZES.xxl }} />
        ) : users.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Ionicons name="people-outline" size={48} color={c.textSecondary} />
            <Text style={styles.emptyText}>Aucun utilisateur trouvé</Text>
          </View>
        ) : (
          <>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="hourglass-outline" size={22} color="#d97706" />
                <Text style={styles.sectionTitle}>{"En attente d'activation"}</Text>
                <Text style={styles.sectionCount}>({inactiveUsers.length})</Text>
              </View>
              <Text style={styles.sectionHint}>
                Comptes non validés par le super administrateur (champ « actif » = false côté API).
              </Text>
              {inactiveUsers.length === 0 ? (
                <View style={styles.emptyWrap}>
                  <Text style={styles.emptyText}>Aucun compte en attente</Text>
                </View>
              ) : (
                inactiveUsers.map(renderUserCard)
              )}
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="checkmark-circle-outline" size={22} color="#22c55e" />
                <Text style={styles.sectionTitle}>Comptes actifs</Text>
                <Text style={styles.sectionCount}>({activeUsers.length})</Text>
              </View>
              <Text style={styles.sectionHint}>
                Utilisateurs dont le compte a été activé par le super administrateur.
              </Text>
              {activeUsers.length === 0 ? (
                <View style={styles.emptyWrap}>
                  <Text style={styles.emptyText}>Aucun compte actif pour le moment</Text>
                </View>
              ) : (
                activeUsers.map(renderUserCard)
              )}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
