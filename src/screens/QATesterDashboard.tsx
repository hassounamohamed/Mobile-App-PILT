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
import { reportsService } from "@/services/reports";
import { cahierTestsService } from "@/services/tests";
import type { ProjetResponse } from "@/types/api";
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

export default function QATesterDashboard() {
  const styles = useDashboardStyles();
  const c = useThemePalette();
  const insets = useSafeAreaInsets();
  const { enabled, unreadCount } = useNotificationRealtime();
  const [showNotifications, setShowNotifications] = useState(false);
  const [projects, setProjects] = useState<ProjetResponse[]>([]);
  const [qaStats, setQaStats] = useState({
    cahiers: 0,
    rapports: 0,
  });
  const [qualityOverview, setQualityOverview] = useState({
    evaluatedProjects: 0,
    totalTests: 0,
    executedTests: 0,
    passedTests: 0,
    failedTests: 0,
    blockedTests: 0,
    pendingTests: 0,
    successRate: 0,
    averageQualityScore: undefined as number | undefined,
    projects: [] as Array<{
      id: number;
      name: string;
      qualityScore?: number;
      successRate: number;
      totalTests: number;
      status: string;
    }>,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  function formatPercent(value: number) {
    return `${value}%`;
  }

  async function load() {
    try {
      const data = await projectsService.getMember();
      const safeProjects = data ?? [];
      setProjects(safeProjects);

      const details = await Promise.allSettled(
        safeProjects.map(async (project) => {
          const [stats, cahier, reports] = await Promise.all([
            cahierTestsService.getStats(project.id),
            cahierTestsService.get(project.id),
            reportsService.getAll(project.id),
          ]);

          const report = reports[0];
          const passed = stats?.reussi ?? report?.nb_tests_passes ?? 0;
          const failed = stats?.echoue ?? report?.nb_tests_echoues ?? 0;
          const blocked = stats?.bloque ?? report?.nb_tests_bloques ?? 0;
          const nonExecute = stats?.nonExecute ?? 0;
          const totalTests = stats?.total ?? passed + failed + blocked;
          const executedTests = passed + failed + blocked;
          const successRate =
            totalTests > 0 ? Math.round((passed / totalTests) * 100) : 0;

          return {
            projectId: project.id,
            projectName: project.nom,
            hasCahier: !!cahier,
            reportsCount: reports.length,
            passed,
            failed,
            blocked,
            pending: nonExecute,
            executedTests,
            totalTests,
            successRate,
            qualityScore: report?.score_qualite,
            status: report?.statut ?? cahier?.statut ?? "BROUILLON",
          };
        }),
      );

      let cahiersCount = 0;
      let reportsCount = 0;
      let executedTests = 0;
      let passedTests = 0;
      let failedTests = 0;
      let blockedTests = 0;
      let pendingTests = 0;
      let totalTests = 0;
      let qualityScoreSum = 0;
      let qualityScoreCount = 0;
      const qualityProjects: Array<{
        id: number;
        name: string;
        qualityScore?: number;
        successRate: number;
        totalTests: number;
        status: string;
      }> = [];

      for (const result of details) {
        if (result.status === "fulfilled") {
          if (result.value.hasCahier) cahiersCount += 1;
          reportsCount += result.value.reportsCount;
          executedTests += result.value.executedTests;
          passedTests += result.value.passed;
          failedTests += result.value.failed;
          blockedTests += result.value.blocked;
          pendingTests += result.value.pending;
          totalTests += result.value.totalTests;

          if (result.value.qualityScore !== undefined) {
            qualityScoreSum += result.value.qualityScore;
            qualityScoreCount += 1;
          }

          if (
            result.value.totalTests > 0 ||
            result.value.qualityScore !== undefined
          ) {
            qualityProjects.push({
              id: result.value.projectId,
              name: result.value.projectName,
              qualityScore: result.value.qualityScore,
              successRate: result.value.successRate,
              totalTests: result.value.totalTests,
              status: result.value.status,
            });
          }
        }
      }

      setQaStats({
        cahiers: cahiersCount,
        rapports: reportsCount,
      });
      qualityProjects.sort(
        (a, b) => (b.qualityScore ?? -1) - (a.qualityScore ?? -1),
      );
      setQualityOverview({
        evaluatedProjects: qualityProjects.length,
        totalTests,
        executedTests,
        passedTests,
        failedTests,
        blockedTests,
        pendingTests,
        successRate:
          totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0,
        averageQualityScore:
          qualityScoreCount > 0
            ? qualityScoreSum / qualityScoreCount
            : undefined,
        projects: qualityProjects.slice(0, 5),
      });
    } catch {
      setProjects([]);
      setQaStats({
        cahiers: 0,
        rapports: 0,
      });
      setQualityOverview({
        evaluatedProjects: 0,
        totalTests: 0,
        executedTests: 0,
        passedTests: 0,
        failedTests: 0,
        blockedTests: 0,
        pendingTests: 0,
        successRate: 0,
        averageQualityScore: undefined,
        projects: [],
      });
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
      label: "Cahiers de tests",
      value: String(qaStats.cahiers),
      icon: "clipboard",
      tone: "#06b6d4",
    },
    {
      label: "Rapports QA",
      value: String(qaStats.rapports),
      icon: "bar-chart",
      tone: "#ec4899",
    },
    {
      label: "Taux de réussite",
      value: formatPercent(qualityOverview.successRate),
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
            QA Tester
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
        eyebrow="QA Tester"
        title="Quality Dashboard"
        subtitle="Suivez la qualité, les résultats de tests et le taux de réussite global."
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
      <SectionCard title="Vue d'ensemble globale">
        {qualityOverview.evaluatedProjects === 0 ? (
          <EmptyState message="Aucune donnée qualité disponible" />
        ) : (
          <View>
            <View style={styles.qualitySummaryGrid}>
              <View style={styles.qualitySummaryItem}>
                <Text style={styles.qualitySummaryValue}>
                  {qualityOverview.executedTests}
                </Text>
                <Text style={styles.qualitySummaryLabel}>Tests exécutés</Text>
              </View>
              <View style={styles.qualitySummaryItem}>
                <Text style={styles.qualitySummaryValue}>
                  {qualityOverview.passedTests}
                </Text>
                <Text style={styles.qualitySummaryLabel}>Réussis</Text>
              </View>
              <View style={styles.qualitySummaryItem}>
                <Text style={styles.qualitySummaryValue}>
                  {qualityOverview.failedTests}
                </Text>
                <Text style={styles.qualitySummaryLabel}>Échoués</Text>
              </View>
              <View style={styles.qualitySummaryItem}>
                <Text style={styles.qualitySummaryValue}>
                  {qualityOverview.pendingTests}
                </Text>
                <Text style={styles.qualitySummaryLabel}>En attente</Text>
              </View>
            </View>

            <View style={styles.qualityProgressHeader}>
              <Text style={styles.qualityProgressLabel}>Taux de réussite</Text>
              <Text style={styles.qualityProgressValue}>
                {qualityOverview.passedTests}/{qualityOverview.totalTests}
              </Text>
            </View>
            <Text style={styles.qualityRateCaption}>
              {formatPercent(qualityOverview.successRate)} de réussite globale
            </Text>
            <View style={styles.qualityProgressBarBg}>
              <View
                style={[
                  styles.qualityProgressBarFill,
                  { width: `${qualityOverview.successRate}%` as any },
                ]}
              />
            </View>

            <View style={styles.qualityBreakdown}>
              <View style={styles.qualityBreakdownItem}>
                <Text style={styles.qualityBreakdownValue}>
                  {qualityOverview.totalTests}
                </Text>
                <Text style={styles.qualityBreakdownLabel}>Total</Text>
              </View>
              <View style={styles.qualityBreakdownItem}>
                <Text style={styles.qualityBreakdownValue}>
                  {qualityOverview.averageQualityScore !== undefined
                    ? `${qualityOverview.averageQualityScore.toFixed(1)}%`
                    : "--"}
                </Text>
                <Text style={styles.qualityBreakdownLabel}>
                  Score qualité moyen
                </Text>
              </View>
              <View style={styles.qualityBreakdownItem}>
                <Text style={styles.qualityBreakdownValue}>
                  {qualityOverview.evaluatedProjects}
                </Text>
                <Text style={styles.qualityBreakdownLabel}>
                  Projets évalués
                </Text>
              </View>
            </View>

            <View style={styles.qualityProjectList}>
              {qualityOverview.projects.map((project) => (
                <View key={project.id} style={styles.qualityProjectRow}>
                  <View style={styles.projectInfo}>
                    <Text style={styles.projectName}>{project.name}</Text>
                    <Text style={styles.projectDetail}>
                      {project.totalTests} test(s) analysé(s)
                    </Text>
                    <Text style={styles.qualityProjectDetail}>
                      Taux de réussite: {formatPercent(project.successRate)}
                    </Text>
                  </View>
                  <View style={{ alignItems: "flex-end", gap: 6 }}>
                    <StatusBadge
                      label={project.status}
                      color={
                        project.status === "FINALISE" ? "#22c55e" : "#9ca3af"
                      }
                    />
                    <Text style={styles.qualityProjectScore}>
                      {project.qualityScore !== undefined
                        ? `Score: ${project.qualityScore.toFixed(1)}%`
                        : "Score non publié"}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </SectionCard>
      <NotificationsModal
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </ScrollView>
  );
}
