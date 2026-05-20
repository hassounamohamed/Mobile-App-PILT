import { useEffect, useState } from "react";
import { AppState } from "react-native";
import { notificationsService } from "@/services/notifications";
import { useNotificationSettingsStore } from "@/context/notificationSettingsStore";

export function useNotificationRealtime(intervalMs = 15000) {
  const enabled = useNotificationSettingsStore((state) => state.enabled);
  const [unreadCount, setUnreadCount] = useState(0);

  async function refreshUnreadCount() {
    if (!enabled) return;
    const data = await notificationsService
      .getUnreadNotificationsCount()
      .catch(() => ({}));
    const unread =
      (data as { count?: number; unread_count?: number; total?: number })
        .count ??
      (data as { count?: number; unread_count?: number; total?: number })
        .unread_count ??
      (data as { count?: number; unread_count?: number; total?: number })
        .total ??
      0;
    setUnreadCount(unread);
  }

  useEffect(() => {
    if (!enabled) {
      setUnreadCount(0);
      return;
    }

    refreshUnreadCount();
    const intervalId = setInterval(refreshUnreadCount, intervalMs);
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        refreshUnreadCount();
      }
    });

    return () => {
      clearInterval(intervalId);
      subscription.remove();
    };
  }, [enabled, intervalMs]);

  return {
    enabled,
    unreadCount,
    refreshUnreadCount,
  };
}
