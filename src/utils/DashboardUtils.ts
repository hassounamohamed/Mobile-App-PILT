import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants";
import type { DashboardActivity, NotificationResponse } from "@/types/api";

export interface StatItem {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  tone: string;
}

export function asArray<T>(value: unknown): T[] {
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

export function normalizeDashboardActivity(value: unknown): DashboardActivity | null {
  if (!value || typeof value !== "object") return null;

  const record = value as Record<string, unknown>;
  const labels = asArray<string>(record.labels);
  const connexions = asArray<number>(record.connexions);
  const tests = asArray<number>(record.tests);

  return { labels, connexions, tests };
}

export type DeveloperNotification = {
  id: string | number;
  title: string;
  message: string;
  meta?: string;
  icon: keyof typeof Ionicons.glyphMap;
  tone: string;
};

export function formatRelativeTime(timestamp?: string) {
  if (!timestamp) return "just now";
  const diffMs = Date.now() - new Date(timestamp).getTime();
  const diffMinutes = Math.max(1, Math.round(diffMs / 60000));
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} h ago`;
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays} d ago`;
}

export function normalizeText(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim();
}

export type TaskStatus = "to_do" | "in_progress" | "done";

export interface DeveloperTask {
  key: string;
  id: number;
  title: string;
  status: TaskStatus;
  priority: string;
  projectName: string;
  sprintName?: string;
}

export interface RecentChange {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  icon: "menu_book" | "calendar_month";
}

export const STATUS_ORDER: Record<TaskStatus, number> = {
  in_progress: 0,
  to_do: 1,
  done: 2,
};

export const PRIORITY_ORDER: Record<string, number> = {
  CRITIQUE: 0,
  HAUTE: 1,
  MOYENNE: 2,
  BASSE: 3,
  must_have: 0,
  should_have: 1,
  could_have: 2,
  wont_have: 3,
};

export const toTaskStatus = (value?: string): TaskStatus => {
  const normalized = (value ?? "").toLowerCase();
  if (
    normalized === "in_progress" ||
    normalized === "en_cours" ||
    normalized === "ready_for_test" ||
    normalized === "a_tester" ||
    normalized === "a_corriger"
  ) {
    return "in_progress";
  }
  if (
    normalized === "done" ||
    normalized === "termine" ||
    normalized === "cloture"
  ) {
    return "done";
  }
  return "to_do";
};

export const formatPriorityLabel = (priority: string): string => {
  switch ((priority ?? "").toUpperCase()) {
    case "CRITIQUE":
    case "must_have":
      return "Critical";
    case "HAUTE":
    case "should_have":
      return "High";
    case "MOYENNE":
    case "could_have":
      return "Medium";
    case "BASSE":
    case "wont_have":
      return "Low";
    default:
      return "N/A";
  }
};

export const formatStatusLabel = (status: TaskStatus): string => {
  switch (status) {
    case "in_progress":
      return "In progress";
    case "done":
      return "Done";
    default:
      return "To do";
  }
};

export const timeAgo = (isoDate: string): string => {
  const timestamp = new Date(isoDate).getTime();
  if (!Number.isFinite(timestamp)) {
    return "unknown date";
  }

  const diffMs = Date.now() - timestamp;
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} d ago`;
};

export const getNotificationIcon = (type: string): keyof typeof Ionicons.glyphMap => {
  switch ((type ?? "").toUpperCase()) {
    case "TEST_FAILED":
      return "close-circle";
    case "TEST_PASSED":
      return "checkmark-circle";
    case "TEST_EXECUTED":
      return "play";
    case "BUG_DETECTED":
      return "bug";
    case "USER_STORY_ASSIGNED_TO_ME":
      return "person";
    case "SPRINT_STARTED":
      return "play-circle";
    case "SPRINT_COMPLETED":
      return "flag";
    case "PROJECT_CREATED":
      return "rocket";
    default:
      return "notifications-outline";
  }
};

export function normalizeNotification(
  notification: NotificationResponse,
): DeveloperNotification {
  const tone = notification.is_read ? "#9ca3af" : COLORS.primary;
  const kind = notification.type.toLowerCase();
  return {
    id: notification.id,
    title: notification.titre,
    message: notification.message,
    meta: formatRelativeTime(notification.created_at),
    icon: kind.includes("test")
      ? "clipboard-outline"
      : kind.includes("sprint")
        ? "calendar-outline"
        : kind.includes("story")
          ? "document-text-outline"
          : "notifications-outline",
    tone,
  };
}
