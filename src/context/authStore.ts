import { AuthState, User } from "@/types/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { authApi } from "@/services/auth";

interface AuthStore extends AuthState {
  // Hydration
  isInitialized: boolean;
  initAuth: () => void;

  // Auth actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setRefreshToken: (refreshToken: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setRememberMe: (rememberMe: boolean) => void;
  hydrateTokensFromSecureStore: () => Promise<void>;

  // Async actions
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  register: (
    fullName: string,
    email: string,
    phoneNumber: string,
    role: any,
    password: string,
  ) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  loginWithGoogle: (googleToken: string) => Promise<void>;
  loginWithGitHub: (githubToken: string) => Promise<void>;
  refreshAccessToken: () => Promise<void>;

  // Getters
  getUser: () => User | null;
  getToken: () => string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  rememberMe: false,
  isLoading: false,
  error: null,
  isAuthenticated: false,
};

const TOKEN_KEY = "auth-token";
const REFRESH_TOKEN_KEY = "auth-refresh-token";

async function persistSecureTokens(
  rememberMe: boolean,
  token: string | null,
  refreshToken: string | null,
) {
  if (rememberMe && token) {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    if (refreshToken) {
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    } else {
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    }
    return;
  }

  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}


export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      isInitialized: false,

      // Mark hydration complete
      initAuth: () => set({ isInitialized: true }),

      // Simple setters
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => set({ token }),
      setRefreshToken: (refreshToken) => set({ refreshToken }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      setRememberMe: (rememberMe) => set({ rememberMe }),
      hydrateTokensFromSecureStore: async () => {
        const { rememberMe, user } = get();
        if (!rememberMe) return;
        const [token, refreshToken] = await Promise.all([
          SecureStore.getItemAsync(TOKEN_KEY),
          SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
        ]);

        if (token) {
          authApi.setAuthToken(token);
          set({
            token,
            refreshToken: refreshToken ?? null,
            isAuthenticated: !!user,
          });
        }
      },

      // Async login
      login: async (email, password, rememberMe) => {
        set({ isLoading: true, error: null, rememberMe });
        try {
          const response = await authApi.login({ email, password });
          authApi.setAuthToken(response.token);
          set({
            user: response.user,
            token: response.token,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
          await persistSecureTokens(
            rememberMe,
            response.token,
            response.refreshToken,
          );
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Erreur de connexion";
          set({
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      // Async register
      register: async (fullName, email, phoneNumber, role, password) => {
        set({ isLoading: true, error: null });
        try {
          await authApi.register({
            fullName,
            email,
            phoneNumber,
            role,
            password,
          });
          authApi.clearAuthToken();
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Erreur d'inscription";
          set({
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      // Logout
      logout: () => {
        authApi.clearAuthToken();
        void persistSecureTokens(false, null, null);
        set(initialState);
      },

      // Forgot password
      forgotPassword: async (email) => {
        set({ isLoading: true, error: null });
        try {
          await authApi.forgotPassword({ email });
          set({ isLoading: false });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Erreur lors de la demande";
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      // Reset password
      resetPassword: async (token, newPassword) => {
        set({ isLoading: true, error: null });
        try {
          await authApi.resetPassword({ token, newPassword });
          set({ isLoading: false });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Erreur lors de la réinitialisation";
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      // Social login - Google
      loginWithGoogle: async (googleToken) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.loginWithGoogle(googleToken);
          authApi.setAuthToken(response.token);
          set({
            user: response.user,
            token: response.token,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
          await persistSecureTokens(
            get().rememberMe,
            response.token,
            response.refreshToken,
          );
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Erreur Google";
          set({
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      // Social login - GitHub
      loginWithGitHub: async (githubToken) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.loginWithGitHub(githubToken);
          authApi.setAuthToken(response.token);
          set({
            user: response.user,
            token: response.token,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
          await persistSecureTokens(
            get().rememberMe,
            response.token,
            response.refreshToken,
          );
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Erreur GitHub";
          set({
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      // Refresh token
      refreshAccessToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) {
          set({ isAuthenticated: false });
          return;
        }

        try {
          const response = await authApi.refreshToken(refreshToken);
          authApi.setAuthToken(response.token);
          set({
            token: response.token,
            refreshToken: response.refreshToken,
          });
          await persistSecureTokens(
            get().rememberMe,
            response.token,
            response.refreshToken,
          );
        } catch (error) {
          set({ isAuthenticated: false });
          authApi.clearAuthToken();
          throw error;
        }
      },

      // Getters
      getUser: () => get().user,
      getToken: () => get().token,
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        rememberMe: state.rememberMe,
        ...(state.rememberMe
          ? {
              user: state.user,
              isAuthenticated: state.isAuthenticated,
            }
          : {}),
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        void state.hydrateTokensFromSecureStore();
      },
    },
  ),
);
