import {
  RoleResponse,
  UtilisateurResponse,
} from "@/types/api";
import { apiClient, handleApiError } from "./api";

type UtilisateurApiResponse = {
  id: number;
  email: string;
  nom: string;
  telephone?: string | null;
  /** Champ renvoyé par la plateforme PILT (`UserAdminResponse`). */
  actif?: boolean;
  is_active?: boolean;
  role?: RoleResponse;
  dateCreation?: string | null;
  created_at?: string | null;
};

function normalizeUser(item: UtilisateurApiResponse): UtilisateurResponse {
  return {
    id: item.id,
    email: item.email,
    nom: item.nom,
    telephone: item.telephone ?? undefined,
    is_active: typeof item.is_active === "boolean" ? item.is_active : !!item.actif,
    role: item.role,
    created_at: item.created_at ?? item.dateCreation ?? new Date().toISOString(),
  };
}

export const usersService = {
  async getAll(): Promise<UtilisateurResponse[]> {
    try {
      const res = await apiClient.get<UtilisateurApiResponse[]>("/users");
      return res.data.map(normalizeUser);
    } catch (e) {
      handleApiError(e);
    }
  },

  async getPending(): Promise<UtilisateurResponse[]> {
    try {
      const res = await apiClient.get<UtilisateurApiResponse[]>("/users/pending");
      return res.data.map(normalizeUser);
    } catch (e) {
      handleApiError(e);
    }
  },

  /**
   * PATCH /users/{id}/activate — le backend renvoie { message, user_id }, pas le profil complet.
   */
  async activate(userId: number): Promise<void> {
    try {
      await apiClient.patch(`/users/${userId}/activate`);
    } catch (e) {
      handleApiError(e);
    }
  },

  async deactivate(userId: number): Promise<void> {
    try {
      await apiClient.patch(`/users/${userId}/deactivate`);
    } catch (e) {
      handleApiError(e);
    }
  },

  async delete(userId: number): Promise<void> {
    try {
      await apiClient.delete(`/users/${userId}`);
    } catch (e) {
      handleApiError(e);
    }
  },

  async getMe(): Promise<UtilisateurResponse> {
    try {
      const res = await apiClient.get<UtilisateurApiResponse>("/auth/me");
      return normalizeUser(res.data);
    } catch (e) {
      handleApiError(e);
    }
  },

  async updateProfile(data: {
    nom?: string;
    telephone?: string;
  }): Promise<UtilisateurResponse> {
    try {
      const res = await apiClient.patch<UtilisateurApiResponse>(
        "/users/me/profile",
        data
      );
      return normalizeUser(res.data);
    } catch (e) {
      handleApiError(e);
    }
  },
};

export const rolesService = {
  async getAll(): Promise<RoleResponse[]> {
    try {
      const res = await apiClient.get<RoleResponse[]>("/roles");
      return res.data;
    } catch (e) {
      handleApiError(e);
    }
  },

  async assignToUser(userId: number, roleId: number): Promise<void> {
    try {
      await apiClient.post("/roles/assign-user", {
        user_id: userId,
        role_id: roleId,
      });
    } catch (e) {
      handleApiError(e);
    }
  },
};
