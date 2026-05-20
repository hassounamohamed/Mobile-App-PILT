import { BacklogIndicateurs, UserStoryResponse } from "@/types/api";
import { apiClient, handleApiError } from "./api";

type UserStoryApiResponse = {
  id: number;
  titre: string;
  description?: string | null;
  priorite?: string | null;
  statut?: string | null;
  points?: number | null;
  epic_id: number;
  assignee?: { id: number; nom: string; email?: string } | null;
  assigneeId?: number | null;
  developerId?: number | null;
  testerId?: number | null;
};

function normalizeStoryStatus(status?: string | null): UserStoryResponse["statut"] {
  const value = (status ?? "").toLowerCase();
  if (value === "in_progress") return "EN_COURS";
  if (value === "done") return "TERMINE";
  return "A_FAIRE";
}

function denormalizeStoryStatus(status: UserStoryResponse["statut"]): string {
  if (status === "EN_COURS") return "in_progress";
  if (status === "TERMINE") return "done";
  return "to_do";
}

function normalizeStoryPriority(priority?: string | null): UserStoryResponse["priorite"] {
  const value = (priority ?? "").toLowerCase();
  if (value === "must_have") return "CRITIQUE";
  if (value === "should_have") return "HAUTE";
  if (value === "could_have") return "MOYENNE";
  return "BASSE";
}

function normalizeStory(item: UserStoryApiResponse, moduleId?: number): UserStoryResponse {
  const assigneeId = item.assigneeId ?? item.developerId ?? item.assignee?.id ?? undefined;
  return {
    id: item.id,
    titre: item.titre,
    description: item.description ?? undefined,
    priorite: normalizeStoryPriority(item.priorite),
    statut: normalizeStoryStatus(item.statut),
    points: item.points ?? undefined,
    module_id: moduleId,
    epic_id: item.epic_id,
    assignee: item.assignee
      ? ({ id: item.assignee.id, nom: item.assignee.nom } as UserStoryResponse["assignee"])
      : undefined,
    assignee_id: assigneeId,
    testeur_id: item.testerId ?? undefined,
  };
}

export const storiesService = {
  async getBacklog(projetId: number): Promise<UserStoryResponse[]> {
    try {
      const res = await apiClient.get<UserStoryApiResponse[]>(
        `/projets/${projetId}/backlog`,
      );
      return res.data.map((item) => normalizeStory(item));
    } catch (e) {
      handleApiError(e);
    }
  },

  async getBacklogIndicateurs(projetId: number): Promise<BacklogIndicateurs> {
    try {
      const res = await apiClient.get<BacklogIndicateurs>(
        `/projets/${projetId}/backlog/indicateurs`,
      );
      return res.data;
    } catch (e) {
      handleApiError(e);
    }
  },

  async getForEpic(
    projetId: number,
    moduleId: number,
    epicId: number,
  ): Promise<UserStoryResponse[]> {
    try {
      const res = await apiClient.get<UserStoryApiResponse[]>(
        `/projets/${projetId}/modules/${moduleId}/epics/${epicId}/userstories`,
      );
      return res.data.map((item) => normalizeStory(item, moduleId));
    } catch (e) {
      handleApiError(e);
    }
  },

  async getById(
    projetId: number,
    moduleId: number,
    epicId: number,
    storyId: number,
  ): Promise<UserStoryResponse> {
    try {
      const res = await apiClient.get<UserStoryApiResponse>(
        `/projets/${projetId}/modules/${moduleId}/epics/${epicId}/userstories/${storyId}`,
      );
      return normalizeStory(res.data, moduleId);
    } catch (e) {
      handleApiError(e);
    }
  },

  async updateStatus(
    projetId: number,
    moduleId: number | undefined,
    epicId: number,
    storyId: number,
    statut: UserStoryResponse["statut"],
  ): Promise<UserStoryResponse> {
    try {
      if (typeof moduleId !== "number") {
        throw new Error(
          "module_id manquant pour mettre à jour le statut de la story.",
        );
      }

      const res = await apiClient.patch<UserStoryResponse>(
        `/projets/${projetId}/modules/${moduleId}/epics/${epicId}/userstories/${storyId}/statut`,
        { statut: denormalizeStoryStatus(statut) },
      );
      return normalizeStory(res.data as unknown as UserStoryApiResponse, moduleId);
    } catch (e) {
      handleApiError(e);
    }
  },

  async assign(
    projetId: number,
    moduleId: number,
    epicId: number,
    storyId: number,
    assigneeId: number,
  ): Promise<UserStoryResponse> {
    try {
      const res = await apiClient.patch<UserStoryApiResponse>(
        `/projets/${projetId}/modules/${moduleId}/epics/${epicId}/userstories/${storyId}/assigner`,
        { developeur_id: assigneeId },
      );
      return normalizeStory(res.data, moduleId);
    } catch (e) {
      handleApiError(e);
    }
  },
};
