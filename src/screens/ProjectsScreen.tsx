import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SIZES } from "@/constants";
import type { ThemePalette } from "@/constants/colors";
import { useThemePalette } from "@/hooks/useThemePalette";
import { epicsService, projectsService } from "@/services/projects";
import { storiesService } from "@/services/stories";
import type { ProjetResponse } from "@/types/api";

// ─── Types ────────────────────────────────────────────────────────────────────

type ProjectStats = {
  nb_sprints: number;
  nb_epics: number;
  nb_user_stories: number;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_META: Record<string, { label: string; color: string }> = {
  ACTIF: { label: "Actif", color: "#22c55e" },
  ARCHIVE: { label: "Archivé", color: "#9ca3af" },
  TERMINE: { label: "Terminé", color: "#3b82f6" },
};

// ─── Styles ───────────────────────────────────────────────────────────────────

function createStyles(c: ThemePalette) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: c.background },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: SIZES.lg,
    },
    pageTitle: { color: c.text, fontSize: SIZES.font2xl, fontWeight: "800" },
    pageSubtitle: {
      color: c.textSecondary,
      fontSize: SIZES.fontSm,
      marginTop: 2,
    },
    emptyWrap: { alignItems: "center", paddingTop: SIZES.xxl, gap: SIZES.sm },
    emptyText: { color: c.text, fontSize: SIZES.fontLg, fontWeight: "600" },
    emptyHint: { color: c.textSecondary, fontSize: SIZES.fontSm },
    card: {
      backgroundColor: c.backgroundSecondary,
      borderRadius: SIZES.radiusLg,
      borderWidth: 1,
      borderColor: c.inputBorder,
      padding: SIZES.lg,
      marginBottom: SIZES.md,
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: SIZES.md,
      marginBottom: SIZES.md,
    },
    projectIconWrap: {
      width: 38,
      height: 38,
      borderRadius: SIZES.radiusMd,
      backgroundColor: `${c.primary}22`,
      alignItems: "center",
      justifyContent: "center",
    },
    cardTitleWrap: { flex: 1 },
    cardTitle: { color: c.text, fontSize: SIZES.fontBase, fontWeight: "700" },
    cardDesc: { color: c.textSecondary, fontSize: SIZES.fontXs, marginTop: 2 },
    statusPill: {
      paddingHorizontal: SIZES.sm,
      paddingVertical: 3,
      borderRadius: SIZES.radiusSm,
    },
    statusText: { fontSize: SIZES.fontXs, fontWeight: "700" },
    statsRow: { flexDirection: "row", gap: SIZES.md },
    statItem: { flexDirection: "row", alignItems: "center", gap: 4 },
    statText: { color: c.textSecondary, fontSize: SIZES.fontXs },
    chevronWrap: { position: "absolute", right: SIZES.md, top: "50%" },
    // Modal
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.55)",
      justifyContent: "flex-end",
    },
    sheet: {
      backgroundColor: c.backgroundSecondary,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: SIZES.xl,
      paddingTop: SIZES.lg,
    },
    sheetHandle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: c.inputBorder,
      alignSelf: "center",
      marginBottom: SIZES.lg,
    },
    sheetTitle: {
      color: c.text,
      fontSize: SIZES.fontXl,
      fontWeight: "800",
      flex: 1,
    },
    sheetRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: SIZES.sm,
      gap: SIZES.sm,
    },
    sheetLabel: { color: c.textSecondary, fontSize: SIZES.fontSm },
    sheetValue: { color: c.text, fontSize: SIZES.fontSm, fontWeight: "600" },
    divider: {
      height: 1,
      backgroundColor: c.inputBorder,
      marginVertical: SIZES.md,
    },
    sectionLabel: {
      color: c.textSecondary,
      fontSize: SIZES.fontXs,
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: 1,
      marginBottom: SIZES.sm,
    },
    statTile: {
      flex: 1,
      backgroundColor: c.background,
      borderRadius: SIZES.radiusMd,
      borderWidth: 1,
      borderColor: c.inputBorder,
      padding: SIZES.sm,
      alignItems: "center",
      gap: 4,
    },
    statTileValue: { color: c.text, fontSize: SIZES.fontXl, fontWeight: "800" },
    statTileLabel: {
      color: c.textSecondary,
      fontSize: 10,
      textAlign: "center",
    },
    memberRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: SIZES.sm,
      marginBottom: 6,
    },
    memberAvatar: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: `${c.primary}22`,
      alignItems: "center",
      justifyContent: "center",
    },
    memberAvatarText: {
      color: c.primary,
      fontSize: SIZES.fontXs,
      fontWeight: "700",
    },
    memberName: { color: c.text, fontSize: SIZES.fontSm },
    memberRole: { color: c.textSecondary, fontSize: SIZES.fontXs },
    closeBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: c.background,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: c.inputBorder,
    },
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(d?: string) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return d;
  }
}

async function loadProjectStats(projectId: number): Promise<ProjectStats> {
  const [statsRes, epicsRes, backlogRes] = await Promise.allSettled([
    projectsService.getStats(projectId),
    epicsService.getByProject(projectId),
    storiesService.getBacklog(projectId),
  ]);
  return {
    nb_sprints:
      statsRes.status === "fulfilled" ? (statsRes.value?.nb_sprints ?? 0) : 0,
    nb_epics:
      epicsRes.status === "fulfilled" ? (epicsRes.value?.length ?? 0) : 0,
    nb_user_stories:
      backlogRes.status === "fulfilled" ? (backlogRes.value?.length ?? 0) : 0,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProjectsScreen() {
  const c = useThemePalette();
  const styles = useMemo(() => createStyles(c), [c]);
  const insets = useSafeAreaInsets();

  const [projects, setProjects] = useState<ProjetResponse[]>([]);
  const [statsMap, setStatsMap] = useState<Record<number, ProjectStats>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<ProjetResponse | null>(null);

  async function load() {
    try {
      const data = await projectsService.getMine();
      const safeProjects = data ?? [];
      setProjects(safeProjects);

      const results = await Promise.allSettled(
        safeProjects.map(async (p) => ({
          id: p.id,
          ...(await loadProjectStats(p.id)),
        })),
      );

      const next: Record<number, ProjectStats> = {};
      for (const r of results) {
        if (r.status === "fulfilled") {
          const { id, ...s } = r.value;
          next[id] = s;
        }
      }
      setStatsMap(next);
    } catch (e: any) {
      Alert.alert("Erreur", e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const selectedStats = selected
    ? (statsMap[selected.id] ?? {
        nb_sprints: 0,
        nb_epics: 0,
        nb_user_stories: 0,
      })
    : null;

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
          <View>
            <Text style={styles.pageTitle}>Mes Projets</Text>
            <Text style={styles.pageSubtitle}>{projects.length} projet(s)</Text>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator
            color={c.primary}
            style={{ marginTop: SIZES.xxl }}
          />
        ) : projects.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Ionicons
              name="folder-open-outline"
              size={52}
              color={c.textSecondary}
            />
            <Text style={styles.emptyText}>Aucun projet</Text>
            <Text style={styles.emptyHint}>
              Aucun projet ne vous est assigné
            </Text>
          </View>
        ) : (
          projects.map((proj) => {
            const sm = STATUS_META[proj.statut] ?? {
              label: proj.statut,
              color: c.textSecondary,
            };
            const st = statsMap[proj.id];
            return (
              <TouchableOpacity
                key={proj.id}
                style={styles.card}
                activeOpacity={0.75}
                onPress={() => setSelected(proj)}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.projectIconWrap}>
                    <Ionicons name="folder" size={20} color={c.primary} />
                  </View>
                  <View style={styles.cardTitleWrap}>
                    <Text style={styles.cardTitle}>{proj.nom}</Text>
                    {proj.description ? (
                      <Text style={styles.cardDesc} numberOfLines={1}>
                        {proj.description}
                      </Text>
                    ) : null}
                  </View>
                  <View
                    style={[
                      styles.statusPill,
                      { backgroundColor: `${sm.color}22` },
                    ]}
                  >
                    <Text style={[styles.statusText, { color: sm.color }]}>
                      {sm.label}
                    </Text>
                  </View>
                </View>

                <View style={styles.statsRow}>
                  {[
                    {
                      icon: "flag-outline",
                      value: st?.nb_epics ?? 0,
                      label: "epics",
                    },
                    {
                      icon: "document-text-outline",
                      value: st?.nb_user_stories ?? 0,
                      label: "stories",
                    },
                    {
                      icon: "flash-outline",
                      value: st?.nb_sprints ?? 0,
                      label: "sprints",
                    },
                  ].map((item) => (
                    <View key={item.label} style={styles.statItem}>
                      <Ionicons
                        name={item.icon as any}
                        size={13}
                        color={c.textSecondary}
                      />
                      <Text style={styles.statText}>
                        {item.value} {item.label}
                      </Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* ── Project Detail Modal ── */}
      <Modal
        visible={!!selected}
        transparent
        animationType="slide"
        onRequestClose={() => setSelected(null)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setSelected(null)}
        >
          <TouchableOpacity activeOpacity={1} onPress={() => {}}>
            <View
              style={[
                styles.sheet,
                { paddingBottom: insets.bottom + SIZES.xl },
              ]}
            >
              <View style={styles.sheetHandle} />

              {/* Header */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: SIZES.lg,
                  gap: SIZES.sm,
                }}
              >
                <Text style={styles.sheetTitle} numberOfLines={2}>
                  {selected?.nom}
                </Text>
                {selected &&
                  (() => {
                    const sm = STATUS_META[selected.statut] ?? {
                      label: selected.statut,
                      color: c.textSecondary,
                    };
                    return (
                      <View
                        style={[
                          styles.statusPill,
                          { backgroundColor: `${sm.color}22` },
                        ]}
                      >
                        <Text style={[styles.statusText, { color: sm.color }]}>
                          {sm.label}
                        </Text>
                      </View>
                    );
                  })()}
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={() => setSelected(null)}
                >
                  <Ionicons name="close" size={16} color={c.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Description */}
              {selected?.description ? (
                <Text
                  style={{
                    color: c.text,
                    fontSize: SIZES.fontSm,
                    lineHeight: 20,
                    marginBottom: SIZES.md,
                  }}
                >
                  {selected.description}
                </Text>
              ) : (
                <Text
                  style={{
                    color: c.textSecondary,
                    fontSize: SIZES.fontSm,
                    fontStyle: "italic",
                    marginBottom: SIZES.md,
                  }}
                >
                  Aucune description
                </Text>
              )}

              {/* Dates */}
              <View style={styles.sheetRow}>
                <Ionicons
                  name="calendar-outline"
                  size={15}
                  color={c.textSecondary}
                />
                <Text style={styles.sheetLabel}>Début :</Text>
                <Text style={styles.sheetValue}>
                  {formatDate(selected?.date_debut)}
                </Text>
                <Text style={[styles.sheetLabel, { marginLeft: SIZES.sm }]}>
                  Fin :
                </Text>
                <Text style={styles.sheetValue}>
                  {formatDate(selected?.date_fin)}
                </Text>
              </View>

              <View style={styles.divider} />

              {/* Stats tiles */}
              <Text style={styles.sectionLabel}>Statistiques</Text>
              <View
                style={{
                  flexDirection: "row",
                  gap: SIZES.sm,
                  marginBottom: SIZES.md,
                }}
              >
                {[
                  {
                    label: "Epics",
                    value: selectedStats?.nb_epics ?? 0,
                    icon: "flag",
                    color: "#f59e0b",
                  },
                  {
                    label: "User Stories",
                    value: selectedStats?.nb_user_stories ?? 0,
                    icon: "document-text",
                    color: "#a855f7",
                  },
                  {
                    label: "Sprints",
                    value: selectedStats?.nb_sprints ?? 0,
                    icon: "flash",
                    color: "#22c55e",
                  },
                ].map((item) => (
                  <View key={item.label} style={styles.statTile}>
                    <View
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        backgroundColor: `${item.color}22`,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Ionicons
                        name={item.icon as any}
                        size={14}
                        color={item.color}
                      />
                    </View>
                    <Text style={styles.statTileValue}>{item.value}</Text>
                    <Text style={styles.statTileLabel}>{item.label}</Text>
                  </View>
                ))}
              </View>

              {/* Members */}
              {selected?.membres && selected.membres.length > 0 ? (
                <>
                  <View style={styles.divider} />
                  <Text style={styles.sectionLabel}>
                    Membres ({selected.membres.length})
                  </Text>
                  {selected.membres.map((m) => (
                    <View key={m.id} style={styles.memberRow}>
                      <View style={styles.memberAvatar}>
                        <Text style={styles.memberAvatarText}>
                          {(m.nom ?? m.email ?? "?")[0].toUpperCase()}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.memberName}>{m.nom}</Text>
                        {m.role?.nom ? (
                          <Text style={styles.memberRole}>{m.role.nom}</Text>
                        ) : null}
                      </View>
                    </View>
                  ))}
                </>
              ) : null}
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
