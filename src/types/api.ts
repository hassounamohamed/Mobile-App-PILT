// ===== Role & User =====

export interface RoleResponse {
  id: number;
  nom: string;
  code: string;
  /** Présent sur /roles ; peut être absent sur les réponses utilisateur admin. */
  niveau_acces?: number;
}

export interface PermissionResponse {
  id: number;
  nom: string;
  code: string;
  description?: string;
}

export interface UtilisateurResponse {
  id: number;
  email: string;
  nom: string;
  telephone?: string;
  is_active: boolean;
  role?: RoleResponse;
  created_at: string;
}

export interface AssigneeRef {
  id: number;
  nom?: string;
  email?: string;
}

// ===== Projects =====

export interface ProjetResponse {
  id: number;
  nom: string;
  description?: string;
  statut: "ACTIF" | "ARCHIVE" | "TERMINE";
  date_debut?: string;
  date_fin?: string;
  chef_projet?: UtilisateurResponse;
  membres?: UtilisateurResponse[];
  nb_modules?: number;
  nb_epics?: number;
  nb_user_stories?: number;
}

export interface ProjetStats {
  total_projets: number;
  projets_actifs: number;
  total_epics: number;
  total_user_stories: number;
  sante_produit?: number;
  nb_modules?: number;
  nb_sprints?: number;
}

// ===== Modules =====

export interface ModuleResponse {
  id: number;
  nom: string;
  description?: string;
  ordre?: number;
  projet_id: number;
}

// ===== Epics =====

export interface EpicResponse {
  id: number;
  nom: string;
  description?: string;
  priorite: "CRITIQUE" | "HAUTE" | "MOYENNE" | "BASSE";
  statut: "A_FAIRE" | "EN_COURS" | "TERMINE";
  module_id: number;
  projet_id: number;
}

// ===== User Stories =====

export interface UserStoryResponse {
  id: number;
  titre: string;
  description?: string;
  priorite: "CRITIQUE" | "HAUTE" | "MOYENNE" | "BASSE";
  statut: "A_FAIRE" | "EN_COURS" | "A_TESTER" | "TERMINE";
  points?: number;
  module_id?: number;
  epic_id?: number;
  sprint_id?: number;
  assignee?: AssigneeRef;
  assignee_id?: number;
  testeur?: AssigneeRef;
  testeur_id?: number;
  projet_id?: number;
}

// ===== Sprints =====

export interface SprintResponse {
  id: number;
  nom: string;
  objectif?: string;
  date_debut?: string;
  date_fin?: string;
  statut: "PLANIFIE" | "EN_COURS" | "CLOTURE";
  projet_id: number;
  nb_user_stories?: number;
  velocite?: number;
  user_stories?: UserStoryResponse[];
}

export interface SprintVelocite {
  stories_terminees: number;
  points_termines: number;
  taux_completion: number;
}

// ===== Backlog =====

export interface BacklogIndicateurs {
  total: number;
  a_faire: number;
  en_cours: number;
  termine: number;
  sans_sprint: number;
}

// ===== Tests =====

export interface CasTestResponse {
  id: number;
  titre: string;
  description?: string;
  type: "MANUEL" | "AUTOMATISE" | "UNITAIRE";
  statut: "NON_EXECUTE" | "PASSE" | "ECHEC" | "BLOQUE";
  resultat?: string;
  user_story_id?: number;
}

export interface CahierTestResponse {
  id: number;
  titre: string;
  statut: "BROUILLON" | "VALIDE" | "ARCHIVE";
  projet_id: number;
  nb_cas_tests?: number;
  nb_passes?: number;
  nb_echecs?: number;
  created_at?: string;
  cas_tests?: CasTestResponse[];
}

export interface CasTestHistoryEntry {
  id: number;
  statut?: string;
  resultat?: string;
  commentaire?: string;
  created_at?: string;
  user_nom?: string;
  user_email?: string;
  details?: Record<string, unknown>;
}

export interface UnitTestResponse {
  id: number;
  nom: string;
  description?: string;
  statut: "EN_ATTENTE" | "PASSE" | "ECHEC" | "IGNORE";
  user_story_id?: number;
  projet_id?: number;
  last_result?: string;
  created_at?: string;
}

// ===== QA Reports =====

export interface RapportQAResponse {
  id: number;
  titre: string;
  statut: "BROUILLON" | "FINALISE";
  projet_id: number;
  nb_tests_passes?: number;
  nb_tests_echoues?: number;
  nb_tests_bloques?: number;
  score_qualite?: number;
  recommandations?: string;
  created_at: string;
}

// ===== Logs =====

export interface AuditLogResponse {
  id: number;
  action: string;
  resource: string;
  resource_id?: string;
  user_nom: string;
  user_email: string;
  timestamp: string;
  details?: Record<string, unknown>;
}

export interface SystemLogResponse {
  id: number;
  level: "INFO" | "WARNING" | "ERROR" | "CRITICAL";
  message: string;
  source: string;
  timestamp: string;
}

export interface LogStats {
  total_today: number;
  errors_today: number;
  warnings_today: number;
  system_health: number;
}

// ===== Dashboard =====

export interface DashboardActivity {
  labels: string[];
  connexions: number[];
  tests: number[];
}

// ===== Notifications =====

export interface NotificationResponse {
  id: number;
  titre: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

// ===== Pagination =====

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}
