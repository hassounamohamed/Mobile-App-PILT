import {
  EpicResponse,
  ModuleResponse,
  ProjetResponse,
  ProjetStats,
  UtilisateurResponse,
} from "@/types/api";
import { apiClient, handleApiError } from "./api";

type ProjetApiResponse = {
  id: number;
  nom: string;
  description?: string | null;
  statut?: string | null;
  dateDebut?: string | null;
  dateFin?: string | null;
  membres?: UtilisateurResponse[];
};

type ModuleApiResponse = {
  id: number;
  nom: string;
  description?: string | null;
  ordre?: number;
  projet_id: number;
};

type EpicApiResponse = {
  id: number;
  titre: string;
  description?: string | null;
  priorite?: number;
  statut?: string | null;
  module_id: number;
};

function normalizeProjectStatus(status?: string | null): ProjetResponse["statut"] {
  const value = (status ?? "").toUpperCase();
  if (value === "ARCHIVE" || value === "ARCHIVED") return "ARCHIVE";
  if (value === "TERMINE" || value === "DONE") return "TERMINE";
  return "ACTIF";
}

function normalizeProjet(project: ProjetApiResponse): ProjetResponse {
  return {
    id: project.id,
    nom: project.nom,
    description: project.description ?? undefined,
    statut: normalizeProjectStatus(project.statut),
    date_debut: project.dateDebut ?? undefined,
    date_fin: project.dateFin ?? undefined,
    membres: project.membres,
    nb_modules: 0,
    nb_epics: 0,
    nb_user_stories: 0,
  };
}

function normalizeEpicPriority(priority?: number): EpicResponse["priorite"] {
  if ((priority ?? 0) >= 75) return "CRITIQUE";
  if ((priority ?? 0) >= 50) return "HAUTE";
  if ((priority ?? 0) >= 25) return "MOYENNE";
  return "BASSE";
}

function normalizeEpicStatus(status?: string | null): EpicResponse["statut"] {
  const value = (status ?? "").toLowerCase();
  if (value === "done") return "TERMINE";
  if (value === "in_progress") return "EN_COURS";
  return "A_FAIRE";
}

export const projectsService = {
  async getMine(): Promise<ProjetResponse[]> {
    try {
      const res = await apiClient.get<ProjetApiResponse[]>(
        "/projets/mes-projets"
      );
      return res.data.map(normalizeProjet);
    } catch (e) {
      handleApiError(e);
    }
  },

  async getMember(): Promise<ProjetResponse[]> {
    try {
      const res = await apiClient.get<ProjetApiResponse[]>(
        "/projets/mes-projets-membre"
      );
      return res.data.map(normalizeProjet);
    } catch (e) {
      handleApiError(e);
    }
  },

  async getById(projetId: number): Promise<ProjetResponse> {
    try {
      const res = await apiClient.get<ProjetApiResponse>(`/projets/${projetId}`);
      return normalizeProjet(res.data);
    } catch (e) {
      handleApiError(e);
    }
  },

  async getStats(projetId: number): Promise<ProjetStats> {
    try {
      const res = await apiClient.get<ProjetStats>(
        `/projets/${projetId}/statistiques`
      );
      return res.data;
    } catch (e) {
      handleApiError(e);
    }
  },

  async getAvailableMembers(): Promise<UtilisateurResponse[]> {
    try {
      const res = await apiClient.get<UtilisateurResponse[]>(
        "/projets/membres-disponibles"
      );
      return res.data;
    } catch (e) {
      handleApiError(e);
    }
  },

  async create(data: {
    nom: string;
    description?: string;
    date_debut?: string;
    date_fin?: string;
  }): Promise<ProjetResponse> {
    try {
      const payload = {
        nom: data.nom,
        description: data.description,
        dateDebut: data.date_debut,
        dateFin: data.date_fin,
      };
      const res = await apiClient.post<ProjetApiResponse>("/projets", payload);
      return normalizeProjet(res.data);
    } catch (e) {
      handleApiError(e);
    }
  },

  async update(
    projetId: number,
    data: Partial<{ nom: string; description: string; statut: string }>
  ): Promise<ProjetResponse> {
    try {
      const res = await apiClient.put<ProjetApiResponse>(
        `/projets/${projetId}`,
        {
          nom: data.nom,
          description: data.description,
          statut: data.statut?.toLowerCase(),
        }
      );
      return normalizeProjet(res.data);
    } catch (e) {
      handleApiError(e);
    }
  },

  async archive(projetId: number): Promise<ProjetResponse> {
    try {
      const res = await apiClient.patch<ProjetApiResponse>(
        `/projets/${projetId}/archiver`
      );
      return normalizeProjet(res.data);
    } catch (e) {
      handleApiError(e);
    }
  },

  async addMembers(
    projetId: number,
    memberIds: number[]
  ): Promise<ProjetResponse> {
    try {
      const res = await apiClient.post<ProjetResponse>(
        `/projets/${projetId}/membres`,
        { membre_ids: memberIds }
      );
      return res.data;
    } catch (e) {
      handleApiError(e);
    }
  },
};

export const modulesService = {
  async getAll(projetId: number): Promise<ModuleResponse[]> {
    try {
      const res = await apiClient.get<ModuleApiResponse[]>(
        `/projets/${projetId}/modules`
      );
      return res.data.map((item) => ({
        id: item.id,
        nom: item.nom,
        description: item.description ?? undefined,
        ordre: item.ordre,
        projet_id: item.projet_id,
      }));
    } catch (e) {
      handleApiError(e);
    }
  },
};

export const epicsService = {
  async getAll(projetId: number, moduleId: number): Promise<EpicResponse[]> {
    try {
      const res = await apiClient.get<EpicApiResponse[]>(
        `/projets/${projetId}/modules/${moduleId}/epics`
      );
      return res.data.map((item) => ({
        id: item.id,
        nom: item.titre,
        description: item.description ?? undefined,
        priorite: normalizeEpicPriority(item.priorite),
        statut: normalizeEpicStatus(item.statut),
        module_id: item.module_id,
        projet_id: projetId,
      }));
    } catch (e) {
      handleApiError(e);
    }
  },

  async getByProject(projetId: number): Promise<EpicResponse[]> {
    try {
      const res = await apiClient.get<EpicApiResponse[]>(
        `/projets/${projetId}/epics`
      );
      return res.data.map((item) => ({
        id: item.id,
        nom: item.titre,
        description: item.description ?? undefined,
        priorite: normalizeEpicPriority(item.priorite),
        statut: normalizeEpicStatus(item.statut),
        module_id: item.module_id,
        projet_id: projetId,
      }));
    } catch (e) {
      handleApiError(e);
    }
  },
};
