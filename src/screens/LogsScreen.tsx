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
import { logsService } from "@/services/logs";
import { AuditLogResponse, SystemLogResponse } from "@/types/api";

type Tab = "audit" | "system";

const LEVEL_COLORS = {
  INFO: "#22c55e",
  WARNING: "#f59e0b",
  ERROR: "#ef4444",
  CRITICAL: "#dc2626",
};

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "À l'instant";
  if (mins < 60) return `Il y a ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Il y a ${hrs} h`;
  return `Il y a ${Math.floor(hrs / 24)} j`;
}

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
  header: { marginBottom: SIZES.lg },
  pageTitle: { color: c.text, fontSize: SIZES.font2xl, fontWeight: "800" },
  pageSubtitle: {
    color: c.textSecondary,
    fontSize: SIZES.fontSm,
    marginTop: 2,
  },
  tabRow: {
    flexDirection: "row",
    backgroundColor: c.backgroundSecondary,
    borderRadius: SIZES.radiusLg,
    borderWidth: 1,
    borderColor: c.inputBorder,
    padding: 4,
    marginBottom: SIZES.lg,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radiusMd,
    alignItems: "center",
  },
  tabBtnActive: { backgroundColor: c.primary },
  tabBtnText: {
    color: c.textSecondary,
    fontSize: SIZES.fontSm,
    fontWeight: "600",
  },
  tabBtnTextActive: { color: c.white },
  emptyWrap: { alignItems: "center", paddingTop: SIZES.xxl, gap: SIZES.md },
  emptyText: { color: c.textSecondary, fontSize: SIZES.fontBase },
  logCard: {
    backgroundColor: c.backgroundSecondary,
    borderRadius: SIZES.radiusLg,
    borderWidth: 1,
    borderColor: c.inputBorder,
    padding: SIZES.md,
    marginBottom: SIZES.sm,
  },
  logTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: SIZES.sm,
    marginBottom: SIZES.sm,
  },
  actionBadge: {
    backgroundColor: `${c.primary}22`,
    paddingHorizontal: SIZES.sm,
    paddingVertical: 2,
    borderRadius: SIZES.radiusSm,
  },
  actionText: {
    color: c.primary,
    fontSize: SIZES.fontXs,
    fontWeight: "700",
  },
  logTime: {
    marginLeft: "auto",
    color: c.textSecondary,
    fontSize: SIZES.fontXs,
  },
  logResource: {
    color: c.text,
    fontSize: SIZES.fontSm,
    fontWeight: "600",
    marginBottom: SIZES.sm,
  },
  logMessage: {
    color: c.text,
    fontSize: SIZES.fontSm,
    marginBottom: SIZES.sm,
  },
  logUser: { flexDirection: "row", alignItems: "center", gap: 4 },
  logUserText: { color: c.textSecondary, fontSize: SIZES.fontXs },
  levelDot: { width: 8, height: 8, borderRadius: 4 },
  levelLabel: { fontSize: SIZES.fontXs, fontWeight: "700" },
});
}

export default function LogsScreen() {
  const c = useThemePalette();
  const styles = useMemo(() => createStyles(c), [c]);

  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<Tab>("audit");
  const [auditLogs, setAuditLogs] = useState<AuditLogResponse[]>([]);
  const [systemLogs, setSystemLogs] = useState<SystemLogResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    try {
      const [audit, system] = await Promise.allSettled([
        logsService.getAudit({ limit: 50 }),
        logsService.getSystem({ limit: 50 }),
      ]);
      if (audit.status === "fulfilled") {
        setAuditLogs(asArray<AuditLogResponse>(audit.value));
      } else {
        setAuditLogs([]);
      }

      if (system.status === "fulfilled") {
        setSystemLogs(asArray<SystemLogResponse>(system.value));
      } else {
        setSystemLogs([]);
      }
    } catch (e: any) {
      Alert.alert("Erreur", e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

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
              load();
            }}
            tintColor={c.primary}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Logs système</Text>
          <Text style={styles.pageSubtitle}>
            Journaux d'audit et événements système
          </Text>
        </View>

        <View style={styles.tabRow}>
          {(["audit", "system"] as Tab[]).map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.tabBtn, activeTab === t && styles.tabBtnActive]}
              onPress={() => setActiveTab(t)}
            >
              <Text
                style={[
                  styles.tabBtnText,
                  activeTab === t && styles.tabBtnTextActive,
                ]}
              >
                {t === "audit" ? "Audit" : "Système"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <ActivityIndicator
            color={c.primary}
            style={{ marginTop: SIZES.xxl }}
          />
        ) : activeTab === "audit" ? (
          auditLogs.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Ionicons
                name="receipt-outline"
                size={48}
                color={c.textSecondary}
              />
              <Text style={styles.emptyText}>Aucun log d'audit</Text>
            </View>
          ) : (
            auditLogs.map((log) => (
              <View key={log.id} style={styles.logCard}>
                <View style={styles.logTop}>
                  <View style={styles.actionBadge}>
                    <Text style={styles.actionText}>{log.action}</Text>
                  </View>
                  <Text style={styles.logTime}>{timeAgo(log.timestamp)}</Text>
                </View>
                <Text style={styles.logResource}>
                  {log.resource}
                  {log.resource_id ? ` #${log.resource_id}` : ""}
                </Text>
                <View style={styles.logUser}>
                  <Ionicons
                    name="person-outline"
                    size={12}
                    color={c.textSecondary}
                  />
                  <Text style={styles.logUserText}>
                    {log.user_nom} · {log.user_email}
                  </Text>
                </View>
              </View>
            ))
          )
        ) : systemLogs.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Ionicons
              name="terminal-outline"
              size={48}
              color={c.textSecondary}
            />
            <Text style={styles.emptyText}>Aucun log système</Text>
          </View>
        ) : (
          systemLogs.map((log) => {
            const color =
              LEVEL_COLORS[log.level as keyof typeof LEVEL_COLORS] ??
              c.textSecondary;
            return (
              <View key={log.id} style={styles.logCard}>
                <View style={styles.logTop}>
                  <View style={[styles.levelDot, { backgroundColor: color }]} />
                  <Text style={[styles.levelLabel, { color }]}>
                    {log.level}
                  </Text>
                  <Text style={styles.logTime}>{timeAgo(log.timestamp)}</Text>
                </View>
                <Text style={styles.logMessage}>{log.message}</Text>
                <View style={styles.logUser}>
                  <Ionicons
                    name="hardware-chip-outline"
                    size={12}
                    color={c.textSecondary}
                  />
                  <Text style={styles.logUserText}>{log.source}</Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}


