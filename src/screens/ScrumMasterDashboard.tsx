import {
    EmptyState,
    HeroCard,
    NotificationBell,
    SectionCard,
    StatCard,
    StatusBadge,
} from "@/components/DashboardSharedComponents";
import { useDashboardStyles } from "@/components/dashboardStyles";
import { NotificationsModal } from "@/components/NotificationsModal";
import { SIZES } from "@/constants";
import { useNotificationRealtime } from "@/hooks/use-notification-realtime";
import { useThemePalette } from "@/hooks/useThemePalette";
import { projectsService } from "@/services/projects";
import { sprintsService } from "@/services/sprints";
import { storiesService } from "@/services/stories";
import type {
    BacklogIndicateurs,
    ProjetResponse,
    SprintResponse,
} from "@/types/api";
import { StatItem } from "@/utils/DashboardUtils";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ScrumMasterDashboard() {
  const styles = useDashboardStyles();
  const c = useThemePalette();
  const insets = useSafeAreaInsets();
  const [projects, setProjects] = useState<ProjetResponse[]>([]);
  const [activeSprint, setActiveSprint] = useState<SprintResponse | null>(null);
  const [backlogIndicators, setBacklogIndicators] =
    useState<BacklogIndicateurs | null>(null);
  const { enabled, unreadCount } = useNotificationRealtime();
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  function aggregateBacklogIndicators(indicators: BacklogIndicateurs[]) {
    return indicators.reduce<BacklogIndicateurs>(
      (accumulator, current) => ({
        projet_id: 0,
        total_stories: accumulator.total_stories + (current.total_stories ?? 0),
        total_points: accumulator.total_points + (current.total_points ?? 0),
        points_done: accumulator.points_done + (current.points_done ?? 0),
        par_statut: Object.entries(current.par_statut ?? {}).reduce(
          (statusAccumulator, [status, detail]) => ({
            ...statusAccumulator,
            [status]: {
              nb: (statusAccumulator[status]?.nb ?? 0) + (detail.nb ?? 0),
              points:
                (statusAccumulator[status]?.points ?? 0) + (detail.points ?? 0),
            },
          }),
          { ...accumulator.par_statut },
        ),
        par_epic: [...accumulator.par_epic, ...(current.par_epic ?? [])],
      }),
      {
        projet_id: 0,
        total_stories: 0,
        total_points: 0,
        points_done: 0,
        par_statut: {},
        par_epic: [],
      },
    );
  }

  async function load() {
    try {
      const projs = await projectsService.getMember();
      const safeProjects = projs ?? [];
      setProjects(safeProjects);

      if (safeProjects.length === 0) {
        setActiveSprint(null);
        setBacklogIndicators(null);
        return;
      }

      const [activeSprints, backlogResults] = await Promise.all([
        Promise.allSettled(
          safeProjects.map((project) => sprintsService.getActive(project.id)),
        ),
        Promise.allSettled(
          safeProjects.map((project) =>
            storiesService.getBacklogIndicateurs(project.id),
          ),
        ),
      ]);
      const firstActive = activeSprints.find(
        (result): result is PromiseFulfilledResult<SprintResponse | null> =>
          result.status === "fulfilled" && !!result.value,
      );
      setActiveSprint(firstActive?.value ?? null);

      const fulfilledIndicators = backlogResults
        .filter(
          (result): result is PromiseFulfilledResult<BacklogIndicateurs> =>
            result.status === "fulfilled",
        )
        .map((result) => result.value);
      setBacklogIndicators(
        fulfilledIndicators.length > 0
          ? aggregateBacklogIndicators(fulfilledIndicators)
          : null,
      );
    } catch (e: any) {
      Alert.alert(
        "Erreur",
        e?.message ?? "Impossible de charger le tableau de bord",
      );
      setProjects([]);
      setActiveSprint(null);
      setBacklogIndicators(null);
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
      label: "Sprint actif",
      value: activeSprint ? "1" : "0",
      icon: "flash",
      tone: "#f59e0b",
    },
    {
      label: "Stories sprint",
      value: String(activeSprint?.nb_user_stories ?? 0),
      icon: "document-text",
      tone: "#22c55e",
    },
  ];

  const backlogStatItems: StatItem[] = [
    {
      label: "Stories backlog",
      value: String(backlogIndicators?.total_stories ?? 0),
      icon: "layers",
      tone: c.primary,
    },
    {
      label: "Points totaux",
      value: String(backlogIndicators?.total_points ?? 0),
      icon: "stats-chart",
      tone: "#06b6d4",
    },
    {
      label: "Points done",
      value: String(backlogIndicators?.points_done ?? 0),
      icon: "checkmark-done-circle",
      tone: "#22c55e",
    },
    {
      label: "À faire",
      value: String(backlogIndicators?.par_statut?.to_do?.nb ?? 0),
      icon: "ellipse-outline",
      tone: "#9ca3af",
    },
    {
      label: "En cours",
      value: String(backlogIndicators?.par_statut?.in_progress?.nb ?? 0),
      icon: "time-outline",
      tone: "#f59e0b",
    },
    {
      label: "Done",
      value: String(backlogIndicators?.par_statut?.done?.nb ?? 0),
      icon: "checkmark-circle",
      tone: "#22c55e",
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
          <Text
            style={{ color: c.text, fontSize: SIZES.fontXl, fontWeight: "800" }}
          >
            Scrum Master
          </Text>
          <Text style={{ color: c.textSecondary, fontSize: SIZES.fontSm }}>
            Sprint Dashboard
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
        eyebrow="Scrum Master"
        title="Sprint Dashboard"
        subtitle="Manage sprints, backlog, and team velocity."
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
      <SectionCard title="Indicateurs backlog">
        {backlogIndicators ? (
          <View style={styles.grid}>
            {backlogStatItems.map((item) => (
              <StatCard key={item.label} item={item} />
            ))}
          </View>
        ) : (
          <EmptyState message="Aucun indicateur backlog disponible" />
        )}
      </SectionCard>
      <SectionCard title="Projets">
        {projects.length === 0 ? (
          <EmptyState message="No assigned projects" />
        ) : (
          projects.slice(0, 4).map((p) => (
            <View key={p.id} style={styles.projectRow}>
              <View style={styles.projectInfo}>
                <Text style={styles.projectName}>{p.nom}</Text>
                <Text style={styles.projectDetail}>
                  {p.membres?.length ?? 0} membres
                </Text>
              </View>
              <StatusBadge
                label={p.statut}
                color={p.statut === "ACTIF" ? "#22c55e" : "#9ca3af"}
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
