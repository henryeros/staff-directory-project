
export type     AppConfig = {
  API_BASE_URL?: string;
};

declare global {
  // eslint-disable-next-line no-var
  var __APP_CONFIG__:
    | (AppConfig & { __loaded?: boolean })
    | undefined;
}

function normalizeBaseUrl(url?: string): string | undefined {
  if (!url) return undefined;
  return url.replace(/\/$/, "");
}

export function getConfig(): AppConfig {
  // Prefer env var when available (works on server and client during build/runtime)
  const envUrl =
    typeof process !== "undefined" ? process.env.NEXT_PUBLIC_API_BASE_URL : undefined;

    if (envUrl && envUrl.length > 0) {
        return { API_BASE_URL: normalizeBaseUrl(envUrl) };
  }

  // On the client, use the preloaded global if available
  if (typeof window !== "undefined" && globalThis.__APP_CONFIG__) {
      return {
      ...globalThis.__APP_CONFIG__,
      API_BASE_URL: normalizeBaseUrl(globalThis.__APP_CONFIG__?.API_BASE_URL),
    } as AppConfig;
  }
  // Fallback: return empty; callers should handle empty baseUrl (relative requests)
  return {};
}

// Optional async loader to populate global config from /config.json on the client.
export async function loadRuntimeConfig(force = false): Promise<AppConfig> {
  if (typeof window === "undefined") return getConfig();
  if (!force && globalThis.__APP_CONFIG__?.__loaded) return getConfig();

  try {
    const res = await fetch("/config.json", { cache: "no-store" });
    if (res.ok) {
      const cfg = (await res.json()) as AppConfig;
      globalThis.__APP_CONFIG__ = { ...cfg, __loaded: true } as any;
    }
  } catch {
    // ignore fetch errors; getConfig will fall back
  }
  return getConfig();
}
