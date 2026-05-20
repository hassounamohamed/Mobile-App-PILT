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

export function getApiBaseUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (typeof envUrl === "string" && envUrl.trim().length > 0) {
    return normalizeBaseUrl(envUrl.trim());
  }

  const host = getHostFromExpo();
  if (host) {
    return `http://${host}:8000`;
  }

  return "http://127.0.0.1:8000";
}

export const API_TIMEOUT_MS = Number(
  process.env.EXPO_PUBLIC_API_TIMEOUT_MS || 30000,
);
