import Constants from "expo-constants";

function normalizeBaseUrl(url: string): string {
  const trimmed = url.trim();
  const withScheme = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `http://${trimmed}`;
  return withScheme.replace(/\/+$/, "");
}

function getHostFromExpo(): string | undefined {
  // Common locations across Expo SDK/manifest formats.
  const anyConstants = Constants as any;
  const hostUri =
    anyConstants.expoConfig?.hostUri ||
    anyConstants.manifest2?.extra?.expoClient?.hostUri ||
    anyConstants.manifest?.hostUri;

  if (typeof hostUri !== "string" || hostUri.trim().length === 0) return;

  // hostUri typically looks like "192.168.x.x:8081" or "hostname:8081"
  const match = hostUri.match(/^(?:\w+:\/\/)?([^:/]+)(?::\d+)?/);
  return match?.[1];
}

function getExpoConfiguredApiUrl(): string | undefined {
  const anyConstants = Constants as any;
  const extraApiUrl =
    anyConstants.expoConfig?.extra?.apiUrl ||
    anyConstants.manifest2?.extra?.apiUrl ||
    anyConstants.manifest?.extra?.apiUrl;

  if (typeof extraApiUrl === "string" && extraApiUrl.trim().length > 0) {
    return normalizeBaseUrl(extraApiUrl);
  }
}

export function getApiBaseUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (typeof envUrl === "string" && envUrl.trim().length > 0) {
    return normalizeBaseUrl(envUrl.trim());
  }

  const configuredUrl = getExpoConfiguredApiUrl();
  if (configuredUrl) {
    return configuredUrl;
  }

  const host = getHostFromExpo();
  if (host) {
    return `http://${host}:8000`;
  }

  return "https://flowpilot.tn/api";
}

export const API_TIMEOUT_MS = Number(
  process.env.EXPO_PUBLIC_API_TIMEOUT_MS || 30000,
);
