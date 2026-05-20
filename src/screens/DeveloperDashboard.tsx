import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SIZES } from "@/constants";
import { useThemePalette } from "@/hooks/useThemePalette";
import { useAuthStore } from "@/context/authStore";
import { useNotificationSettingsStore } from "@/context/notificationSettingsStore";
import { notificationsService } from "@/services/notifications";
import { projectsService } from "@/services/projects";
import { sprintsService } from "@/services/sprints";
import { storiesService } from "@/services/stories";
import { cahierTestsService } from "@/services/tests";
import { usersService } from "@/services/users";
import type { NotificationResponse, UserStoryResponse } from "@/types/api";
import type { DeveloperTabParamList } from "@/navigation/types";
import { useDashboardStyles } from "@/components/dashboardStyles";
import {
  StatItem,
  DeveloperTask,
  RecentChange,
  STATUS_ORDER,
  PRIORITY_ORDER,
  toTaskStatus,
  formatStatusLabel,
  formatPriorityLabel,
  timeAgo,
  getNotificationIcon,
  asArray,
} from "@/utils/DashboardUtils";
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

export default function DeveloperDashboard() {
  const styles = useDashboardStyles();
  const c = useThemePalette();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<BottomTabNavigationProp<DeveloperTabParamList>>();
  const { user } = useAuthStore();
  const notificationsEnabled = useNotificationSettingsStore((s) => s.enabled);
  const { unreadCount } = useNotificationRealtime();
  const [showNotifications, setShowNotifications] = useState(false);
  const [tasks, setTasks] = useState<DeveloperTask[]>([]);
  const [projectsCount, setProjectsCount] = useState(0);
  const [activeSprintsCount, setActiveSprintsCount] = useState(0);
  const [cahiersCount, setCahiersCount] = useState(0);
  const [casTestsCount, setCasTestsCount] = useState(0);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [recentChanges, setRecentChanges] = useState<RecentChange[]>([]);
  const [notifications, setNotifications] = useState<NotificationResponse[]>(
    [],
  );
  const [selectedProjectName, setSelectedProjectName] = useState<string>("");
  const [currentUserName, setCurrentUserName] = useState<string>(
    user?.fullName ?? "Developer",
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function refreshNotifications() {
    if (!notificationsEnabled) {
      setNotifications([]);
      setUnreadNotificationsCount(0);
      return;
    }
    const [notificationsData, unreadCountData] = await Promise.all([
      notificationsService.listMyNotifications(false, 8),
      notificationsService.getUnreadNotificationsCount().catch(() => ({})),
    ]);

    const unreadCount =
      (
        unreadCountData as {
          count?: number;
          unread_count?: number;
          total?: number;
        }
      ).count ??
      (
        unreadCountData as {
          count?: number;
          unread_count?: number;
          total?: number;
        }
      ).unread_count ??
      (
        unreadCountData as {
          count?: number;
          unread_count?: number;
          total?: number;
        }
      ).total ??
      0;

    setNotifications(notificationsData);
    setUnreadNotificationsCount(unreadCount);
  }

  async function load() {
    try {
      const [projs, currentUser] = await Promise.all([
        projectsService.getMember(),
        usersService.getMe().catch(() => null),
      ]);

      await refreshNotifications().catch(() => {
        setNotifications([]);
        setUnreadNotificationsCount(0);
      });

      setCurrentUserName(currentUser?.nom ?? user?.fullName ?? "Developer");

      if (!projs || projs.length === 0) {
        setTasks([]);
        setProjectsCount(0);
        setActiveSprintsCount(0);
        setCahiersCount(0);
        setCasTestsCount(0);
        setRecentChanges([]);
        setSelectedProjectName("Aucun projet");
        return;
      }

      setProjectsCount(projs.length);

      const [backlogResults, sprintResults, cahierResults] = await Promise.all([
        Promise.allSettled(
          projs.map(async (project) => ({
            projectId: project.id,
            projectName: project.nom,
            stories: asArray<UserStoryResponse>(
              await storiesService.getBacklog(project.id),
            ),
          })),
        ),
        Promise.allSettled(
          projs.map(async (project) => ({
            projectId: project.id,
            projectName: project.nom,
            sprints: await sprintsService.getAll(project.id),
          })),
        ),
        Promise.allSettled(
          projs.map(async (project) => {
            const cahier = await cahierTestsService.get(project.id);
            if (!cahier) return null;

            const casTests = await cahierTestsService.listCasTests(
              project.id,
              cahier.id,
            );

            return {
              projectId: project.id,
              projectName: project.nom,
              cahierId: cahier.id,
              casTests,
            };
          }),
        ),
      ]);

      const nextTasks: DeveloperTask[] = [];
      const nextRecentChanges: RecentChange[] = [];
      let nextActiveSprintsCount = 0;
      let nextCahiersCount = 0;
      let nextCasTestsCount = 0;

      backlogResults.forEach((result) => {
        if (result.status !== "fulfilled") return;
        const value = result.value;
        value.stories
          .filter((story) => {
            if (!currentUser || !currentUser.id) return true;
            const assigneeId = story.assignee_id ?? story.assignee?.id;
            return assigneeId === currentUser.id;
          })
          .forEach((story) => {
            nextTasks.push({
              key: `backlog-${value.projectId}-${story.id}`,
              id: story.id,
              title: story.titre,
              status: toTaskStatus(story.statut),
              priority: story.priorite ?? "BASSE",
              projectName: value.projectName,
            });
          });
      });

      sprintResults.forEach((result) => {
        if (result.status !== "fulfilled") return;
        const value = result.value;
        const project = projs.find((item) => item.id === value.projectId);
        if (!project) return;

        value.sprints.forEach((sprint) => {
          if (sprint.statut === "EN_COURS") {
            nextActiveSprintsCount += 1;
          }

          if (sprint.date_debut) {
            nextRecentChanges.push({
              id: `sprint-start-${value.projectId}-${sprint.id}`,
              title: `Sprint started: ${sprint.nom}`,
              subtitle: project.nom,
              time: sprint.date_debut,
              icon: "calendar_month",
            });
          }

          if (sprint.date_fin && sprint.statut === "CLOTURE") {
            nextRecentChanges.push({
              id: `sprint-close-${value.projectId}-${sprint.id}`,
              title: `Sprint closed: ${sprint.nom}`,
              subtitle: project.nom,
              time: sprint.date_fin,
              icon: "calendar_month",
            });
          }

          (sprint.user_stories ?? [])
            .filter((story) => {
              if (!currentUser || !currentUser.id) return true;
              const assigneeId = story.assignee_id ?? story.assignee?.id;
              return assigneeId === currentUser.id;
            })
            .forEach((story) => {
              nextTasks.push({
                key: `sprint-${value.projectId}-${sprint.id}-${story.id}`,
                id: story.id,
                title: story.titre,
                status: toTaskStatus(story.statut),
                priority: story.priorite ?? "BASSE",
                projectName: value.projectName,
                sprintName: sprint.nom,
              });
            });
        });
      });

      for (const result of cahierResults) {
        if (result.status !== "fulfilled" || !result.value) continue;

        const value = result.value;
        nextCahiersCount += 1;
        nextCasTestsCount += value.casTests.length;

        const latestCases = [...value.casTests]
          .sort((a, b) => b.id - a.id)
          .slice(0, 3);
        for (const cas of latestCases) {
          const history = await cahierTestsService
            .getCasTestHistory(value.projectId, value.cahierId, cas.id)
            .catch(() => []);
          const latestHistory = history[0];
          if (!latestHistory) continue;

          nextRecentChanges.push({
            id: `cas-history-${value.projectId}-${cas.id}-${latestHistory.id}`,
            title: `Test case updated: ${cas.titre}`,
            subtitle: value.projectName,
            time: latestHistory.created_at ?? new Date().toISOString(),
            icon: "menu_book",
          });
        }
      }

      nextTasks.sort((a, b) => {
        const statusDiff = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
        if (statusDiff !== 0) return statusDiff;

        const priorityDiff =
          (PRIORITY_ORDER[a.priority] ?? 99) -
          (PRIORITY_ORDER[b.priority] ?? 99);
        if (priorityDiff !== 0) return priorityDiff;

        return a.title.localeCompare(b.title);
      });

      nextRecentChanges.sort((a, b) => {
        const diff = new Date(b.time).getTime() - new Date(a.time).getTime();
        if (Number.isFinite(diff) && diff !== 0) return diff;
        return a.title.localeCompare(b.title);
      });

      setTasks(nextTasks.slice(0, 8));
      setRecentChanges(nextRecentChanges.slice(0, 5));
      setActiveSprintsCount(nextActiveSprintsCount);
      setCahiersCount(nextCahiersCount);
      setCasTestsCount(nextCasTestsCount);
      setSelectedProjectName(
        nextTasks[0]?.projectName ??
          projs[0]?.nom ??
          "Aucun projet",
      );
    } catch {
      setTasks([]);
      setProjectsCount(0);
      setActiveSprintsCount(0);
      setCahiersCount(0);
      setCasTestsCount(0);
      setUnreadNotificationsCount(0);
      setRecentChanges([]);
      setNotifications([]);
      setSelectedProjectName("Aucun projet");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!notificationsEnabled) {
      setNotifications([]);
      setUnreadNotificationsCount(0);
      return;
    }
    const intervalId = setInterval(() => {
      refreshNotifications().catch(() => {});
    }, 15000);
    return () => clearInterval(intervalId);
  }, [notificationsEnabled]);

  async function handleMarkNotificationAsRead(notificationId: number) {
    try {
      await notificationsService.markNotificationAsRead(notificationId);
      await refreshNotifications();
    } catch {
      Alert.alert("Error", "Unable to update the notification.");
    }
  }

  async function handleMarkAllNotificationsAsRead() {
    try {
      await notificationsService.markAllNotificationsAsRead();
      await refreshNotifications();
    } catch {
      Alert.alert("Error", "Unable to update notifications.");
    }
  }

  const inProgress = tasks.filter(
    (task) => task.status === "in_progress",
  ).length;
  const done = tasks.filter((task) => task.status === "done").length;
  const active = tasks.filter((task) => task.status !== "done").length;

  const statItems: StatItem[] = [
    {
      label: "Active tasks",
      value: String(active),
      icon: "refresh-circle",
      tone: "#f59e0b",
    },
    {
      label: "In progress",
      value: String(inProgress),
      icon: "settings",
      tone: "#22c55e",
    },
    {
      label: "Active sprints",
      value: String(activeSprintsCount),
      icon: "calendar",
      tone: "#38bdf8",
    },
    {
      label: "Completed tasks",
      value: String(done),
      icon: "checkmark-circle",
      tone: "#22c55e",
    },
  ];

  const taskCountLabel = `${tasks.length} tasks · ${cahiersCount} cahier${cahiersCount === 1 ? "" : "s"} · ${casTestsCount} test case${casTestsCount === 1 ? "" : "s"}`;

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
            Developer
          </Text>
          <Text style={{ color: c.textSecondary, fontSize: SIZES.fontSm }}>
            Dashboard
          </Text>
        </View>
        <NotificationBell
          enabled={notificationsEnabled}
          unreadCount={unreadCount}
          onPress={() =>
            notificationsEnabled
              ? setShowNotifications(true)
              : Alert.alert("Notifications", "Notifications desactivees")
          }
        />
      </View>
      <HeroCard
        eyebrow="Developer"
        title="Developer Dashboard"
        subtitle={`Hello ${currentUserName}, here are your projects, sprints, notifications, and test cases.`}
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
      <SectionCard title="My Assigned Tasks">
        <View style={styles.sectionActionRow}>
          <View>
            <Text style={styles.sectionMetaText}>{selectedProjectName}</Text>
            <Text style={styles.sectionMetaText}>{taskCountLabel}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate("Sprints")}>
            <Text style={styles.sectionActionLink}>View Sprints</Text>
          </TouchableOpacity>
        </View>
        {tasks.length === 0 ? (
          <EmptyState message="No assigned tasks" />
        ) : (
          tasks.map((task) => (
            <View key={task.key} style={styles.storyRow}>
              <View style={styles.storyInfo}>
                <Text style={styles.storyTitle}>{task.title}</Text>
                <Text style={styles.storyDetail}>
                  {formatStatusLabel(task.status)} · {task.projectName}
                  {task.sprintName ? ` · ${task.sprintName}` : ""}
                  {task.priority
                    ? ` · ${formatPriorityLabel(task.priority)}`
                    : ""}
                </Text>
              </View>
              <StatusBadge
                label={formatStatusLabel(task.status)}
                color={
                  task.status === "in_progress"
                    ? "#f59e0b"
                    : task.status === "done"
                      ? "#22c55e"
                      : "#9ca3af"
                }
              />
            </View>
          ))
        )}
      </SectionCard>

      <View style={styles.dualColumn}>
        <View style={styles.dualColumnItem}>
          <SectionCard title="Recent Changes">
            {recentChanges.length === 0 ? (
              <EmptyState message="No recent changes" />
            ) : (
              recentChanges.map((item) => (
                <View key={item.id} style={styles.changeRow}>
                  <View style={styles.changeIconWrap}>
                    <Ionicons
                      name={
                        item.icon === "menu_book"
                          ? "book-outline"
                          : "calendar-outline"
                      }
                      size={16}
                      color={c.primary}
                    />
                  </View>
                  <View style={styles.changeContent}>
                    <Text style={styles.changeTitle}>{item.title}</Text>
                    <Text style={styles.changeDetail} numberOfLines={1}>
                      {item.subtitle}
                    </Text>
                  </View>
                  <Text style={styles.changeTime}>{timeAgo(item.time)}</Text>
                </View>
              ))
            )}
          </SectionCard>
        </View>
        <View style={styles.dualColumnItem}>
          <SectionCard
            title={`My Notifications${unreadNotificationsCount > 0 ? ` (${unreadNotificationsCount} unread)` : ""}`}
          >
            {notifications.length > 0 && unreadNotificationsCount > 0 ? (
              <TouchableOpacity onPress={handleMarkAllNotificationsAsRead}>
                <Text style={styles.sectionActionLink}>Mark all as read</Text>
              </TouchableOpacity>
            ) : null}
            {notifications.length === 0 ? (
              <EmptyState message="No notifications" />
            ) : (
              notifications.map((notification) => (
                <TouchableOpacity
                  key={notification.id}
                  style={styles.notificationRow}
                  onPress={() =>
                    notification.is_read
                      ? undefined
                      : handleMarkNotificationAsRead(notification.id)
                  }
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.notificationIconWrap,
                      { backgroundColor: `${c.primary}22` },
                    ]}
                  >
                    <Ionicons
                      name={getNotificationIcon(notification.type)}
                      size={16}
                      color={c.primary}
                    />
                  </View>
                  <View style={styles.notificationContent}>
                    <Text style={styles.notificationTitle}>
                      {notification.titre}
                    </Text>
                    <Text style={styles.notificationMessage} numberOfLines={2}>
                      {notification.message}
                    </Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={styles.notificationTime}>
                      {timeAgo(notification.created_at)}
                    </Text>
                    {!notification.is_read ? (
                      <Text style={styles.sectionActionLink}>Mark as read</Text>
                    ) : null}
                  </View>
                </TouchableOpacity>
              ))
            )}
          </SectionCard>
        </View>
      </View>
      <NotificationsModal
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </ScrollView>
  );
}
