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
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { ThemePalette } from "@/constants/colors";
import { SIZES } from "@/constants";
import { useThemePalette } from "@/hooks/useThemePalette";
import { useAuthStore } from "@/context/authStore";
import { projectsService } from "@/services/projects";
import { sprintsService } from "@/services/sprints";
import { ProjetResponse, SprintResponse } from "@/types/api";

const STATUS_META: Record<
  string,
  { label: string; color: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  PLANIFIE: { label: "Planifié", color: "#9ca3af", icon: "time-outline" },
  EN_COURS: { label: "En cours", color: "#f59e0b", icon: "flash" },
  CLOTURE: { label: "Clôturé", color: "#22c55e", icon: "checkmark-circle" },
};

const STORY_STATUS_META: Record<
  string,
  { label: string; color: string }
> = {
  A_FAIRE: { label: "À faire", color: "#9ca3af" },
  EN_COURS: { label: "En cours", color: "#f59e0b" },
  A_TESTER: { label: "À tester", color: "#06b6d4" },
  TERMINE: { label: "Terminé", color: "#22c55e" },
};

const STORY_PRIORITY_META: Record<string, { label: string; color: string }> = {
  CRITIQUE: { label: "Critique", color: "#ef4444" },
  HAUTE: { label: "Haute", color: "#f59e0b" },
  MOYENNE: { label: "Moyenne", color: "#3b82f6" },
  BASSE: { label: "Basse", color: "#22c55e" },
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

function formatDate(date?: string) {
  if (!date) return "-";
  const parsed = new Date(date);
  if (!Number.isFinite(parsed.getTime())) return date;
  return parsed.toLocaleDateString("fr-FR");
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
    backgroundColor: c.primary,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radiusMd,
  },
  createBtnText: {
    color: c.white,
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
  sprintCard: {
    backgroundColor: c.backgroundSecondary,
    borderRadius: SIZES.radiusLg,
    borderWidth: 1,
    borderColor: c.inputBorder,
    padding: SIZES.lg,
    marginBottom: SIZES.md,
  },
  sprintCardActive: { borderColor: "#f59e0b44" },
  sprintHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SIZES.md,
    marginBottom: SIZES.md,
  },
  statusIcon: {
    width: 32,
    height: 32,
    borderRadius: SIZES.radiusMd,
    alignItems: "center",
    justifyContent: "center",
  },
  sprintTitleWrap: { flex: 1 },
  sprintName: {
    color: c.text,
    fontSize: SIZES.fontBase,
    fontWeight: "700",
  },
  sprintObjectif: {
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
  metaRow: { flexDirection: "row", gap: SIZES.lg, marginBottom: SIZES.sm },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { color: c.textSecondary, fontSize: SIZES.fontXs },
  cardHint: {
    color: c.textSecondary,
    fontSize: SIZES.fontXs,
    marginTop: SIZES.sm,
  },
  actionsRow: {
    flexDirection: "row",
    gap: SIZES.md,
    paddingTop: SIZES.sm,
    borderTopWidth: 1,
    borderTopColor: c.inputBorder,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: SIZES.sm,
  },
  actionBtnText: { fontSize: SIZES.fontSm, fontWeight: "700" },
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
  sprintDetailMeta: {
    backgroundColor: c.background,
    borderWidth: 1,
    borderColor: c.inputBorder,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    gap: 4,
    marginBottom: SIZES.md,
  },
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SIZES.sm,
  },
  metricCard: {
    width: "48%",
    backgroundColor: c.backgroundSecondary,
    borderWidth: 1,
    borderColor: c.inputBorder,
    borderRadius: SIZES.radiusSm,
    padding: SIZES.sm,
  },
  metricLabel: {
    color: c.textSecondary,
    fontSize: SIZES.fontXs,
    marginBottom: 2,
  },
  metricValue: {
    color: c.text,
    fontSize: SIZES.fontSm,
    fontWeight: "700",
  },
  objectiveBox: {
    marginTop: SIZES.md,
    borderTopWidth: 1,
    borderTopColor: c.inputBorder,
    paddingTop: SIZES.md,
  },
  objectiveTitle: {
    color: c.text,
    fontSize: SIZES.fontSm,
    fontWeight: "700",
    marginBottom: 2,
  },
  objectiveText: {
    color: c.textSecondary,
    fontSize: SIZES.fontSm,
  },
  sprintDetailText: { color: c.textSecondary, fontSize: SIZES.fontSm },
  detailList: { maxHeight: 320 },
  detailStoryCard: {
    backgroundColor: c.background,
    borderWidth: 1,
    borderColor: c.inputBorder,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    marginBottom: SIZES.sm,
  },
  detailStoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SIZES.sm,
    marginBottom: SIZES.sm,
  },
  detailStoryRef: {
    color: c.textSecondary,
    fontSize: SIZES.fontXs,
    fontWeight: "700",
  },
  storyBadge: {
    borderWidth: 1,
    borderRadius: SIZES.radiusSm,
    paddingHorizontal: SIZES.sm,
    paddingVertical: 2,
  },
  storyBadgeText: {
    fontSize: SIZES.fontXs,
    fontWeight: "700",
  },
  detailStoryTitle: {
    color: c.text,
    fontSize: SIZES.fontSm,
    fontWeight: "700",
    marginBottom: 4,
  },
  detailStoryDesc: {
    color: c.textSecondary,
    fontSize: SIZES.fontXs,
    marginBottom: 4,
  },
  detailStoryMeta: {
    color: c.textSecondary,
    fontSize: SIZES.fontXs,
  },
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
    backgroundColor: c.primary,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    alignItems: "center",
    marginTop: SIZES.sm,
  },
  submitBtnText: {
    color: c.white,
    fontSize: SIZES.fontBase,
    fontWeight: "700",
  },
});
}

export default function SprintsScreen() {
  const c = useThemePalette();
  const styles = useMemo(() => createStyles(c), [c]);

  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const isScrumMaster = user?.role === "Scrum Master";

  const [projects, setProjects] = useState<ProjetResponse[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjetResponse | null>(
    null,
  );
  const [sprints, setSprints] = useState<SprintResponse[]>([]);
  const [selectedSprint, setSelectedSprint] = useState<SprintResponse | null>(
    null,
  );
  const [showSprintDetail, setShowSprintDetail] = useState(false);
  const [loadingSprintDetail, setLoadingSprintDetail] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingS, setLoadingS] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newNom, setNewNom] = useState("");
  const [newObjectif, setNewObjectif] = useState("");
  const [newDateDebut, setNewDateDebut] = useState("");
  const [newDateFin, setNewDateFin] = useState("");

  async function loadProjects() {
    try {
      const data = asArray<ProjetResponse>(await projectsService.getMember());
      setProjects(data);
      if (data && data.length > 0) {
        setSelectedProject(data[0]);
        await loadSprintsFor(data[0].id);
      }
    } catch (e: any) {
      Alert.alert("Erreur", e.message);
    } finally {
      setLoadingProjects(false);
      setRefreshing(false);
    }
  }

  async function loadSprintsFor(projectId: number) {
    setLoadingS(true);
    try {
      const data = asArray<SprintResponse>(
        await sprintsService.getAll(projectId),
      );
      setSprints(data);
    } catch {
      setSprints([]);
    } finally {
      setLoadingS(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  async function selectProject(proj: ProjetResponse) {
    setSelectedProject(proj);
    setSelectedSprint(null);
    setShowSprintDetail(false);
    await loadSprintsFor(proj.id);
  }

  async function openSprintDetail(sprint: SprintResponse) {
    if (!selectedProject) return;
    setSelectedSprint(sprint);
    setShowSprintDetail(true);
    setLoadingSprintDetail(true);
    try {
      const detail = await sprintsService.getById(
        selectedProject.id,
        sprint.id,
      );
      setSelectedSprint(detail);
    } catch (e: any) {
      Alert.alert("Erreur", e.message);
      setShowSprintDetail(false);
    } finally {
      setLoadingSprintDetail(false);
    }
  }

  async function handleStartSprint(sprint: SprintResponse) {
    if (!selectedProject) return;
    try {
      const updated = await sprintsService.start(selectedProject.id, sprint.id);
      setSprints((prev) => prev.map((s) => (s.id === sprint.id ? updated : s)));
    } catch (e: any) {
      Alert.alert("Erreur", e.message);
    }
  }

  async function handleCloseSprint(sprint: SprintResponse) {
    if (!selectedProject) return;
    Alert.alert("Clôturer", `Clôturer "${sprint.nom}" ?`, [
      { text: "Annuler", style: "cancel" },
      {
        text: "Clôturer",
        onPress: async () => {
          try {
            const updated = await sprintsService.close(
              selectedProject.id,
              sprint.id,
            );
            setSprints((prev) =>
              prev.map((s) => (s.id === sprint.id ? updated : s)),
            );
          } catch (e: any) {
            Alert.alert("Erreur", e.message);
          }
        },
      },
    ]);
  }

  async function handleCreate() {
    if (!selectedProject || !newNom.trim() || !newDateDebut || !newDateFin) {
      Alert.alert("Validation", "Remplissez le nom et les dates");
      return;
    }
    setCreating(true);
    try {
      const sprint = await sprintsService.create(selectedProject.id, {
        nom: newNom.trim(),
        objectif: newObjectif.trim() || undefined,
        date_debut: newDateDebut,
        date_fin: newDateFin,
      });
      setSprints((prev) => [sprint, ...prev]);
      setShowCreate(false);
      setNewNom("");
      setNewObjectif("");
      setNewDateDebut("");
      setNewDateFin("");
    } catch (e: any) {
      Alert.alert("Erreur", e.message);
    } finally {
      setCreating(false);
    }
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
            <Text style={styles.pageTitle}>Sprints</Text>
            <Text style={styles.pageSubtitle}>{sprints.length} sprint(s)</Text>
          </View>
          {isScrumMaster && selectedProject && (
            <TouchableOpacity
              style={styles.createBtn}
              onPress={() => setShowCreate(true)}
            >
              <Ionicons name="add" size={20} color={c.white} />
              <Text style={styles.createBtnText}>Nouveau</Text>
            </TouchableOpacity>
          )}
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

            {loadingS ? (
              <ActivityIndicator
                color={c.primary}
                style={{ marginTop: SIZES.xl }}
              />
            ) : sprints.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Ionicons
                  name="flash-outline"
                  size={48}
                  color={c.textSecondary}
                />
                <Text style={styles.emptyText}>Aucun sprint</Text>
              </View>
            ) : (
              sprints.map((sprint) => {
                const sm = STATUS_META[sprint.statut] ?? {
                  label: sprint.statut,
                  color: c.textSecondary,
                  icon: "time-outline" as const,
                };
                return (
                  <TouchableOpacity
                    key={sprint.id}
                    style={[
                      styles.sprintCard,
                      sprint.statut === "EN_COURS" && styles.sprintCardActive,
                    ]}
                    activeOpacity={0.9}
                    onPress={() => openSprintDetail(sprint)}
                  >
                    <View style={styles.sprintHeader}>
                      <View
                        style={[
                          styles.statusIcon,
                          { backgroundColor: `${sm.color}22` },
                        ]}
                      >
                        <Ionicons name={sm.icon} size={16} color={sm.color} />
                      </View>
                      <View style={styles.sprintTitleWrap}>
                        <Text style={styles.sprintName}>{sprint.nom}</Text>
                        {sprint.objectif ? (
                          <Text style={styles.sprintObjectif}>
                            {sprint.objectif}
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

                    <View style={styles.metaRow}>
                      {sprint.date_debut && (
                        <View style={styles.metaItem}>
                          <Ionicons
                            name="calendar-outline"
                            size={12}
                            color={c.textSecondary}
                          />
                          <Text style={styles.metaText}>
                            {sprint.date_debut} → {sprint.date_fin}
                          </Text>
                        </View>
                      )}
                      <View style={styles.metaItem}>
                        <Ionicons
                          name="document-text-outline"
                          size={12}
                          color={c.textSecondary}
                        />
                        <Text style={styles.metaText}>
                          {sprint.nb_user_stories ?? 0} stories
                        </Text>
                      </View>
                    </View>

                    {isScrumMaster && (
                      <View style={styles.actionsRow}>
                        {sprint.statut === "PLANIFIE" && (
                          <TouchableOpacity
                            style={styles.actionBtn}
                            onPress={() => handleStartSprint(sprint)}
                          >
                            <Ionicons name="play" size={14} color="#22c55e" />
                            <Text
                              style={[
                                styles.actionBtnText,
                                { color: "#22c55e" },
                              ]}
                            >
                              Démarrer
                            </Text>
                          </TouchableOpacity>
                        )}
                        {sprint.statut === "EN_COURS" && (
                          <TouchableOpacity
                            style={styles.actionBtn}
                            onPress={() => handleCloseSprint(sprint)}
                          >
                            <Ionicons name="stop" size={14} color="#ef4444" />
                            <Text
                              style={[
                                styles.actionBtnText,
                                { color: "#ef4444" },
                              ]}
                            >
                              Clôturer
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                    <Text style={styles.cardHint}>
                      Appuyez pour voir les user stories
                    </Text>
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
              <Text style={styles.modalTitle}>Nouveau sprint</Text>
              <TouchableOpacity onPress={() => setShowCreate(false)}>
                <Ionicons name="close" size={24} color={c.textSecondary} />
              </TouchableOpacity>
            </View>
            {[
              {
                label: "Nom du sprint *",
                value: newNom,
                setter: setNewNom,
                placeholder: "Sprint 1",
              },
              {
                label: "Objectif",
                value: newObjectif,
                setter: setNewObjectif,
                placeholder: "Objectif du sprint...",
              },
              {
                label: "Date début * (AAAA-MM-JJ)",
                value: newDateDebut,
                setter: setNewDateDebut,
                placeholder: "2024-01-01",
              },
              {
                label: "Date fin * (AAAA-MM-JJ)",
                value: newDateFin,
                setter: setNewDateFin,
                placeholder: "2024-01-14",
              },
            ].map((field) => (
              <View key={field.label}>
                <Text style={styles.inputLabel}>{field.label}</Text>
                <TextInput
                  style={styles.input}
                  value={field.value}
                  onChangeText={field.setter}
                  placeholder={field.placeholder}
                  placeholderTextColor={c.textSecondary}
                />
              </View>
            ))}
            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleCreate}
              disabled={creating}
            >
              {creating ? (
                <ActivityIndicator color={c.white} size="small" />
              ) : (
                <Text style={styles.submitBtnText}>Créer le sprint</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showSprintDetail} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>
                  {selectedSprint?.nom ?? "Sprint"}
                </Text>
                <Text style={styles.modalSubtitle}>
                  User stories liées au sprint
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowSprintDetail(false)}>
                <Ionicons name="close" size={24} color={c.textSecondary} />
              </TouchableOpacity>
            </View>

            {loadingSprintDetail ? (
              <ActivityIndicator
                color={c.primary}
                style={{ marginVertical: SIZES.xl }}
              />
            ) : (
              <>
                <View style={styles.sprintDetailMeta}>
                  <View style={styles.metricGrid}>
                    <View style={styles.metricCard}>
                      <Text style={styles.metricLabel}>Statut</Text>
                      <Text style={styles.metricValue}>
                        {(STATUS_META[selectedSprint?.statut ?? ""]?.label ??
                          selectedSprint?.statut ??
                          "-")}
                      </Text>
                    </View>
                    <View style={styles.metricCard}>
                      <Text style={styles.metricLabel}>Stories</Text>
                      <Text style={styles.metricValue}>
                        {selectedSprint?.user_stories?.length ??
                          selectedSprint?.nb_user_stories ??
                          0}
                      </Text>
                    </View>
                    <View style={styles.metricCard}>
                      <Text style={styles.metricLabel}>Début</Text>
                      <Text style={styles.metricValue}>
                        {formatDate(selectedSprint?.date_debut)}
                      </Text>
                    </View>
                    <View style={styles.metricCard}>
                      <Text style={styles.metricLabel}>Fin</Text>
                      <Text style={styles.metricValue}>
                        {formatDate(selectedSprint?.date_fin)}
                      </Text>
                    </View>
                  </View>
                  {selectedSprint?.objectif ? (
                    <View style={styles.objectiveBox}>
                      <Text style={styles.objectiveTitle}>Objectif sprint</Text>
                      <Text style={styles.objectiveText}>
                        {selectedSprint.objectif}
                      </Text>
                    </View>
                  ) : null}
                </View>

                {(selectedSprint?.user_stories ?? []).length === 0 ? (
                  <View style={styles.emptyWrap}>
                    <Text style={styles.emptyText}>
                      Aucune user story liée à ce sprint
                    </Text>
                  </View>
                ) : (
                  <ScrollView
                    style={styles.detailList}
                    showsVerticalScrollIndicator={false}
                  >
                    {(selectedSprint?.user_stories ?? []).map((story) => (
                      <View key={story.id} style={styles.detailStoryCard}>
                        <View style={styles.detailStoryHeader}>
                          <Text style={styles.detailStoryRef}>#{story.id}</Text>
                          <View
                            style={[
                              styles.storyBadge,
                              {
                                backgroundColor: `${(STORY_STATUS_META[story.statut]?.color ?? "#9ca3af")}22`,
                                borderColor: `${(STORY_STATUS_META[story.statut]?.color ?? "#9ca3af")}44`,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.storyBadgeText,
                                {
                                  color:
                                    STORY_STATUS_META[story.statut]?.color ??
                                    "#9ca3af",
                                },
                              ]}
                            >
                              {STORY_STATUS_META[story.statut]?.label ??
                                story.statut}
                            </Text>
                          </View>
                          {story.priorite && (
                            <View
                              style={[
                                styles.storyBadge,
                                {
                                  backgroundColor: `${(STORY_PRIORITY_META[story.priorite]?.color ?? "#9ca3af")}22`,
                                  borderColor: `${(STORY_PRIORITY_META[story.priorite]?.color ?? "#9ca3af")}44`,
                                },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.storyBadgeText,
                                  {
                                    color:
                                      STORY_PRIORITY_META[story.priorite]
                                        ?.color ?? "#9ca3af",
                                  },
                                ]}
                              >
                                {STORY_PRIORITY_META[story.priorite]?.label ??
                                  story.priorite}
                              </Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.detailStoryTitle}>{story.titre}</Text>
                        {story.description ? (
                          <Text style={styles.detailStoryDesc}>
                            {story.description}
                          </Text>
                        ) : null}
                        <Text style={styles.detailStoryMeta}>
                          {story.points !== undefined
                            ? `${story.points} points`
                            : "Sans estimation"}
                        </Text>
                        {story.assignee || story.assignee_id ? (
                          <Text style={styles.detailStoryMeta}>
                            Assignée à {story.assignee?.nom ?? `Dev #${story.assignee_id}`}
                          </Text>
                        ) : null}
                      </View>
                    ))}
                  </ScrollView>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}


