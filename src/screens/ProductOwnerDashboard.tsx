import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, RefreshControl, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SIZES } from "@/constants";
import { useThemePalette } from "@/hooks/useThemePalette";
import { projectsService } from "@/services/projects";
import { storiesService } from "@/services/stories";
import type { ProjetResponse, UserStoryResponse } from "@/types/api";
import { useDashboardStyles } from "@/components/dashboardStyles";
import { StatItem, asArray } from "@/utils/DashboardUtils";
import {
  HeroCard,
  SectionCard,
  StatCard,
  StatusBadge,
  EmptyState,
  NotificationBell,
} from "@/components/DashboardSharedComponents";
import { useNotificationRealtime } from "@/hooks/use-notification-realtime";
import { NotificationsModal } from "@/components/NotificationsModal";

export default function ProductOwnerDashboard() {
  const styles = useDashboardStyles();
  const c = useThemePalette();
  const insets = useSafeAreaInsets();
  const { enabled, unreadCount } = useNotificationRealtime();
  const [showNotifications, setShowNotifications] = useState(false);
  const [projects, setProjects] = useState<ProjetResponse[]>([]);
  const [projectStats, setProjectStats] = useState<
    Record<number, { nb_modules: number; nb_sprints: number }>
  >({});
  const [storiesCount, setStoriesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    try {
      const data = await projectsService.getMine();
      const safeProjects = data ?? [];
      setProjects(safeProjects);

      const statsEntries = await Promise.allSettled(
        safeProjects.map(async (project) => {
          const [stats, backlog] = await Promise.all([
            projectsService.getStats(project.id),
            storiesService.getBacklog(project.id),
          ]);
          return {
            projectId: project.id,
            nb_modules: stats.nb_modules ?? 0,
            nb_sprints: stats.nb_sprints ?? 0,
            stories: asArray<UserStoryResponse>(backlog).length,
          };
        }),
      );

      const nextStats: Record<
        number,
        { nb_modules: number; nb_sprints: number }
      > = {};
      let totalStories = 0;
      for (const result of statsEntries) {
        if (result.status === "fulfilled") {
          nextStats[result.value.projectId] = {
            nb_modules: result.value.nb_modules,
            nb_sprints: result.value.nb_sprints,
          };
          totalStories += result.value.stories;
        }
      }

      setProjectStats(nextStats);
      setStoriesCount(totalStories);
    } catch {
      setProjects([]);
      setProjectStats({});
      setStoriesCount(0);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const statItems: StatItem[] = [
    {
      label: "Projets",
      value: String(projects.length),
      icon: "folder",
      tone: c.primary,
    },
    {
      label: "Projets actifs",
      value: String(projects.filter((p) => p.statut === "ACTIF").length),
      icon: "flash",
      tone: "#22c55e",
    },
    {
      label: "User Stories",
      value: String(storiesCount),
      icon: "document-text",
      tone: "#a855f7",
    },
  ];

  return (
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
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: SIZES.lg,
        }}
      >
        <View>
          <Text style={{ color: c.text, fontSize: SIZES.fontXl, fontWeight: "800" }}>
            Product Owner
          </Text>
          <Text style={{ color: c.textSecondary, fontSize: SIZES.fontSm }}>
            Dashboard
          </Text>
        </View>
        <NotificationBell
          enabled={enabled}
          unreadCount={unreadCount}
          onPress={() =>
            enabled
              ? setShowNotifications(true)
              : Alert.alert("Notifications", "Notifications desactivees")
          }
        />
      </View>
      <HeroCard
        eyebrow="Product Owner"
        title="Tableau de bord produit"
        subtitle="Gérez vos projets, epics et user stories."
      />
      {loading ? (
        <ActivityIndicator
          color={c.primary}
          style={{ marginVertical: SIZES.xl }}
        />
      ) : (
        <View style={styles.grid}>
          {statItems.map((item) => (
            <StatCard key={item.label} item={item} />
          ))}
        </View>
      )}
      <SectionCard title="Mes projets récents">
        {projects.length === 0 ? (
          <EmptyState message="No projects found. Create your first project." />
        ) : (
          projects.slice(0, 5).map((p) => (
            <View key={p.id} style={styles.projectRow}>
              <View style={styles.projectInfo}>
                <Text style={styles.projectName}>{p.nom}</Text>
                <Text style={styles.projectDetail}>
                  {projectStats[p.id]?.nb_modules ?? 0} modules ·{" "}
                  {projectStats[p.id]?.nb_sprints ?? 0} sprints
                </Text>
              </View>
              <StatusBadge
                label={p.statut}
                color={
                  p.statut === "ACTIF"
                    ? "#22c55e"
                    : p.statut === "TERMINE"
                      ? "#3b82f6"
                      : "#9ca3af"
                }
              />
            </View>
          ))
        )}
      </SectionCard>
      <NotificationsModal
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </ScrollView>
  );
}
