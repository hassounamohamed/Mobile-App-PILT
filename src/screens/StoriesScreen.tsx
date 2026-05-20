import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useEffect, useState } from "react";
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
import { useAuthStore } from "@/context/authStore";
import { projectsService } from "@/services/projects";
import { storiesService } from "@/services/stories";
import { ProjetResponse, UserStoryResponse } from "@/types/api";

const PRIORITY_META: Record<string, { color: string; label: string }> = {
  CRITIQUE: { color: "#ef4444", label: "Critique" },
  HAUTE: { color: "#f59e0b", label: "Haute" },
  MOYENNE: { color: "#3b82f6", label: "Moyenne" },
  BASSE: { color: "#22c55e", label: "Basse" },
};

const STORY_FILTERS: {
  value: "all" | "mine";
  label: string;
}[] = [
  { value: "mine", label: "Mes stories" },
  { value: "all", label: "Toutes" },
];

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
  pageTitle: {
    color: c.text,
    fontSize: SIZES.font2xl,
    fontWeight: "800",
    marginBottom: SIZES.lg,
  },
  pageSubtitle: {
    color: c.textSecondary,
    fontSize: SIZES.fontSm,
    marginTop: -SIZES.md,
    marginBottom: SIZES.md,
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

  toggleRow: {
    flexDirection: "row",
    backgroundColor: c.backgroundSecondary,
    borderRadius: SIZES.radiusLg,
    borderWidth: 1,
    borderColor: c.inputBorder,
    padding: 4,
    marginBottom: SIZES.sm,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radiusMd,
    alignItems: "center",
  },
  toggleBtnActive: { backgroundColor: c.primary },
  toggleBtnText: {
    color: c.textSecondary,
    fontSize: SIZES.fontSm,
    fontWeight: "600",
  },
  toggleBtnTextActive: { color: c.white },

  countText: {
    color: c.textSecondary,
    fontSize: SIZES.fontXs,
    marginBottom: SIZES.md,
  },
  emptyWrap: { alignItems: "center", paddingTop: SIZES.xxl, gap: SIZES.md },
  emptyText: { color: c.textSecondary, fontSize: SIZES.fontBase },

  storyCard: {
    backgroundColor: c.backgroundSecondary,
    borderRadius: SIZES.radiusLg,
    borderWidth: 1,
    borderColor: c.inputBorder,
    padding: SIZES.md,
    marginBottom: SIZES.sm,
  },
  storyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SIZES.sm,
    marginBottom: SIZES.sm,
  },
  priorityDot: { width: 10, height: 10, borderRadius: 5 },
  storyTitle: {
    flex: 1,
    color: c.text,
    fontSize: SIZES.fontSm,
    fontWeight: "600",
  },
  pointsBadge: {
    backgroundColor: `${c.primary}22`,
    paddingHorizontal: SIZES.sm,
    paddingVertical: 2,
    borderRadius: SIZES.radiusSm,
  },
  pointsText: {
    color: c.primary,
    fontSize: SIZES.fontXs,
    fontWeight: "700",
  },
  storyMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SIZES.sm,
    marginBottom: SIZES.sm,
  },
  statusBadge: {
    paddingHorizontal: SIZES.sm,
    paddingVertical: 4,
    borderRadius: SIZES.radiusSm,
    borderWidth: 1,
  },
  statusBadgeText: { fontSize: SIZES.fontXs, fontWeight: "700" },
  priorityBadge: {
    paddingHorizontal: SIZES.sm,
    paddingVertical: 4,
    borderRadius: SIZES.radiusSm,
    borderWidth: 1,
  },
  priorityBadgeText: { fontSize: SIZES.fontXs, fontWeight: "700" },
  storyDesc: {
    color: c.textSecondary,
    fontSize: SIZES.fontXs,
    marginBottom: SIZES.sm,
  },
  assigneeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: SIZES.sm,
  },
  assigneeText: { color: c.textSecondary, fontSize: SIZES.fontXs },
});
}

export default function StoriesScreen() {
  const c = useThemePalette();
  const styles = useMemo(() => createStyles(c), [c]);

  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const userId = parseInt(user?.id ?? "0");
  const isDeveloper = user?.role === "Développeur";

  const [projects, setProjects] = useState<ProjetResponse[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjetResponse | null>(
    null,
  );
  const [stories, setStories] = useState<UserStoryResponse[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingStories, setLoadingStories] = useState(false);
  const [storyFilter, setStoryFilter] = useState<"all" | "mine">(
    isDeveloper ? "mine" : "all",
  );

  async function loadProjects() {
    try {
      const data = asArray<ProjetResponse>(await projectsService.getMember());
      setProjects(data);
      if (data.length > 0) {
        await selectProject(data[0]);
      } else {
        setSelectedProject(null);
        setStories([]);
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
    setLoadingStories(true);
    try {
      const backlog = await storiesService.getBacklog(proj.id);
      setStories(asArray<UserStoryResponse>(backlog));
    } catch (e: any) {
      Alert.alert("Erreur", e.message);
      setStories([]);
    } finally {
      setLoadingStories(false);
    }
  }

  const displayed =
    storyFilter === "mine"
      ? stories.filter((s) => (s.assignee_id ?? s.assignee?.id) === userId)
      : stories;

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
        <Text style={styles.pageTitle}>User Stories</Text>
        <Text style={styles.pageSubtitle}>
          {selectedProject ? selectedProject.nom : "Aucun projet sélectionné"}
        </Text>

        <View style={styles.toggleRow}>
          {STORY_FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter.value}
              style={[
                styles.toggleBtn,
                storyFilter === filter.value && styles.toggleBtnActive,
              ]}
              onPress={() => setStoryFilter(filter.value)}
            >
              <Text
                style={[
                  styles.toggleBtnText,
                  storyFilter === filter.value && styles.toggleBtnTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
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

            <Text style={styles.countText}>
              User Stories ({displayed.length})
            </Text>

            {loadingStories ? (
              <ActivityIndicator
                color={c.primary}
                style={{ marginTop: SIZES.xl }}
              />
            ) : displayed.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Ionicons
                  name="document-text-outline"
                  size={48}
                  color={c.textSecondary}
                />
                <Text style={styles.emptyText}>
                  {storyFilter === "mine"
                    ? "Aucune story assignée"
                    : "Aucune story"}
                </Text>
              </View>
            ) : (
              displayed.map((story) => {
                const pm = PRIORITY_META[story.priorite] ?? {
                  color: c.textSecondary,
                  label: story.priorite,
                };
                const statusColor =
                  story.statut === "EN_COURS"
                    ? "#f59e0b"
                    : story.statut === "A_TESTER"
                      ? "#06b6d4"
                      : story.statut === "TERMINE"
                        ? "#22c55e"
                        : "#9ca3af";

                return (
                  <View key={story.id} style={styles.storyCard}>
                    <View style={styles.storyHeader}>
                      <View
                        style={[
                          styles.priorityDot,
                          { backgroundColor: pm.color },
                        ]}
                      />
                      <Text style={styles.storyTitle}>{story.titre}</Text>
                      {story.points !== undefined && (
                        <View style={styles.pointsBadge}>
                          <Text style={styles.pointsText}>{story.points}</Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.storyMetaRow}>
                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor: `${statusColor}22`,
                            borderColor: `${statusColor}44`,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusBadgeText,
                            { color: statusColor },
                          ]}
                        >
                          {story.statut.replace("_", " ")}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.priorityBadge,
                          {
                            backgroundColor: `${pm.color}22`,
                            borderColor: `${pm.color}44`,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.priorityBadgeText,
                            { color: pm.color },
                          ]}
                        >
                          {pm.label}
                        </Text>
                      </View>
                    </View>

                    {story.description && (
                      <Text style={styles.storyDesc} numberOfLines={2}>
                        {story.description}
                      </Text>
                    )}

                    {story.assignee || story.assignee_id ? (
                      <View style={styles.assigneeRow}>
                        <Ionicons
                          name="person-outline"
                          size={12}
                          color={c.textSecondary}
                        />
                        <Text style={styles.assigneeText}>
                          {story.assignee?.nom ?? `Dev #${story.assignee_id}`}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                );
              })
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}


