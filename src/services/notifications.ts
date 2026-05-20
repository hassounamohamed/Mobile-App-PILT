import { NotificationResponse } from "@/types/api";
import { apiClient, handleApiError } from "./api";

export interface NotificationUnreadCountResponse {
  count?: number;
  unread_count?: number;
  total?: number;
}

export interface NotificationMarkAllReadResponse {
  message?: string;
  count?: number;
}

const BASE_URL = "/notifications";

type NotificationApiResponse = {
  id: number;
  titre: string;
  message: string;
  type: string;
  dateEnvoi?: string;
  lue?: boolean;
  created_at?: string;
  is_read?: boolean;
  priorite?: string;
  destinataireId?: number;
};

function normalizeNotification(item: NotificationApiResponse): NotificationResponse {
  return {
    id: item.id,
    titre: item.titre,
    message: item.message,
    type: item.type,
    is_read: item.is_read ?? item.lue ?? false,
    created_at: item.created_at ?? item.dateEnvoi ?? new Date().toISOString(),
  };
}

export const notificationsService = {
  async listMyNotifications(
    unreadOnly = false,
    limit = 20,
  ): Promise<NotificationResponse[]> {
    try {
      const res = await apiClient.get<NotificationApiResponse[]>(
        `${BASE_URL}/me`,
        {
          params: { unread_only: unreadOnly, limit },
        },
      );
      return (res.data ?? []).map(normalizeNotification);
    } catch (e) {
      handleApiError(e);
    }
  },

  async getUnreadNotificationsCount(): Promise<NotificationUnreadCountResponse> {
    try {
      const res = await apiClient.get<NotificationUnreadCountResponse>(
        `${BASE_URL}/me/unread-count`,
      );
      return res.data ?? {};
    } catch (e) {
      handleApiError(e);
    }
  },

  async markNotificationAsRead(
    notificationId: number,
  ): Promise<NotificationResponse> {
    try {
      const res = await apiClient.patch<NotificationApiResponse>(
        `${BASE_URL}/${notificationId}/read`,
      );
      return normalizeNotification(res.data);
    } catch (e) {
      handleApiError(e);
    }
  },

  async markAllNotificationsAsRead(): Promise<NotificationMarkAllReadResponse> {
    try {
      const res = await apiClient.patch<NotificationMarkAllReadResponse>(
        `${BASE_URL}/me/read-all`,
      );
      return res.data ?? {};
    } catch (e) {
      handleApiError(e);
    }
  },
};
