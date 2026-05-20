import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SIZES } from "@/constants";
import type { ThemePalette } from "@/constants/colors";
import { useThemePalette } from "@/hooks/useThemePalette";
import { notificationsService } from "@/services/notifications";
import type { NotificationResponse } from "@/types/api";
import { getNotificationIcon, timeAgo } from "@/utils/DashboardUtils";

const { height: SCREEN_H } = Dimensions.get("window");
const PANEL_MAX_H = Math.min(SCREEN_H * 0.52, 380);

function createStyles(c: ThemePalette) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: SIZES.lg,
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.4)",
    },
    panel: {
      width: "100%",
      maxWidth: 360,
      maxHeight: PANEL_MAX_H,
      backgroundColor: c.backgroundSecondary,
      borderRadius: SIZES.radiusLg,
      borderWidth: 1,
      borderColor: c.inputBorder,
      overflow: "hidden",
      zIndex: 1,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: SIZES.md,
      paddingVertical: SIZES.sm,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.inputBorder,
    },
    headerTitle: {
      color: c.text,
      fontSize: SIZES.fontBase,
      fontWeight: "700",
    },
    closeBtn: {
      padding: SIZES.xs,
    },
    markAll: {
      paddingHorizontal: SIZES.md,
      paddingVertical: SIZES.xs,
    },
    markAllText: {
      color: c.primary,
      fontSize: SIZES.fontXs,
      fontWeight: "600",
    },
    scroll: {
      maxHeight: PANEL_MAX_H - 88,
    },
    scrollContent: {
      paddingHorizontal: SIZES.sm,
      paddingBottom: SIZES.sm,
    },
    row: {
      flexDirection: "row",
      alignItems: "flex-start",
      paddingVertical: SIZES.sm,
      paddingHorizontal: SIZES.xs,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.inputBorder,
    },
    rowUnread: {
      backgroundColor: `${c.primary}08`,
    },
    iconWrap: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      marginRight: SIZES.sm,
      backgroundColor: `${c.primary}18`,
    },
    body: { flex: 1, minWidth: 0 },
    title: {
      color: c.text,
      fontSize: SIZES.fontSm,
      fontWeight: "600",
    },
    message: {
      color: c.textSecondary,
      fontSize: SIZES.fontXs,
      marginTop: 2,
      lineHeight: 16,
    },
    meta: {
      alignItems: "flex-end",
      marginLeft: SIZES.xs,
    },
    time: {
      color: c.textSecondary,
      fontSize: 10,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: c.primary,
      marginTop: 4,
    },
    empty: {
      padding: SIZES.lg,
      alignItems: "center",
    },
    emptyText: {
      color: c.textSecondary,
      fontSize: SIZES.fontSm,
    },
    loader: {
      padding: SIZES.lg,
    },
  });
}

export function NotificationsModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const c = useThemePalette();
  const styles = useMemo(() => createStyles(c), [c]);
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const items = await notificationsService.listMyNotifications(false, 30);
      setNotifications(items);
    } catch (e: any) {
      Alert.alert("Erreur", e?.message ?? "Impossible de charger les notifications");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (visible) {
      load();
    }
  }, [visible]);

  async function handleMarkRead(id: number) {
    try {
      await notificationsService.markNotificationAsRead(id);
      await load();
    } catch (e: any) {
      Alert.alert("Erreur", e?.message ?? "Impossible de marquer la notification");
    }
  }

  async function handleMarkAllRead() {
    try {
      await notificationsService.markAllNotificationsAsRead();
      await load();
    } catch (e: any) {
      Alert.alert("Erreur", e?.message ?? "Impossible de tout marquer");
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.panel}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Notifications</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={12}>
              <Ionicons name="close" size={20} color={c.textSecondary} />
            </TouchableOpacity>
          </View>

          {notifications.length > 0 ? (
            <TouchableOpacity onPress={handleMarkAllRead} style={styles.markAll}>
              <Text style={styles.markAllText}>Tout marquer lu</Text>
            </TouchableOpacity>
          ) : null}

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={notifications.length > 4}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={async () => {
                  setRefreshing(true);
                  await load();
                  setRefreshing(false);
                }}
                tintColor={c.primary}
              />
            }
          >
            {loading ? (
              <View style={styles.loader}>
                <ActivityIndicator color={c.primary} size="small" />
              </View>
            ) : notifications.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons name="notifications-off-outline" size={28} color={c.textSecondary} />
                <Text style={[styles.emptyText, { marginTop: SIZES.sm }]}>
                  Aucune notification
                </Text>
              </View>
            ) : (
              notifications.map((notification) => (
                <TouchableOpacity
                  key={notification.id}
                  style={[styles.row, !notification.is_read && styles.rowUnread]}
                  onPress={() =>
                    notification.is_read ? undefined : handleMarkRead(notification.id)
                  }
                  activeOpacity={0.75}
                >
                  <View style={styles.iconWrap}>
                    <Ionicons
                      name={getNotificationIcon(notification.type)}
                      size={14}
                      color={c.primary}
                    />
                  </View>
                  <View style={styles.body}>
                    <Text style={styles.title} numberOfLines={1}>
                      {notification.titre}
                    </Text>
                    <Text style={styles.message} numberOfLines={2}>
                      {notification.message}
                    </Text>
                  </View>
                  <View style={styles.meta}>
                    <Text style={styles.time}>{timeAgo(notification.created_at)}</Text>
                    {!notification.is_read ? <View style={styles.dot} /> : null}
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
