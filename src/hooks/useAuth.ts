import { useCallback } from "react";
import { useAuthStore } from "@/context/authStore";

export const useAuth = () => {
  const auth = useAuthStore();

  return {
    // State
    user: auth.user,
    token: auth.token,
    isLoading: auth.isLoading,
    isAuthenticated: auth.isAuthenticated,
    error: auth.error,

    // Methods
    login: useCallback(
      (email: string, password: string, rememberMe: boolean) =>
        auth.login(email, password, rememberMe),
      [auth],
    ),
    register: useCallback(
      (
        fullName: string,
        email: string,
        phoneNumber: string,
        role: any,
        password: string,
      ) => auth.register(fullName, email, phoneNumber, role, password),
      [auth],
    ),
    logout: useCallback(() => auth.logout(), [auth]),
    forgotPassword: useCallback(
      (email: string) => auth.forgotPassword(email),
      [auth],
    ),
    resetPassword: useCallback(
      (token: string, newPassword: string) =>
        auth.resetPassword(token, newPassword),
      [auth],
    ),
    loginWithGoogle: useCallback(
      (googleToken: string) => auth.loginWithGoogle(googleToken),
      [auth],
    ),
    loginWithGitHub: useCallback(
      (githubToken: string) => auth.loginWithGitHub(githubToken),
      [auth],
    ),
    clearError: useCallback(() => auth.setError(null), [auth]),
  };
};

export const useAuthToken = () => {
  return useAuthStore((state) => state.token);
};

export const useUser = () => {
  return useAuthStore((state) => state.user);
};

export const useIsAuthenticated = () => {
  return useAuthStore((state) => state.isAuthenticated);
};
