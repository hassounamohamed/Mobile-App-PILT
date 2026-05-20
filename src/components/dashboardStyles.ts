import { useMemo } from "react";
import { StyleSheet } from "react-native";
import type { ThemePalette } from "@/constants/colors";
import { SIZES } from "@/constants";
import { useThemePalette } from "@/hooks/useThemePalette";

function createDashboardStyles(c: ThemePalette) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: c.background },

    heroCard: {
      backgroundColor: c.backgroundSecondary,
      borderRadius: SIZES.radiusXl,
      borderWidth: 1,
      borderColor: c.inputBorder,
      padding: SIZES.xl,
      marginBottom: SIZES.lg,
    },
    heroEyebrow: {
      color: c.primary,
      fontSize: SIZES.fontSm,
      fontWeight: "700",
      marginBottom: SIZES.sm,
    },
    heroTitle: {
      color: c.text,
      fontSize: SIZES.font2xl,
      fontWeight: "800",
      marginBottom: SIZES.sm,
    },
    heroSubtitle: {
      color: c.textSecondary,
      fontSize: SIZES.fontSm,
      lineHeight: 20,
    },

    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: SIZES.md,
      marginBottom: SIZES.lg,
    },
    statCard: {
      width: "48%",
      backgroundColor: c.backgroundSecondary,
      borderRadius: SIZES.radiusLg,
      borderWidth: 1,
      borderColor: c.inputBorder,
      padding: SIZES.lg,
    },
    statIconWrap: {
      width: 34,
      height: 34,
      borderRadius: SIZES.radiusRound,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: SIZES.md,
    },
    statValue: { color: c.text, fontSize: SIZES.fontXl, fontWeight: "800" },
    statLabel: {
      color: c.textSecondary,
      fontSize: SIZES.fontSm,
      marginTop: 4,
    },

    sectionCard: {
      backgroundColor: c.backgroundSecondary,
      borderRadius: SIZES.radiusXl,
      borderWidth: 1,
      borderColor: c.inputBorder,
      padding: SIZES.lg,
      marginBottom: SIZES.lg,
    },
    sectionTitle: {
      color: c.text,
      fontSize: SIZES.fontLg,
      fontWeight: "700",
      marginBottom: SIZES.md,
    },
    emptyText: {
      color: c.textSecondary,
      fontSize: SIZES.fontSm,
      textAlign: "center",
      paddingVertical: SIZES.md,
    },

    activityRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: SIZES.sm,
    },
    activityBullet: {
      width: 8,
      height: 8,
      borderRadius: SIZES.radiusRound,
      backgroundColor: c.primary,
      marginRight: SIZES.md,
    },
    activityContent: { flex: 1 },
    activityTitle: {
      color: c.text,
      fontSize: SIZES.fontSm,
      fontWeight: "600",
    },
    activityDetail: {
      color: c.textSecondary,
      fontSize: SIZES.fontXs,
      marginTop: 2,
    },
    activityTime: { color: c.textSecondary, fontSize: SIZES.fontXs },

    activityMetricRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: SIZES.sm,
      borderBottomWidth: 1,
      borderBottomColor: c.inputBorder,
    },
    activityMetricLabel: {
      color: c.text,
      fontSize: SIZES.fontSm,
      fontWeight: "600",
    },
    activityMetricValue: { color: c.textSecondary, fontSize: SIZES.fontXs },

    projectRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: SIZES.sm,
      borderBottomWidth: 1,
      borderBottomColor: c.inputBorder,
    },
    projectInfo: { flex: 1 },
    projectName: {
      color: c.text,
      fontSize: SIZES.fontSm,
      fontWeight: "600",
    },
    projectDetail: {
      color: c.textSecondary,
      fontSize: SIZES.fontXs,
      marginTop: 2,
    },

    sprintCard: { padding: SIZES.sm },
    sprintName: {
      color: c.text,
      fontSize: SIZES.fontBase,
      fontWeight: "700",
      marginBottom: SIZES.sm,
    },
    sprintObjectif: {
      color: c.textSecondary,
      fontSize: SIZES.fontSm,
      marginBottom: SIZES.sm,
    },
    sprintMeta: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    sprintDate: { color: c.textSecondary, fontSize: SIZES.fontXs },

    storyRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: SIZES.sm,
      borderBottomWidth: 1,
      borderBottomColor: c.inputBorder,
    },
    storyInfo: { flex: 1 },
    storyTitle: { color: c.text, fontSize: SIZES.fontSm, fontWeight: "600" },
    storyDetail: {
      color: c.textSecondary,
      fontSize: SIZES.fontXs,
      marginTop: 2,
    },

    sectionActionRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: SIZES.md,
    },
    sectionMetaText: {
      color: c.textSecondary,
      fontSize: SIZES.fontXs,
    },
    sectionActionLink: {
      color: c.primary,
      fontSize: SIZES.fontSm,
      fontWeight: "700",
    },
    dualColumn: {
      gap: SIZES.lg,
      marginBottom: SIZES.lg,
    },
    dualColumnItem: {
      width: "100%",
    },

    changeRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: c.background,
      borderRadius: SIZES.radiusLg,
      padding: SIZES.md,
      marginBottom: SIZES.sm,
    },
    changeIconWrap: {
      width: 32,
      height: 32,
      borderRadius: SIZES.radiusRound,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: `${c.primary}22`,
      marginRight: SIZES.md,
    },
    changeContent: { flex: 1 },
    changeTitle: {
      color: c.text,
      fontSize: SIZES.fontSm,
      fontWeight: "700",
    },
    changeDetail: {
      color: c.textSecondary,
      fontSize: SIZES.fontXs,
      marginTop: 2,
    },
    changeTime: { color: c.textSecondary, fontSize: SIZES.fontXs },

    notificationRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: c.background,
      borderRadius: SIZES.radiusLg,
      padding: SIZES.md,
      marginBottom: SIZES.sm,
    },
    notificationIconWrap: {
      width: 32,
      height: 32,
      borderRadius: SIZES.radiusRound,
      alignItems: "center",
      justifyContent: "center",
      marginRight: SIZES.md,
    },
    notificationContent: { flex: 1 },
    notificationTitle: {
      color: c.text,
      fontSize: SIZES.fontSm,
      fontWeight: "700",
    },
    notificationMessage: {
      color: c.textSecondary,
      fontSize: SIZES.fontXs,
      marginTop: 2,
    },
    notificationTime: { color: c.textSecondary, fontSize: SIZES.fontXs },

    badge: {
      paddingHorizontal: SIZES.sm,
      paddingVertical: 3,
      borderRadius: SIZES.radiusSm,
      borderWidth: 1,
    },
    badgeText: { fontSize: SIZES.fontXs, fontWeight: "700" },
  });
}

export function useDashboardStyles() {
  const palette = useThemePalette();
  return useMemo(() => createDashboardStyles(palette), [palette]);
}
