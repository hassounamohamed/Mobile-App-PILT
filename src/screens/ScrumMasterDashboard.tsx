import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, RefreshControl, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SIZES } from "@/constants";
import { useThemePalette } from "@/hooks/useThemePalette";
import { projectsService } from "@/services/projects";
import { sprintsService } from "@/services/sprints";
import type { ProjetResponse, SprintResponse } from "@/types/api";
import { useDashboardStyles } from "@/components/dashboardStyles";
import { StatItem } from "@/utils/DashboardUtils";
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

export default function ScrumMasterDashboard() {
  const styles = useDashboardStyles();
  const c = useThemePalette();
  const insets = useSafeAreaInsets();
  const [projects, setProjects] = useState<ProjetResponse[]>([]);
  const [activeSprint, setActiveSprint] = useState<SprintResponse | null>(null);
  const { enabled, unreadCount } = useNotificationRealtime();
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    try {
      const projs = await projectsService.getMember();
      const safeProjects = projs ?? [];
      setProjects(safeProjects);

      if (safeProjects.length === 0) {
        setActiveSprint(null);
        return;
      }

      const activeSprints = await Promise.allSettled(
        safeProjects.map((project) => sprintsService.getActive(project.id)),
      );
      const firstActive = activeSprints.find(
        (result): result is PromiseFulfilledResult<SprintResponse | null> =>
          result.status === "fulfilled" && !!result.value,
      );
      setActiveSprint(firstActive?.value ?? null);
    } catch (e: any) {
      Alert.alert(
        "Erreur",
        e?.message ?? "Impossible de charger le tableau de bord",
      );
      setProjects([]);
      setActiveSprint(null);
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
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: SIZES.lg }}>
        <View>
          <Text style={{ color: c.text, fontSize: SIZES.fontXl, fontWeight: "800" }}>
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
      {activeSprint && (
        <SectionCard title="Current Sprint">
          <View style={styles.sprintCard}>
            <Text style={styles.sprintName}>{activeSprint.nom}</Text>
            {activeSprint.objectif ? (
              <Text style={styles.sprintObjectif}>{activeSprint.objectif}</Text>
            ) : null}
            <View style={styles.sprintMeta}>
              <Text style={styles.sprintDate}>
                {activeSprint.date_debut} → {activeSprint.date_fin}
              </Text>
              <StatusBadge label={activeSprint.statut} color="#f59e0b" />
            </View>
          </View>
        </SectionCard>
      )}
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
