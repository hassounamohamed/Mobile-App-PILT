import { apiClient, handleApiError } from "./api";

export type AnomalieStatut = "NOUVEAU" | "EN_COURS" | "REOUVERT" | "RESOLU";
export type AnomalieSeverite = "CRITIQUE" | "MAJEURE" | "MINEURE";

export type AnomalieResponse = {
  id: number;
  titre: string;
  description?: string;
  severite: AnomalieSeverite;
  statut: AnomalieStatut;
  priorite: string;
  dateCreation: string;
  dateResolution?: string;
  cas_test_ref?: string;
  cas_test_titre?: string;
  reporter_nom?: string;
  assigned_nom?: string;
};

export const anomaliesService = {
  async getByProject(
    projetId: number,
    statut?: AnomalieStatut,
  ): Promise<AnomalieResponse[]> {
    try {
      const params = statut ? { statut } : {};
      const res = await apiClient.get<AnomalieResponse[]>(
        `/projets/${projetId}/anomalies`,
        { params },
      );
      return res.data ?? [];
    } catch (e: any) {
      if (e?.response?.status === 404) return [];
      handleApiError(e);
    }
  },
};
