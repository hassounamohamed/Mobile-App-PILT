import { API_TIMEOUT_MS, getApiBaseUrl } from "@/config/apiBaseUrl";
import {
    AuthResponse,
    FlowPilotAuthResponse,
    FlowPilotRegisterRequest,
    ForgotPasswordRequest,
    LoginCredentials,
    RegisterCredentials,
    ResetPasswordRequest,
} from "@/types/auth";
import axios, { AxiosInstance } from "axios";

// Configure with FlowPilot backend URL
const API_BASE_URL = getApiBaseUrl();

// Type for FlowPilot API responses
interface FlowPilotTokenRole {
  id: number;
  nom: string;
  code: string;
  niveau_acces: number;
}

interface FlowPilotMeResponse {
  id: number;
  email: string;
  nom: string;
  telephone?: string;
  role?: FlowPilotTokenRole;
  created_at?: string;
}

interface FlowPilotRegisterResponse {
  message: string;
  user_id: number;
  role_id: number;
}

class AuthApi {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_TIMEOUT_MS,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  setAuthToken(token: string) {
    this.axiosInstance.defaults.headers.common["Authorization"] =
      `Bearer ${token}`;
  }

  clearAuthToken() {
    delete this.axiosInstance.defaults.headers.common["Authorization"];
  }

  /**
   * Transform FlowPilot API response to app format
   */
  private transformFlowPilotResponse(
    FlowPilotResponse: FlowPilotAuthResponse,
  ): AuthResponse {
    return {
      user: {
        id: FlowPilotResponse.user_id.toString(),
        email: FlowPilotResponse.email,
        fullName: FlowPilotResponse.nom,
        phoneNumber: "", // Backend doesn't return phone in auth response
        role: this.getRoleFromCode(FlowPilotResponse.role?.code),
        createdAt: new Date().toISOString(),
      },
      token: FlowPilotResponse.access_token,
      refreshToken: "", // FlowPilot doesn't use refresh tokens in auth response
    };
  }

  /**
   * Convert FlowPilot role code to app role name
   */
  private getRoleFromCode(
    code?: string,
  ):
    | "Super Admin"
    | "Développeur"
    | "Testeur QA"
    | "Product Owner"
    | "Scrum Master" {
    const normalizedCode = code?.toUpperCase();

    switch (normalizedCode) {
      case "SUPER_ADMIN":
      case "SUPERADMIN":
      case "SUPER_ADMINISTRATEUR":
        return "Super Admin";
      case "DEVELOPPEUR":
        return "Développeur";
      case "TESTEUR_QA":
        return "Testeur QA";
      case "PRODUCT_OWNER":
        return "Product Owner";
      case "SCRUM_MASTER":
        return "Scrum Master";
      default:
        return "Développeur"; // Default role
    }
  }

  /**
   * Convert app role name to FlowPilot role ID
   */
  private getRoleId(role: string): number {
    switch (role) {
      case "Super Admin":
        return 1;
      case "Développeur":
        return 2;
      case "Testeur QA":
        return 3;
      case "Product Owner":
        return 4;
      case "Scrum Master":
        return 5;
      default:
        return 2; // Default to DEVELOPPEUR
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // FlowPilot uses OAuth2PasswordRequestForm (username/password)
      const formData = new URLSearchParams();
      formData.append("username", credentials.email);
      formData.append("password", credentials.password);

      const response = await this.axiosInstance.post<FlowPilotAuthResponse>(
        "/auth/login",
        formData,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
      );

      const authResponse = this.transformFlowPilotResponse(response.data);
      this.setAuthToken(authResponse.token);

      // If role is not present in token payload, fetch /auth/me to resolve exact role.
      if (!response.data.role?.code) {
        try {
          const me =
            await this.axiosInstance.get<FlowPilotMeResponse>("/auth/me");
          authResponse.user = {
            ...authResponse.user,
            id: me.data.id.toString(),
            email: me.data.email,
            fullName: me.data.nom,
            phoneNumber: me.data.telephone ?? "",
            role: this.getRoleFromCode(me.data.role?.code),
            createdAt: me.data.created_at ?? authResponse.user.createdAt,
          };
        } catch {
          // Keep auth response from login when /auth/me is unavailable.
        }
      }

      return authResponse;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async register(
    credentials: RegisterCredentials,
  ): Promise<FlowPilotRegisterResponse> {
    try {
      // Transform app format to FlowPilot format
      const FlowPilotRequest: FlowPilotRegisterRequest = {
        nom: credentials.fullName,
        email: credentials.email,
        motDePasse: credentials.password,
        telephone: credentials.phoneNumber || undefined,
        role_id: this.getRoleId(credentials.role),
      };

      const response = await this.axiosInstance.post<FlowPilotRegisterResponse>(
        "/auth/register",
        FlowPilotRequest,
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async forgotPassword(
    request: ForgotPasswordRequest,
  ): Promise<{ message: string }> {
    try {
      const response = await this.axiosInstance.post<{ message: string }>(
        "/auth/request-reset-password",
        { email: request.email },
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async resetPassword(
    request: ResetPasswordRequest,
  ): Promise<{ message: string }> {
    try {
      const response = await this.axiosInstance.post<{ message: string }>(
        "/auth/reset-password",
        {
          token: request.token,
          new_password: request.newPassword,
        },
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async selectRole(userId: number, role: string): Promise<AuthResponse> {
    try {
      const response = await this.axiosInstance.post<FlowPilotAuthResponse>(
        "/auth/select-role",
        {
          user_id: userId,
          role: this.getRoleId(role),
        },
      );

      const authResponse = this.transformFlowPilotResponse(response.data);
      this.setAuthToken(authResponse.token);
      return authResponse;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async loginWithGoogle(googleToken: string): Promise<AuthResponse> {
    try {
      // FlowPilot OAuth callback would handle this
      // For now, redirect to FlowPilot OAuth login flow
      throw new Error(
        "Google login via FlowPilot is handled through OAuth callback",
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async loginWithGitHub(githubToken: string): Promise<AuthResponse> {
    try {
      // FlowPilot OAuth callback would handle this
      // For now, redirect to FlowPilot OAuth login flow
      throw new Error(
        "GitHub login via FlowPilot is handled through OAuth callback",
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const response = await this.axiosInstance.post<FlowPilotAuthResponse>(
        "/auth/refresh",
        { refresh_token: refreshToken },
      );

      const authResponse = this.transformFlowPilotResponse(response.data);
      this.setAuthToken(authResponse.token);
      return authResponse;
    } catch {
      throw new Error("Session expirée, veuillez vous reconnecter.");
    }
  }

  getOAuthLoginUrl(
    provider: "google" | "github",
    intent: "login" | "register" = "login",
  ): string {
    const intentParam = intent === "register" ? "?intent=register" : "";
    return `${API_BASE_URL}/auth/oauth/${provider}/login${intentParam}`;
  }

  private handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
        return new Error(
          `Request timeout after ${API_TIMEOUT_MS}ms. Verify backend availability and EXPO_PUBLIC_API_URL (${API_BASE_URL}).`,
        );
      }

      if (error.message === "Network Error") {
        return new Error(
          `Network Error: Backend error check: EXPO_PUBLIC_API_URL (${API_BASE_URL}) and which serveur.`,
        );
      }

      const detail = error.response?.data?.detail;
      const message =
        (typeof detail === "string" ? detail : undefined) ||
        error.response?.data?.message ||
        error.message;
      return new Error(message);
    }
    return error instanceof Error
      ? error
      : new Error("Une erreur est survenue");
  }
}

export const authApi = new AuthApi();
