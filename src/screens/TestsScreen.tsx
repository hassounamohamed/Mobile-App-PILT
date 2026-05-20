import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useEffect, useState } from "react";
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

import type { ThemePalette } from "@/constants/colors";
import { SIZES } from "@/constants";
import { useThemePalette } from "@/hooks/useThemePalette";
import { projectsService } from "@/services/projects";
import { cahierTestsService } from "@/services/tests";
import {
  CahierTestResponse,
  CasTestResponse,
  CasTestHistoryEntry,
  ProjetResponse,
} from "@/types/api";

const CAS_STATUS_META: Record<
  string,
  { label: string; color: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  NON_EXECUTE: {
    label: "À exécuter",
    color: "#9ca3af",
    icon: "ellipse-outline",
  },
  PASSE: { label: "Passé", color: "#22c55e", icon: "checkmark-circle" },
  ECHEC: { label: "Échoué", color: "#ef4444", icon: "close-circle" },
  BLOQUE: { label: "Bloqué", color: "#f59e0b", icon: "warning" },
};

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

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime())) return value;
  return `${parsed.toLocaleDateString("fr-FR")} ${parsed.toLocaleTimeString(
    "fr-FR",
    { hour: "2-digit", minute: "2-digit" },
  )}`;
}

function createStyles(c: ThemePalette) {
  return StyleSheet.create({
  root: { flex: 1, backgroundColor: c.background },
  pageTitle: {
    color: c.text,
    fontSize: SIZES.font2xl,
    fontWeight: "800",
    marginBottom: 2,
  },
  pageSubtitle: {
    color: c.textSecondary,
    fontSize: SIZES.fontSm,
    marginBottom: SIZES.lg,
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
  cahierSummary: {
    backgroundColor: c.backgroundSecondary,
    borderRadius: SIZES.radiusLg,
    borderWidth: 1,
    borderColor: c.inputBorder,
    padding: SIZES.lg,
    marginBottom: SIZES.md,
  },
  cahierHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SIZES.md,
  },
  cahierTitle: {
    color: c.text,
    fontSize: SIZES.fontBase,
    fontWeight: "700",
    flex: 1,
    marginRight: SIZES.sm,
  },
  pill: {
    paddingHorizontal: SIZES.sm,
    paddingVertical: 2,
    borderRadius: SIZES.radiusSm,
  },
  pillText: { fontSize: SIZES.fontXs, fontWeight: "700" },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SIZES.sm,
  },
  progressLabel: {
    color: c.text,
    fontSize: SIZES.fontSm,
    fontWeight: "600",
  },
  progressStats: { color: c.textSecondary, fontSize: SIZES.fontXs },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: c.inputBorder,
  },
  progressBarFill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: c.primary,
  },
  casCard: {
    backgroundColor: c.backgroundSecondary,
    borderRadius: SIZES.radiusLg,
    borderWidth: 1,
    borderColor: c.inputBorder,
    padding: SIZES.md,
    marginBottom: SIZES.sm,
  },
  casHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SIZES.sm,
    marginBottom: SIZES.sm,
  },
  casTitle: {
    color: c.text,
    fontSize: SIZES.fontSm,
    fontWeight: "600",
    flex: 1,
  },
  casDesc: {
    color: c.textSecondary,
    fontSize: SIZES.fontXs,
    marginBottom: SIZES.sm,
  },
  casHint: {
    color: c.textSecondary,
    fontSize: SIZES.fontXs,
  },
  statusPill: {
    paddingHorizontal: SIZES.sm,
    paddingVertical: 2,
    borderRadius: SIZES.radiusSm,
  },
  statusPillText: {
    fontSize: SIZES.fontXs,
    fontWeight: "700",
  },
  casActions: { flexDirection: "row", gap: SIZES.sm, flexWrap: "wrap" },
  casBtn: {
    paddingHorizontal: SIZES.sm,
    paddingVertical: 4,
    borderRadius: SIZES.radiusSm,
    borderWidth: 1,
    borderColor: c.inputBorder,
  },
  casBtnText: { fontSize: SIZES.fontXs, fontWeight: "600" },
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
  modalSubtitle: {
    color: c.textSecondary,
    fontSize: SIZES.fontXs,
    marginTop: 2,
  },
  caseDetailBox: {
    backgroundColor: c.background,
    borderWidth: 1,
    borderColor: c.inputBorder,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    gap: 4,
    marginBottom: SIZES.md,
  },
  caseMetaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SIZES.sm,
    marginBottom: SIZES.sm,
  },
  caseMetaCard: {
    width: "48%",
    backgroundColor: c.backgroundSecondary,
    borderWidth: 1,
    borderColor: c.inputBorder,
    borderRadius: SIZES.radiusSm,
    padding: SIZES.sm,
  },
  caseMetaLabel: {
    color: c.textSecondary,
    fontSize: SIZES.fontXs,
    marginBottom: 2,
  },
  caseMetaValue: {
    color: c.text,
    fontSize: SIZES.fontSm,
    fontWeight: "700",
  },
  caseDetailText: { color: c.textSecondary, fontSize: SIZES.fontSm },
  historyBox: {
    backgroundColor: c.background,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    marginBottom: SIZES.md,
  },
  historyTitle: {
    color: c.text,
    fontSize: SIZES.fontBase,
    fontWeight: "700",
    marginBottom: SIZES.sm,
  },
  historyScroll: { maxHeight: 220 },
  historyEmpty: { color: c.textSecondary, fontSize: SIZES.fontSm },
  historyRow: {
    paddingVertical: SIZES.sm,
    borderBottomWidth: 1,
    borderBottomColor: c.inputBorder,
  },
  historyEntryTitle: {
    color: c.text,
    fontSize: SIZES.fontSm,
    fontWeight: "700",
  },
  historyEntryDetail: {
    color: c.textSecondary,
    fontSize: SIZES.fontXs,
    marginTop: 2,
  },
  historyEntryComment: {
    color: c.text,
    fontSize: SIZES.fontXs,
    marginTop: 4,
  },
});
}

export default function TestsScreen() {
  const c = useThemePalette();
  const styles = useMemo(() => createStyles(c), [c]);

  const insets = useSafeAreaInsets();
  const [projects, setProjects] = useState<ProjetResponse[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjetResponse | null>(
    null,
  );
  const [cahier, setCahier] = useState<CahierTestResponse | null>(null);
  const [casTests, setCasTests] = useState<CasTestResponse[]>([]);
  const [selectedCas, setSelectedCas] = useState<CasTestResponse | null>(null);
  const [showCasDetail, setShowCasDetail] = useState(false);
  const [casHistory, setCasHistory] = useState<CasTestHistoryEntry[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingTests, setLoadingTests] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  async function loadTestsFor(projectId: number) {
    setLoadingTests(true);
    try {
      const detail = await cahierTestsService.getCahierDetail(projectId);
      setCahier(detail);
      if (detail) {
        setCasTests(
          await cahierTestsService.listCasTests(projectId, detail.id),
        );
      } else {
        setCasTests([]);
      }
      setSelectedCas(null);
      setShowCasDetail(false);
      setCasHistory([]);
    } catch (e: any) {
      Alert.alert("Erreur", e.message);
      setCahier(null);
      setCasTests([]);
    } finally {
      setLoadingTests(false);
    }
  }

  async function loadProjects() {
    try {
      const data = asArray<ProjetResponse>(await projectsService.getMember());
      setProjects(data);
      if (data.length > 0) {
        setSelectedProject(data[0]);
        await loadTestsFor(data[0].id);
      } else {
        setSelectedProject(null);
        setCahier(null);
        setCasTests([]);
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

  async function selectProject(proj: ProjetResponse) {
    setSelectedProject(proj);
    await loadTestsFor(proj.id);
  }

  async function openCasDetail(cas: CasTestResponse) {
    setSelectedCas(cas);
    setShowCasDetail(true);
    setCasHistory([]);

    if (!cahier || !selectedProject) return;

    setLoadingHistory(true);
    try {
      const history = await cahierTestsService.getCasTestHistory(
        selectedProject.id,
        cahier.id,
        cas.id,
      );
      setCasHistory(history);
    } catch (e: any) {
      Alert.alert("Erreur", e.message);
      setCasHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  }

  async function updateCasStatus(
    cas: CasTestResponse,
    statut: CasTestResponse["statut"],
  ) {
    if (!cahier || !selectedProject) return;
    try {
      const updated = await cahierTestsService.updateCasTest(
        selectedProject.id,
        cahier.id,
        cas.id,
        { statut },
      );
      setCasTests((prev) =>
        prev.map((item) => (item.id === cas.id ? updated : item)),
      );
      setSelectedCas((prev) => (prev?.id === cas.id ? updated : prev));
    } catch (e: any) {
      Alert.alert("Erreur", e.message);
    }
  }

  const passedCount = casTests.filter((c) => c.statut === "PASSE").length;
  const failedCount = casTests.filter((c) => c.statut === "ECHEC").length;
  const progressPct =
    casTests.length > 0 ? Math.round((passedCount / casTests.length) * 100) : 0;

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
        <Text style={styles.pageTitle}>Tests</Text>
        <Text style={styles.pageSubtitle}>Cahier de tests</Text>

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

            {loadingTests ? (
              <ActivityIndicator
                color={c.primary}
                style={{ marginTop: SIZES.xl }}
              />
            ) : (
              <>
                {cahier ? (
                  <View style={styles.cahierSummary}>
                    <View style={styles.cahierHeader}>
                      <Text style={styles.cahierTitle}>{cahier.titre}</Text>
                      <View
                        style={[styles.pill, { backgroundColor: "#06b6d422" }]}
                      >
                        <Text style={[styles.pillText, { color: "#06b6d4" }]}>
                          {cahier.statut}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.progressRow}>
                      <Text style={styles.progressLabel}>
                        Progression: {progressPct}%
                      </Text>
                      <Text style={styles.progressStats}>
                        ✅ {passedCount} · ❌ {failedCount} · Total{" "}
                        {casTests.length}
                      </Text>
                    </View>
                    <View style={styles.progressBarBg}>
                      <View
                        style={[
                          styles.progressBarFill,
                          { width: `${progressPct}%` as any },
                        ]}
                      />
                    </View>
                  </View>
                ) : null}

                {casTests.length === 0 ? (
                  <View style={styles.emptyWrap}>
                    <Ionicons
                      name="clipboard-outline"
                      size={48}
                      color={c.textSecondary}
                    />
                    <Text style={styles.emptyText}>Aucun cas de test</Text>
                  </View>
                ) : (
                  casTests.map((cas) => {
                    const meta =
                      CAS_STATUS_META[cas.statut] ??
                      CAS_STATUS_META.NON_EXECUTE;
                    return (
                      <TouchableOpacity
                        key={cas.id}
                        style={styles.casCard}
                        activeOpacity={0.9}
                        onPress={() => openCasDetail(cas)}
                      >
                        <View style={styles.casHeader}>
                          <Ionicons
                            name={meta.icon}
                            size={18}
                            color={meta.color}
                          />
                          <Text style={styles.casTitle}>{cas.titre}</Text>
                          <View
                            style={[
                              styles.statusPill,
                              { backgroundColor: `${meta.color}22` },
                            ]}
                          >
                            <Text style={[styles.statusPillText, { color: meta.color }]}>
                              {meta.label}
                            </Text>
                          </View>
                        </View>
                        {cas.description ? (
                          <Text style={styles.casDesc}>{cas.description}</Text>
                        ) : null}
                        <Text style={styles.casHint}>
                          Appuyez pour voir le détail
                        </Text>
                      </TouchableOpacity>
                    );
                  })
                )}
              </>
            )}
          </>
        )}
      </ScrollView>

      <Modal visible={showCasDetail} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>
                  {selectedCas?.titre ?? "Cas de test"}
                </Text>
                <Text style={styles.modalSubtitle}>Détails du cas de test</Text>
              </View>
              <TouchableOpacity onPress={() => setShowCasDetail(false)}>
                <Ionicons name="close" size={24} color={c.textSecondary} />
              </TouchableOpacity>
            </View>

            {selectedCas ? (
              <>
                <View style={styles.caseDetailBox}>
                  <View style={styles.caseMetaGrid}>
                    <View style={styles.caseMetaCard}>
                      <Text style={styles.caseMetaLabel}>ID</Text>
                      <Text style={styles.caseMetaValue}>#{selectedCas.id}</Text>
                    </View>
                    <View style={styles.caseMetaCard}>
                      <Text style={styles.caseMetaLabel}>Statut</Text>
                      <Text style={styles.caseMetaValue}>
                        {CAS_STATUS_META[selectedCas.statut]?.label ??
                          selectedCas.statut.replace("_", " ")}
                      </Text>
                    </View>
                    <View style={styles.caseMetaCard}>
                      <Text style={styles.caseMetaLabel}>Type de test</Text>
                      <Text style={styles.caseMetaValue}>{selectedCas.type}</Text>
                    </View>
                    <View style={styles.caseMetaCard}>
                      <Text style={styles.caseMetaLabel}>User story</Text>
                      <Text style={styles.caseMetaValue}>
                        {selectedCas.user_story_id
                          ? `#${selectedCas.user_story_id}`
                          : "Non liée"}
                      </Text>
                    </View>
                  </View>
                  {selectedCas.resultat ? (
                    <Text style={styles.caseDetailText}>
                      Résultat obtenu: {selectedCas.resultat}
                    </Text>
                  ) : null}
                  {selectedCas.description ? (
                    <Text style={styles.caseDetailText}>
                      {selectedCas.description}
                    </Text>
                  ) : null}
                </View>

                <View style={styles.historyBox}>
                  <Text style={styles.historyTitle}>Historique</Text>
                  {loadingHistory ? (
                    <ActivityIndicator
                      color={c.primary}
                      style={{ marginTop: SIZES.sm }}
                    />
                  ) : casHistory.length === 0 ? (
                    <Text style={styles.historyEmpty}>
                      Aucun historique disponible
                    </Text>
                  ) : (
                    <ScrollView
                      style={styles.historyScroll}
                      showsVerticalScrollIndicator={false}
                    >
                      {casHistory.map((entry) => (
                      <View key={entry.id} style={styles.historyRow}>
                        <Text style={styles.historyEntryTitle}>
                          {entry.statut ?? "Mise à jour"}
                        </Text>
                        <Text style={styles.historyEntryDetail}>
                          {entry.user_nom ?? entry.user_email ?? "Utilisateur"}
                          {entry.created_at
                            ? ` · ${formatDateTime(entry.created_at)}`
                            : ""}
                        </Text>
                        {entry.commentaire ? (
                          <Text style={styles.historyEntryComment}>
                            {entry.commentaire}
                          </Text>
                        ) : null}
                      </View>
                      ))}
                    </ScrollView>
                  )}
                </View>

                <View style={styles.casActions}>
                  {(
                    ["PASSE", "ECHEC", "BLOQUE"] as CasTestResponse["statut"][]
                  ).map((status) => (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.casBtn,
                        selectedCas.statut === status && {
                          backgroundColor: `${CAS_STATUS_META[status].color}33`,
                        },
                      ]}
                      onPress={() => updateCasStatus(selectedCas, status)}
                    >
                      <Text
                        style={[
                          styles.casBtnText,
                          { color: CAS_STATUS_META[status].color },
                        ]}
                      >
                        {CAS_STATUS_META[status].label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
}


