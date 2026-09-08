import type {
  ConnectedProfile,
  DatasetPayload,
  FetchProgress,
  InstagramAccount,
} from "@shared/types";

const API_BASE = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}

function withProfile(path: string, profileId?: string | null): string {
  if (!profileId) return path;
  const joiner = path.includes("?") ? "&" : "?";
  return `${path}${joiner}profile=${encodeURIComponent(profileId)}`;
}

async function readJson<T>(response: Response): Promise<T> {
  const text = await response.text();
  let payload: (T & { error?: string }) | null = null;

  try {
    payload = text ? (JSON.parse(text) as T & { error?: string }) : null;
  } catch {
    throw new Error(
      `API returned non-JSON (${response.status}). Check VITE_API_URL and that the Render API is running.`,
    );
  }

  if (!response.ok) {
    throw new Error(payload?.error || `Request failed (${response.status})`);
  }

  if (payload === null) {
    throw new Error(`Empty API response (${response.status})`);
  }

  return payload;
}

function toUserError(err: unknown): Error {
  const message = err instanceof Error ? err.message : String(err);
  const name = err instanceof Error ? err.name : "";
  if (
    message.includes("NetworkError") ||
    message === "Failed to fetch" ||
    message === "Load failed" ||
    (name === "TypeError" && /fetch|network/i.test(message))
  ) {
    return new Error(
      "Cannot reach the API from this site (browser blocked the request). Wait for the Render API to redeploy, then retry. If it persists, set CORS_ORIGINS on Render to your Vercel URL.",
    );
  }
  if (name === "TimeoutError" || name === "AbortError") {
    return new Error("The API took too long to respond. Render may be waking up — wait a few seconds and retry.");
  }
  return err instanceof Error ? err : new Error(message);
}

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  try {
    const response = await fetch(apiUrl(url), {
      ...init,
      credentials: "omit",
      mode: "cors",
      signal: init?.signal ?? AbortSignal.timeout(180_000),
    });
    return await readJson<T>(response);
  } catch (err) {
    throw toUserError(err);
  }
}

export async function fetchProfiles(): Promise<{ profiles: ConnectedProfile[]; defaultProfileId: string }> {
  return apiFetch("/api/instagram/profiles");
}

export async function fetchHealth(): Promise<{ ok: boolean }> {
  return apiFetch("/api/health");
}

export async function fetchProgress(profileId: string): Promise<FetchProgress> {
  return apiFetch(withProfile("/api/instagram/status", profileId));
}

export async function fetchDataset(profileId: string): Promise<DatasetPayload> {
  return apiFetch(withProfile("/api/instagram/reels", profileId));
}

export async function refreshDataset(profileId: string): Promise<DatasetPayload> {
  return apiFetch(withProfile("/api/instagram/refresh", profileId), { method: "POST" });
}

export async function fetchAccount(
  profileId: string,
): Promise<{ account: InstagramAccount; fetchedAt: string; profileId: string }> {
  return apiFetch(withProfile("/api/instagram/account", profileId));
}
