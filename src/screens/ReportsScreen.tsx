import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SIZES } from "@/constants";
import type { ThemePalette } from "@/constants/colors";
import { useAuthStore } from "@/context/authStore";
import { useThemePalette } from "@/hooks/useThemePalette";
import { projectsService } from "@/services/projects";
import { reportsService } from "@/services/reports";
import { ProjetResponse, RapportQAResponse } from "@/types/api";

function asArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const candidates = [record.items, record.results, record.data, record.logs];
    for (const candidate of candidates) {
      if (Array.isArray(candidate)) return candidate as T[];
    }
  }
  return [];
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
    createBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: SIZES.sm,
      backgroundColor: "#ec489966",
      paddingHorizontal: SIZES.md,
      paddingVertical: SIZES.sm,
      borderRadius: SIZES.radiusMd,
    },
    createBtnText: {
      color: "#ec4899",
      fontSize: SIZES.fontSm,
      fontWeight: "700",
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
    emptyText: { color: c.textSecondary, fontSize: SIZES.fontBase },
    emptyHint: { color: c.textSecondary, fontSize: SIZES.fontSm },
    reportCard: {
      backgroundColor: c.backgroundSecondary,
      borderRadius: SIZES.radiusLg,
      borderWidth: 1,
      borderColor: c.inputBorder,
      padding: SIZES.lg,
      marginBottom: SIZES.md,
    },
    reportHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: SIZES.md,
    },
    reportTitleWrap: { flex: 1, marginRight: SIZES.sm },
    reportTitle: {
      color: c.text,
      fontSize: SIZES.fontBase,
      fontWeight: "700",
    },
    reportDate: {
      color: c.textSecondary,
      fontSize: SIZES.fontXs,
      marginTop: 2,
    },
    statusPill: {
      paddingHorizontal: SIZES.sm,
      paddingVertical: 3,
      borderRadius: SIZES.radiusSm,
    },
    statusText: { fontSize: SIZES.fontXs, fontWeight: "700" },
    scoreRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: SIZES.sm,
    },
    scoreLabel: { color: c.textSecondary, fontSize: SIZES.fontSm },
    scoreValue: { fontSize: SIZES.fontBase, fontWeight: "800" },
    progressBarBg: {
      height: 6,
      borderRadius: 3,
      backgroundColor: c.inputBorder,
      marginBottom: SIZES.md,
    },
    progressBarFill: {
      height: 6,
      borderRadius: 3,
      backgroundColor: c.primary,
    },
    statsRow: { flexDirection: "row", gap: SIZES.lg, marginBottom: SIZES.sm },
    statItem: { flexDirection: "row", alignItems: "center", gap: 6 },
    statDot: { width: 8, height: 8, borderRadius: 4 },
    statText: { color: c.textSecondary, fontSize: SIZES.fontXs },
    chartCard: {
      backgroundColor: c.background,
      borderRadius: SIZES.radiusLg,
      borderWidth: 1,
      borderColor: c.inputBorder,
      padding: SIZES.md,
      marginBottom: SIZES.md,
    },
    chartTitle: { color: c.text, fontSize: SIZES.fontSm, fontWeight: "700" },
    chartSubtitle: {
      color: c.textSecondary,
      fontSize: SIZES.fontXs,
      marginTop: 2,
    },
    chartBarWrap: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: SIZES.sm,
      marginTop: SIZES.md,
    },
    chartBarItem: { flex: 1, alignItems: "center", gap: 6 },
    chartBarTrack: {
      width: "100%",
      height: 110,
      justifyContent: "flex-end",
      backgroundColor: c.backgroundSecondary,
      borderRadius: SIZES.radiusMd,
      overflow: "hidden",
    },
    chartBarFill: {
      width: "100%",
      borderTopLeftRadius: SIZES.radiusMd,
      borderTopRightRadius: SIZES.radiusMd,
    },
    chartBarValue: { color: c.text, fontSize: SIZES.fontXs, fontWeight: "700" },
    chartBarLabel: {
      color: c.textSecondary,
      fontSize: 10,
      textAlign: "center",
    },
    detailSection: {
      backgroundColor: c.background,
      borderRadius: SIZES.radiusLg,
      borderWidth: 1,
      borderColor: c.inputBorder,
      padding: SIZES.md,
      marginBottom: SIZES.md,
    },
    detailSectionTitle: {
      color: c.text,
      fontSize: SIZES.fontSm,
      fontWeight: "700",
      marginBottom: SIZES.sm,
    },
    detailRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: SIZES.sm,
    },
    detailLabel: { color: c.textSecondary, fontSize: SIZES.fontXs },
    detailValue: { color: c.text, fontSize: SIZES.fontSm, fontWeight: "700" },
    recommendationBox: {
      backgroundColor: "#f59e0b14",
      borderRadius: SIZES.radiusMd,
      borderWidth: 1,
      borderColor: "#f59e0b33",
      padding: SIZES.md,
      gap: SIZES.sm,
    },
    recommendationTitle: {
      color: c.text,
      fontSize: SIZES.fontSm,
      fontWeight: "700",
    },
    recommendationText: {
      color: c.textSecondary,
      fontSize: SIZES.fontSm,
      lineHeight: 20,
    },
    recommandations: {
      flexDirection: "row",
      gap: SIZES.sm,
      marginTop: SIZES.sm,
      padding: SIZES.sm,
      backgroundColor: "#f59e0b11",
      borderRadius: SIZES.radiusSm,
    },
    recommandationsText: {
      color: c.textSecondary,
      fontSize: SIZES.fontXs,
      flex: 1,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.7)",
      justifyContent: "flex-end",
    },
    modalCard: {
      backgroundColor: c.backgroundSecondary,
      borderTopLeftRadius: SIZES.radiusXl,
      borderTopRightRadius: SIZES.radiusXl,
      padding: SIZES.xl,
      paddingBottom: SIZES.xxl,
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: SIZES.lg,
    },
    modalTitle: { color: c.text, fontSize: SIZES.fontLg, fontWeight: "700" },
    inputLabel: {
      color: c.textSecondary,
      fontSize: SIZES.fontSm,
      marginBottom: SIZES.sm,
    },
    input: {
      backgroundColor: c.background,
      borderWidth: 1,
      borderColor: c.inputBorder,
      borderRadius: SIZES.radiusMd,
      padding: SIZES.md,
      color: c.text,
      fontSize: SIZES.fontBase,
      marginBottom: SIZES.md,
    },
    submitBtn: {
      backgroundColor: "#ec489966",
      borderRadius: SIZES.radiusMd,
      padding: SIZES.md,
      alignItems: "center",
    },
    submitBtnText: {
      color: "#ec4899",
      fontSize: SIZES.fontBase,
      fontWeight: "700",
    },
  });
}

export default function ReportsScreen() {
  const c = useThemePalette();
  const styles = useMemo(() => createStyles(c), [c]);

  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const isQA = user?.role === "Testeur QA";

  const [projects, setProjects] = useState<ProjetResponse[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjetResponse | null>(
    null,
  );
  const [reports, setReports] = useState<RapportQAResponse[]>([]);
  const [selectedReport, setSelectedReport] =
    useState<RapportQAResponse | null>(null);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingReports, setLoadingReports] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newTitre, setNewTitre] = useState("");
  const reportsCache = useRef<Record<number, RapportQAResponse[]>>({});

  async function loadProjects() {
    try {
      const data = asArray<ProjetResponse>(await projectsService.getMember());
      setProjects(data);
      if (data && data.length > 0) {
        setSelectedProject(data[0]);
        void loadReportsFor(data[0].id);
      }
    } catch (e: any) {
      Alert.alert("Erreur", e.message);
    } finally {
      setLoadingProjects(false);
      setRefreshing(false);
    }
  }

  async function loadReportsFor(projectId: number) {
    const cached = reportsCache.current[projectId];
    if (cached) {
      setReports(cached);
      return;
    }

    setLoadingReports(true);
    try {
      const data = asArray<RapportQAResponse>(
        await reportsService.getAll(projectId),
      );
      setReports(data);
      reportsCache.current[projectId] = data;
    } catch {
      setReports([]);
    } finally {
      setLoadingReports(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  async function selectProject(proj: ProjetResponse) {
    if (selectedProject?.id === proj.id) return;
    setSelectedProject(proj);
    await loadReportsFor(proj.id);
  }

  async function handleCreate() {
    if (!selectedProject || !newTitre.trim()) {
      Alert.alert("Validation", "Le titre est requis");
      return;
    }
    setCreating(true);
    try {
      const report = await reportsService.generate(selectedProject.id, {
        titre: newTitre.trim(),
      });
      setReports((prev) => [report, ...prev]);
      reportsCache.current[selectedProject.id] = [report, ...reports];
      setShowCreate(false);
      setNewTitre("");
    } catch (e: any) {
      Alert.alert("Erreur", e.message);
    } finally {
      setCreating(false);
    }
  }

  function scoreColor(score?: number) {
    if (score === undefined) return c.textSecondary;
    if (score >= 80) return "#22c55e";
    if (score >= 60) return "#f59e0b";
    return "#ef4444";
  }

  function scoreLabel(score?: number) {
    if (score === undefined) return "Sans score";
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Bon";
    if (score >= 40) return "Moyen";
    return "Critique";
  }

  function getReportMetrics(report: RapportQAResponse) {
    const passed = report.nb_tests_passes ?? 0;
    const failed = report.nb_tests_echoues ?? 0;
    const blocked = report.nb_tests_bloques ?? 0;
    const total = passed + failed + blocked;

    return {
      passed,
      failed,
      blocked,
      total,
      successPct: total > 0 ? Math.round((passed / total) * 100) : 0,
      failedPct: total > 0 ? Math.round((failed / total) * 100) : 0,
      blockedPct: total > 0 ? Math.round((blocked / total) * 100) : 0,
    };
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
              loadProjects();
            }}
            tintColor={c.primary}
          />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.pageTitle}>Rapports QA</Text>
            <Text style={styles.pageSubtitle}>{reports.length} rapport(s)</Text>
          </View>
        </View>

        {loadingProjects ? (
          <ActivityIndicator
            color={c.primary}
            style={{ marginTop: SIZES.xxl }}
          />
        ) : projects.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>Aucun projet disponible</Text>
          </View>
        ) : (
          <>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.projectPicker}
            >
              {projects.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={[
                    styles.projectChip,
                    selectedProject?.id === p.id && styles.projectChipActive,
                  ]}
                  onPress={() => selectProject(p)}
                >
                  <Text
                    style={[
                      styles.projectChipText,
                      selectedProject?.id === p.id &&
                        styles.projectChipTextActive,
                    ]}
                  >
                    {p.nom}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {loadingReports ? (
              <ActivityIndicator
                color={c.primary}
                style={{ marginTop: SIZES.xl }}
              />
            ) : reports.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Ionicons
                  name="bar-chart-outline"
                  size={48}
                  color={c.textSecondary}
                />
                <Text style={styles.emptyText}>Aucun rapport QA</Text>
                {isQA && (
                  <Text style={styles.emptyHint}>
                    Générez votre premier rapport
                  </Text>
                )}
              </View>
            ) : (
              reports.map((report) => {
                const sc = scoreColor(report.score_qualite);
                const metrics = getReportMetrics(report);

                return (
                  <TouchableOpacity
                    key={report.id}
                    style={styles.reportCard}
                    activeOpacity={0.8}
                    onPress={() => setSelectedReport(report)}
                  >
                    <View style={styles.reportHeader}>
                      <View style={styles.reportTitleWrap}>
                        <Text style={styles.reportTitle}>{report.titre}</Text>
                        <Text style={styles.reportDate}>
                          {new Date(report.created_at).toLocaleDateString(
                            "fr-FR",
                          )}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.statusPill,
                          {
                            backgroundColor:
                              report.statut === "FINALISE"
                                ? "#22c55e22"
                                : "#f59e0b22",
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            {
                              color:
                                report.statut === "FINALISE"
                                  ? "#22c55e"
                                  : "#f59e0b",
                            },
                          ]}
                        >
                          {report.statut === "FINALISE"
                            ? "Finalisé"
                            : "Brouillon"}
                        </Text>
                      </View>
                    </View>

                    {report.score_qualite !== undefined && (
                      <View style={styles.scoreRow}>
                        <Text style={styles.scoreLabel}>Score qualité</Text>
                        <Text style={[styles.scoreValue, { color: sc }]}>
                          {report.score_qualite.toFixed(1)}%
                        </Text>
                      </View>
                    )}

                    <View style={styles.progressBarBg}>
                      <View
                        style={[
                          styles.progressBarFill,
                          { width: `${metrics.successPct}%` as any },
                        ]}
                      />
                    </View>

                    <View style={styles.statsRow}>
                      <View style={styles.statItem}>
                        <View
                          style={[
                            styles.statDot,
                            { backgroundColor: "#22c55e" },
                          ]}
                        />
                        <Text style={styles.statText}>
                          {metrics.passed} passés
                        </Text>
                      </View>
                      <View style={styles.statItem}>
                        <View
                          style={[
                            styles.statDot,
                            { backgroundColor: "#ef4444" },
                          ]}
                        />
                        <Text style={styles.statText}>
                          {metrics.failed} échoués
                        </Text>
                      </View>
                      <View style={styles.statItem}>
                        <View
                          style={[
                            styles.statDot,
                            { backgroundColor: "#f59e0b" },
                          ]}
                        />
                        <Text style={styles.statText}>
                          {metrics.blocked} bloqués
                        </Text>
                      </View>
                    </View>

                    {report.recommandations && (
                      <View style={styles.recommandations}>
                        <Ionicons
                          name="bulb-outline"
                          size={14}
                          color="#f59e0b"
                        />
                        <Text
                          style={styles.recommandationsText}
                          numberOfLines={3}
                        >
                          {report.recommandations}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })
            )}
          </>
        )}
      </ScrollView>

      <Modal visible={showCreate} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Générer un rapport QA</Text>
              <TouchableOpacity onPress={() => setShowCreate(false)}>
                <Ionicons name="close" size={24} color={c.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.inputLabel}>Titre du rapport *</Text>
            <TextInput
              style={styles.input}
              value={newTitre}
              onChangeText={setNewTitre}
              placeholder="Rapport QA Sprint 1"
              placeholderTextColor={c.textSecondary}
            />
            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleCreate}
              disabled={creating}
            >
              {creating ? (
                <ActivityIndicator color={c.white} size="small" />
              ) : (
                <Text style={styles.submitBtnText}>Générer</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={selectedReport !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedReport(null)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "flex-end",
            }}
          >
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <View style={{ flex: 1, paddingRight: SIZES.sm }}>
                  <Text style={styles.modalTitle} numberOfLines={2}>
                    {selectedReport?.titre}
                  </Text>
                  <Text
                    style={{
                      color: c.textSecondary,
                      fontSize: SIZES.fontXs,
                      marginTop: 4,
                    }}
                  >
                    Détails, chartes et recommandations IA
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedReport(null)}>
                  <Ionicons name="close" size={24} color={c.textSecondary} />
                </TouchableOpacity>
              </View>

              {selectedReport &&
                (() => {
                  const metrics = getReportMetrics(selectedReport);

                  return (
                    <>
                      <View style={styles.detailSection}>
                        <Text style={styles.detailSectionTitle}>Résumé</Text>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Statut</Text>
                          <Text style={styles.detailValue}>
                            {selectedReport.statut === "FINALISE"
                              ? "Finalisé"
                              : "Brouillon"}
                          </Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Score qualité</Text>
                          <Text
                            style={[
                              styles.detailValue,
                              {
                                color: scoreColor(selectedReport.score_qualite),
                              },
                            ]}
                          >
                            {selectedReport.score_qualite !== undefined
                              ? `${selectedReport.score_qualite.toFixed(1)}%`
                              : "—"}
                          </Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Niveau</Text>
                          <Text style={styles.detailValue}>
                            {scoreLabel(selectedReport.score_qualite)}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.chartCard}>
                        <Text style={styles.chartTitle}>
                          Répartition des tests
                        </Text>
                        <Text style={styles.chartSubtitle}>
                          Vue rapide des résultats comme sur le web
                        </Text>
                        <View style={styles.chartBarWrap}>
                          {[
                            {
                              label: "Passés",
                              value: metrics.passed,
                              color: "#22c55e",
                            },
                            {
                              label: "Échoués",
                              value: metrics.failed,
                              color: "#ef4444",
                            },
                            {
                              label: "Bloqués",
                              value: metrics.blocked,
                              color: "#f59e0b",
                            },
                          ].map((item) => {
                            const maxValue = Math.max(
                              metrics.passed,
                              metrics.failed,
                              metrics.blocked,
                              1,
                            );
                            const height = Math.max(
                              18,
                              Math.round((item.value / maxValue) * 110),
                            );
                            return (
                              <View
                                key={item.label}
                                style={styles.chartBarItem}
                              >
                                <Text style={styles.chartBarValue}>
                                  {item.value}
                                </Text>
                                <View style={styles.chartBarTrack}>
                                  <View
                                    style={[
                                      styles.chartBarFill,
                                      {
                                        height,
                                        backgroundColor: item.color,
                                      },
                                    ]}
                                  />
                                </View>
                                <Text style={styles.chartBarLabel}>
                                  {item.label}
                                </Text>
                              </View>
                            );
                          })}
                        </View>
                        <View style={{ marginTop: SIZES.md, gap: 8 }}>
                          <Text style={styles.detailLabel}>
                            Passés: {metrics.passed}
                          </Text>
                          <Text style={styles.detailLabel}>
                            Échoués: {metrics.failed}
                          </Text>
                          <Text style={styles.detailLabel}>
                            Bloqués: {metrics.blocked}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.detailSection}>
                        <Text style={styles.detailSectionTitle}>
                          Indicateurs clés
                        </Text>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>
                            Taux de réussite
                          </Text>
                          <Text style={styles.detailValue}>
                            {metrics.total > 0 ? `${metrics.successPct}%` : "—"}
                          </Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Échecs</Text>
                          <Text style={styles.detailValue}>
                            {metrics.failedPct}%
                          </Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Blocages</Text>
                          <Text style={styles.detailValue}>
                            {metrics.blockedPct}%
                          </Text>
                        </View>
                      </View>

                      <View style={styles.detailSection}>
                        <Text style={styles.detailSectionTitle}>
                          Recommandation IA
                        </Text>
                        <View style={styles.recommendationBox}>
                          <Ionicons
                            name="sparkles-outline"
                            size={18}
                            color="#f59e0b"
                          />
                          <Text style={styles.recommendationTitle}>
                            {selectedReport.recommandations
                              ? "Analyse générée"
                              : "Aucune recommandation générée"}
                          </Text>
                          <Text style={styles.recommendationText}>
                            {selectedReport.recommandations ||
                              "Le rapport ne contient pas encore de recommandation IA. Génère ou mets à jour le rapport pour voir l’analyse."}
                          </Text>
                        </View>
                      </View>
                    </>
                  );
                })()}
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
