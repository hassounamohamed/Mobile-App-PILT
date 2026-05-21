import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef, useState } from "react";
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

import { SIZES } from "@/constants";
import type { ThemePalette } from "@/constants/colors";
import { useThemePalette } from "@/hooks/useThemePalette";
import { projectsService } from "@/services/projects";
import {
    AnomalieResponse,
    AnomalieStatut,
    anomaliesService,
} from "@/services/anomalies";
import type { ProjetResponse } from "@/types/api";

function formatDateTime(value?: string) {
  if (!value) return "-";
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime())) return value;
  return `${parsed.toLocaleDateString("fr-FR")} ${parsed.toLocaleTimeString(
    "fr-FR",
    { hour: "2-digit", minute: "2-digit" },
  )}`;
}

function severiteColor(severite: string, c: ThemePalette): string {
  if (severite === "CRITIQUE") return "#ef4444";
  if (severite === "MAJEURE") return "#f97316";
  return "#eab308";
}

function statutLabel(statut: AnomalieStatut): string {
  if (statut === "NOUVEAU") return "Nouveau";
  if (statut === "EN_COURS") return "En cours";
  if (statut === "REOUVERT") return "Réouvert";
  return "Résolu";
}

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
    projectPicker: { marginBottom: SIZES.md },
    projectChip: {
      paddingHorizontal: SIZES.md,
      paddingVertical: SIZES.sm,
      borderRadius: SIZES.radiusSm,
      borderWidth: 1,
      borderColor: c.inputBorder,
      backgroundColor: c.backgroundSecondary,
      marginRight: SIZES.sm,
    },
    projectChipActive: {
      backgroundColor: c.primary,
      borderColor: c.primary,
    },
    projectChipText: {
      color: c.textSecondary,
      fontSize: SIZES.fontSm,
      fontWeight: "600",
    },
    projectChipTextActive: { color: c.white },
    emptyWrap: { alignItems: "center", paddingTop: SIZES.xxl, gap: SIZES.md },
    emptyText: {
      color: c.textSecondary,
      fontSize: SIZES.fontBase,
      textAlign: "center",
    },
    anomalyCard: {
      backgroundColor: c.backgroundSecondary,
      borderRadius: SIZES.radiusLg,
      borderWidth: 1,
      borderColor: c.inputBorder,
      padding: SIZES.lg,
      marginBottom: SIZES.md,
    },
    anomalyHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: SIZES.sm,
    },
    anomalyTitleWrap: { flex: 1, paddingRight: SIZES.sm },
    anomalyTitle: {
      color: c.text,
      fontSize: SIZES.fontBase,
      fontWeight: "700",
    },
    anomalyMeta: {
      color: c.textSecondary,
      fontSize: SIZES.fontXs,
      marginTop: 2,
    },
    anomalyDescription: {
      color: c.textSecondary,
      fontSize: SIZES.fontSm,
      lineHeight: 20,
      marginBottom: SIZES.sm,
    },
    badgeRow: { flexDirection: "row", gap: SIZES.sm, flexWrap: "wrap" },
    badge: {
      paddingHorizontal: SIZES.sm,
      paddingVertical: 3,
      borderRadius: SIZES.radiusSm,
    },
    badgeText: {
      color: c.white,
      fontSize: SIZES.fontXs,
      fontWeight: "700",
    },
    summaryRow: {
      flexDirection: "row",
      gap: SIZES.sm,
      marginBottom: SIZES.lg,
    },
    summaryCard: {
      flex: 1,
      backgroundColor: c.backgroundSecondary,
      borderRadius: SIZES.radiusLg,
      borderWidth: 1,
      borderColor: c.inputBorder,
      padding: SIZES.md,
    },
    summaryValue: { color: c.text, fontSize: SIZES.fontLg, fontWeight: "800" },
    summaryLabel: {
      color: c.textSecondary,
      fontSize: SIZES.fontXs,
      marginTop: 4,
    },
  });
}

export default function AnomaliesScreen() {
  const c = useThemePalette();
  const styles = useMemo(() => createStyles(c), [c]);
  const insets = useSafeAreaInsets();

  const [projects, setProjects] = useState<ProjetResponse[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjetResponse | null>(null);
  const [anomalies, setAnomalies] = useState<AnomalieResponse[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingAnomalies, setLoadingAnomalies] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const cacheRef = useRef<Record<number, AnomalieResponse[]>>({});

  async function loadAnomaliesFor(project: ProjetResponse) {
    const cached = cacheRef.current[project.id];
    if (cached) {
      setAnomalies(cached);
      return;
    }

    setLoadingAnomalies(true);
    try {
      const items = await anomaliesService.getByProject(project.id);
      setAnomalies(items);
      cacheRef.current[project.id] = items;
    } catch (e: any) {
      setAnomalies([]);
      Alert.alert("Erreur", e.message);
    } finally {
      setLoadingAnomalies(false);
    }
  }

  async function loadProjects() {
    try {
      const data = await projectsService.getMember();
      const safeProjects = data ?? [];
      setProjects(safeProjects);
      if (safeProjects.length > 0) {
        setSelectedProject(safeProjects[0]);
        void loadAnomaliesFor(safeProjects[0]);
      } else {
        setSelectedProject(null);
        setAnomalies([]);
      }
    } catch (e: any) {
      Alert.alert("Erreur", e.message);
    } finally {
      setLoadingProjects(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  function selectProject(project: ProjetResponse) {
    if (selectedProject?.id === project.id) return;
    setSelectedProject(project);
    void loadAnomaliesFor(project);
  }

  function onRefresh() {
    if (selectedProject) {
      delete cacheRef.current[selectedProject.id];
    }
    setRefreshing(true);
    loadProjects();
  }

  const critiques = anomalies.filter((a) => a.severite === "CRITIQUE").length;
  const nonResolus = anomalies.filter((a) => a.statut !== "RESOLU").length;

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
            onRefresh={onRefresh}
            tintColor={c.primary}
          />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.pageTitle}>Anomalies</Text>
            <Text style={styles.pageSubtitle}>
              Anomalies signalées par projet
            </Text>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{anomalies.length}</Text>
            <Text style={styles.summaryLabel}>Total</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryValue, { color: "#ef4444" }]}>
              {critiques}
            </Text>
            <Text style={styles.summaryLabel}>Critiques</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryValue, { color: "#f97316" }]}>
              {nonResolus}
            </Text>
            <Text style={styles.summaryLabel}>Non résolus</Text>
          </View>
        </View>

        {loadingProjects ? (
          <ActivityIndicator
            color={c.primary}
            style={{ marginTop: SIZES.xxl }}
          />
        ) : projects.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Ionicons name="bug-outline" size={48} color={c.textSecondary} />
            <Text style={styles.emptyText}>Aucun projet disponible</Text>
          </View>
        ) : (
          <>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.projectPicker}
            >
              {projects.map((project) => (
                <TouchableOpacity
                  key={project.id}
                  style={[
                    styles.projectChip,
                    selectedProject?.id === project.id &&
                      styles.projectChipActive,
                  ]}
                  onPress={() => selectProject(project)}
                >
                  <Text
                    style={[
                      styles.projectChipText,
                      selectedProject?.id === project.id &&
                        styles.projectChipTextActive,
                    ]}
                  >
                    {project.nom}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {loadingAnomalies ? (
              <ActivityIndicator
                color={c.primary}
                style={{ marginTop: SIZES.xl }}
              />
            ) : anomalies.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={48}
                  color={c.textSecondary}
                />
                <Text style={styles.emptyText}>
                  Aucune anomalie pour ce projet
                </Text>
              </View>
            ) : (
              anomalies.map((item) => (
                <View key={item.id} style={styles.anomalyCard}>
                  <View style={styles.anomalyHeader}>
                    <View style={styles.anomalyTitleWrap}>
                      <Text style={styles.anomalyTitle}>{item.titre}</Text>
                      {item.cas_test_titre ? (
                        <Text style={styles.anomalyMeta}>
                          Cas: {item.cas_test_titre}
                          {item.cas_test_ref ? ` (${item.cas_test_ref})` : ""}
                        </Text>
                      ) : null}
                      <Text style={styles.anomalyMeta}>
                        {formatDateTime(item.dateCreation)}
                      </Text>
                    </View>
                  </View>

                  {item.description ? (
                    <Text style={styles.anomalyDescription}>
                      {item.description}
                    </Text>
                  ) : null}

                  <View style={styles.badgeRow}>
                    <View
                      style={[
                        styles.badge,
                        { backgroundColor: severiteColor(item.severite, c) },
                      ]}
                    >
                      <Text style={styles.badgeText}>{item.severite}</Text>
                    </View>
                    <View
                      style={[
                        styles.badge,
                        {
                          backgroundColor:
                            item.statut === "RESOLU" ? "#22c55e" : c.primary,
                        },
                      ]}
                    >
                      <Text style={styles.badgeText}>
                        {statutLabel(item.statut)}
                      </Text>
                    </View>
                  </View>

                  {item.reporter_nom ? (
                    <Text style={[styles.anomalyMeta, { marginTop: SIZES.sm }]}>
                      Signalé par {item.reporter_nom}
                      {item.assigned_nom ? ` · Assigné à ${item.assigned_nom}` : ""}
                    </Text>
                  ) : null}
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}
