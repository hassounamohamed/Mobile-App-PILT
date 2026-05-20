import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useDashboardStyles } from "./dashboardStyles";
import type { StatItem } from "@/utils/DashboardUtils";
import { useThemePalette } from "@/hooks/useThemePalette";

export function StatCard({ item }: { item: StatItem }) {
  const styles = useDashboardStyles();
  return (
    <View style={styles.statCard}>
      <View
        style={[styles.statIconWrap, { backgroundColor: `${item.tone}22` }]}
      >
        <Ionicons name={item.icon} size={18} color={item.tone} />
      </View>
      <Text style={styles.statValue}>{item.value}</Text>
      <Text style={styles.statLabel}>{item.label}</Text>
    </View>
  );
}

export function HeroCard({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  const styles = useDashboardStyles();
  return (
    <View style={styles.heroCard}>
      <Text style={styles.heroEyebrow}>{eyebrow}</Text>
      <Text style={styles.heroTitle}>{title}</Text>
      <Text style={styles.heroSubtitle}>{subtitle}</Text>
    </View>
  );
}

export function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const styles = useDashboardStyles();
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

export function StatusBadge({ label, color }: { label: string; color: string }) {
  const styles = useDashboardStyles();
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: `${color}22`, borderColor: `${color}44` },
      ]}
    >
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

export function EmptyState({ message }: { message: string }) {
  const styles = useDashboardStyles();
  return <Text style={styles.emptyText}>{message}</Text>;
}

export function NotificationBell({
  unreadCount,
  enabled,
  onPress,
}: {
  unreadCount: number;
  enabled: boolean;
  onPress: () => void;
}) {
  const c = useThemePalette();
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: c.backgroundSecondary,
        borderWidth: 1,
        borderColor: c.inputBorder,
      }}
      activeOpacity={0.8}
    >
      <Ionicons
        name={enabled ? "notifications-outline" : "notifications-off-outline"}
        size={20}
        color={enabled ? c.text : c.textSecondary}
      />
      {enabled && unreadCount > 0 ? (
        <View
          style={{
            position: "absolute",
            top: 6,
            right: 6,
            minWidth: 16,
            height: 16,
            borderRadius: 8,
            paddingHorizontal: 4,
            backgroundColor: "#ef4444",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#fff", fontSize: 10, fontWeight: "700" }}>
            {unreadCount}
          </Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}
