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
import { projectsService } from "@/services/projects";
import { storiesService } from "@/services/stories";
import { ProjetResponse, UserStoryResponse } from "@/types/api";

const PRIORITY_META: Record<string, { color: string; icon: string }> = {
  CRITIQUE: { color: "#ef4444", icon: "🔴" },
  HAUTE:    { color: "#f59e0b", icon: "🟠" },
  MOYENNE:  { color: "#3b82f6", icon: "🔵" },
  BASSE:    { color: "#22c55e", icon: "🟢" },
};

const STATUS_META: Record<string, { label: string; color: string }> = {
  A_FAIRE:  { label: "À faire",  color: "#9ca3af" },
  EN_COURS: { label: "En cours", color: "#f59e0b" },
  A_TESTER: { label: "À tester", color: "#06b6d4" },
  TERMINE:  { label: "Terminé",  color: "#22c55e" },
};

function createStyles(c: ThemePalette) {
  return StyleSheet.create({
  root: { flex: 1, backgroundColor: c.background },
  pageTitle: { color: c.text, fontSize: SIZES.font2xl, fontWeight: "800", marginBottom: SIZES.lg },
  projectPicker: { marginBottom: SIZES.md },
  projectChip: {
    paddingHorizontal: SIZES.md, paddingVertical: SIZES.sm,
    borderRadius: SIZES.radiusSm, borderWidth: 1, borderColor: c.inputBorder,
    backgroundColor: c.backgroundSecondary, marginRight: SIZES.sm,
  },
  projectChipActive: { backgroundColor: c.primary, borderColor: c.primary },
  projectChipText: { color: c.textSecondary, fontSize: SIZES.fontSm, fontWeight: "600" },
  projectChipTextActive: { color: c.white },
  filterRow: { marginBottom: SIZES.sm },
  filterChip: {
    paddingHorizontal: SIZES.md, paddingVertical: 6,
    borderRadius: SIZES.radiusSm, marginRight: SIZES.sm,
    backgroundColor: c.backgroundSecondary,
  },
  filterChipActive: { backgroundColor: `${c.primary}33` },
  filterChipText: { color: c.textSecondary, fontSize: SIZES.fontXs, fontWeight: "600" },
  filterChipTextActive: { color: c.primary },
  countText: { color: c.textSecondary, fontSize: SIZES.fontXs, marginBottom: SIZES.md },
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
  storyHeader: { flexDirection: "row", alignItems: "flex-start", gap: SIZES.sm, marginBottom: SIZES.sm },
  priorityIcon: { fontSize: 14, marginTop: 2 },
  storyTitle: { flex: 1, color: c.text, fontSize: SIZES.fontSm, fontWeight: "600" },
  statusPill: { paddingHorizontal: SIZES.sm, paddingVertical: 2, borderRadius: SIZES.radiusSm },
  statusText: { fontSize: SIZES.fontXs, fontWeight: "700" },
  storyDesc: { color: c.textSecondary, fontSize: SIZES.fontXs, marginBottom: SIZES.sm },
  storyMeta: { flexDirection: "row", gap: SIZES.md },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { color: c.textSecondary, fontSize: SIZES.fontXs },
});
}

export default function BacklogScreen() {
  const c = useThemePalette();
  const styles = useMemo(() => createStyles(c), [c]);

  const insets = useSafeAreaInsets();
  const [projects, setProjects] = useState<ProjetResponse[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjetResponse | null>(null);
  const [stories, setStories] = useState<UserStoryResponse[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingStories, setLoadingStories] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState("Tous");

  async function loadProjects() {
    try {
      const [mine, member] = await Promise.allSettled([
        projectsService.getMine(),
        projectsService.getMember(),
      ]);
      const all: ProjetResponse[] = [];
      if (mine.status === "fulfilled") all.push(...(mine.value ?? []));
      if (member.status === "fulfilled") {
        for (const p of member.value ?? []) {
          if (!all.find((x) => x.id === p.id)) all.push(p);
        }
      }
      setProjects(all);
      if (all.length > 0) {
        setSelectedProject(all[0]);
        await loadStoriesFor(all[0].id);
      }
    } catch (e: any) {
      Alert.alert("Erreur", e.message);
    } finally {
      setLoadingProjects(false);
      setRefreshing(false);
    }
  }

  async function loadStoriesFor(projectId: number) {
    setLoadingStories(true);
    try {
      const data = await storiesService.getBacklog(projectId);
      setStories(data ?? []);
    } catch (e: any) {
      Alert.alert("Erreur", e.message);
    } finally {
      setLoadingStories(false);
    }
  }

  useEffect(() => { loadProjects(); }, []);

  async function selectProject(proj: ProjetResponse) {
    setSelectedProject(proj);
    await loadStoriesFor(proj.id);
  }

  const filters = ["Tous", "À faire", "En cours", "À tester", "Terminé"];

  const filtered = stories.filter((s) => {
    if (activeFilter === "Tous") return true;
    return STATUS_META[s.statut]?.label === activeFilter;
  });

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
            onRefresh={() => { setRefreshing(true); loadProjects(); }}
            tintColor={c.primary}
          />
        }
      >
        <Text style={styles.pageTitle}>Backlog</Text>

        {loadingProjects ? (
          <ActivityIndicator color={c.primary} style={{ marginTop: SIZES.xl }} />
        ) : projects.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>Aucun projet disponible</Text>
          </View>
        ) : (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.projectPicker}>
              {projects.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.projectChip, selectedProject?.id === p.id && styles.projectChipActive]}
                  onPress={() => selectProject(p)}
                >
                  <Text style={[styles.projectChipText, selectedProject?.id === p.id && styles.projectChipTextActive]}>
                    {p.nom}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
              {filters.map((f) => (
                <TouchableOpacity
                  key={f}
                  style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
                  onPress={() => setActiveFilter(f)}
                >
                  <Text style={[styles.filterChipText, activeFilter === f && styles.filterChipTextActive]}>{f}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.countText}>{filtered.length} user stor{filtered.length !== 1 ? "ies" : "y"}</Text>

            {loadingStories ? (
              <ActivityIndicator color={c.primary} style={{ marginTop: SIZES.xl }} />
            ) : filtered.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Ionicons name="list-outline" size={48} color={c.textSecondary} />
                <Text style={styles.emptyText}>Backlog vide</Text>
              </View>
            ) : (
              filtered.map((story) => {
                const pm = PRIORITY_META[story.priorite] ?? { color: c.textSecondary, icon: "⚪" };
                const sm = STATUS_META[story.statut] ?? { label: story.statut, color: c.textSecondary };
                return (
                  <View key={story.id} style={styles.storyCard}>
                    <View style={styles.storyHeader}>
                      <Text style={styles.priorityIcon}>{pm.icon}</Text>
                      <Text style={styles.storyTitle} numberOfLines={2}>{story.titre}</Text>
                      <View style={[styles.statusPill, { backgroundColor: `${sm.color}22` }]}>
                        <Text style={[styles.statusText, { color: sm.color }]}>{sm.label}</Text>
                      </View>
                    </View>
                    {story.description ? (
                      <Text style={styles.storyDesc} numberOfLines={2}>{story.description}</Text>
                    ) : null}
                    <View style={styles.storyMeta}>
                      {story.points !== undefined && (
                        <View style={styles.metaItem}>
                          <Ionicons name="diamond-outline" size={12} color={c.textSecondary} />
                          <Text style={styles.metaText}>{story.points} pts</Text>
                        </View>
                      )}
                      {story.assignee || story.assignee_id ? (
                        <View style={styles.metaItem}>
                          <Ionicons name="person-outline" size={12} color={c.textSecondary} />
                          <Text style={styles.metaText}>
                            {story.assignee?.nom ?? `Dev #${story.assignee_id}`}
                          </Text>
                        </View>
                      ) : null}
                    </View>
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


