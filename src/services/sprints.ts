import { SprintResponse, SprintVelocite, UserStoryResponse } from "@/types/api";
import { apiClient, handleApiError } from "./api";

type SprintApiResponse = {
  id: number;
  nom: string;
  objectifSprint?: string | null;
  dateDebut?: string | null;
  dateFin?: string | null;
  statut?: string | null;
  projet_id: number;
  velocite?: number;
  userstories?: Array<
    UserStoryResponse & {
      developerId?: number | null;
      assigneeId?: number | null;
      testerId?: number | null;
      priorite?: string | null;
      statut?: string | null;
    }
  >;
};

type SprintVelociteApi = {
  points_termines: number;
  points_total: number;
  nb_terminees: number;
  nb_userstories: number;
};

function normalizeSprintStatus(status?: string | null): SprintResponse["statut"] {
  const value = (status ?? "").toUpperCase();
  if (value === "EN_COURS") return "EN_COURS";
  if (value === "TERMINE" || value === "CLOTURE") return "CLOTURE";
  return "PLANIFIE";
}

function normalizeStoryStatus(status?: string | null): UserStoryResponse["statut"] {
  const value = (status ?? "").toLowerCase();
  if (value === "in_progress") return "EN_COURS";
  if (value === "done") return "TERMINE";
  return "A_FAIRE";
}

function normalizeStoryPriority(priority?: string | null): UserStoryResponse["priorite"] {
  const value = (priority ?? "").toLowerCase();
  if (value === "must_have") return "CRITIQUE";
  if (value === "should_have") return "HAUTE";
  if (value === "could_have") return "MOYENNE";
  return "BASSE";
}

function normalizeSprintStory(
  story: SprintApiResponse["userstories"][number],
): UserStoryResponse {
  const assigneeId = story.assigneeId ?? story.developerId ?? story.assignee?.id ?? undefined;
  return {
    id: story.id,
    titre: story.titre,
    description: story.description ?? undefined,
    priorite: normalizeStoryPriority(story.priorite),
    statut: normalizeStoryStatus(story.statut),
    points: story.points ?? undefined,
    module_id: story.module_id ?? undefined,
    epic_id: story.epic_id ?? undefined,
    assignee: story.assignee ?? undefined,
    assignee_id: assigneeId,
    testeur_id: story.testerId ?? undefined,
  };
}

function normalizeSprint(item: SprintApiResponse): SprintResponse {
  const userStories = (item.userstories ?? []).map(normalizeSprintStory);
  return {
    id: item.id,
    nom: item.nom,
    objectif: item.objectifSprint ?? undefined,
    date_debut: item.dateDebut ?? undefined,
    date_fin: item.dateFin ?? undefined,
    statut: normalizeSprintStatus(item.statut),
    projet_id: item.projet_id,
    nb_user_stories: userStories.length,
    velocite: item.velocite ?? 0,
    user_stories: userStories,
  };
}

export const sprintsService = {
  async getAll(projetId: number): Promise<SprintResponse[]> {
    try {
      const res = await apiClient.get<SprintApiResponse[]>(
        `/projets/${projetId}/sprints`
      );
      return res.data.map(normalizeSprint);
    } catch (e) {
      handleApiError(e);
    }
  },

  async getActive(projetId: number): Promise<SprintResponse | null> {
    try {
      const res = await apiClient.get<SprintApiResponse>(
        `/projets/${projetId}/sprints/actif`
      );
      return res.data ? normalizeSprint(res.data) : null;
    } catch (e: any) {
      if (e?.response?.status === 404) return null;
      handleApiError(e);
    }
  },

  async getById(
    projetId: number,
    sprintId: number
  ): Promise<SprintResponse> {
    try {
      const res = await apiClient.get<SprintApiResponse>(
        `/projets/${projetId}/sprints/${sprintId}`
      );
      return normalizeSprint(res.data);
    } catch (e) {
      handleApiError(e);
    }
  },

  async getVelocite(
    projetId: number,
    sprintId: number
  ): Promise<SprintVelocite> {
    try {
      const res = await apiClient.get<SprintVelociteApi>(
        `/projets/${projetId}/sprints/${sprintId}/velocite`
      );
      const data = res.data;
      return {
        stories_terminees: data.nb_terminees,
        points_termines: data.points_termines,
        taux_completion:
          data.points_total > 0
            ? Math.round((data.points_termines / data.points_total) * 100)
            : 0,
      };
    } catch (e) {
      handleApiError(e);
    }
  },

  async create(
    projetId: number,
    data: {
      nom: string;
      objectif?: string;
      date_debut: string;
      date_fin: string;
    }
  ): Promise<SprintResponse> {
    try {
      const res = await apiClient.post<SprintApiResponse>(
        `/projets/${projetId}/sprints`,
        {
          nom: data.nom,
          objectifSprint: data.objectif,
          dateDebut: data.date_debut,
          dateFin: data.date_fin,
        }
      );
      return normalizeSprint(res.data);
    } catch (e) {
      handleApiError(e);
    }
  },

  async update(
    projetId: number,
    sprintId: number,
    data: Partial<{ nom: string; objectif: string; date_debut: string; date_fin: string }>
  ): Promise<SprintResponse> {
    try {
      const res = await apiClient.put<SprintApiResponse>(
        `/projets/${projetId}/sprints/${sprintId}`,
        {
          nom: data.nom,
          objectifSprint: data.objectif,
          dateDebut: data.date_debut,
          dateFin: data.date_fin,
        }
      );
      return normalizeSprint(res.data);
    } catch (e) {
      handleApiError(e);
    }
  },

  async start(projetId: number, sprintId: number): Promise<SprintResponse> {
    try {
      const res = await apiClient.patch<SprintApiResponse>(
        `/projets/${projetId}/sprints/${sprintId}/demarrer`
      );
      return normalizeSprint(res.data);
    } catch (e) {
      handleApiError(e);
    }
  },

  async close(projetId: number, sprintId: number): Promise<SprintResponse> {
    try {
      const res = await apiClient.patch<SprintApiResponse>(
        `/projets/${projetId}/sprints/${sprintId}/cloturer`
      );
      return normalizeSprint(res.data);
    } catch (e) {
      handleApiError(e);
    }
  },

  async addUserStories(
    projetId: number,
    sprintId: number,
    storyIds: number[]
  ): Promise<void> {
    try {
      await apiClient.post(
        `/projets/${projetId}/sprints/${sprintId}/userstories`,
        { userstory_ids: storyIds }
      );
    } catch (e) {
      handleApiError(e);
    }
  },
};
