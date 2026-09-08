import type { DatasetPayload, FetchProgress, InstagramAccount } from "@shared/types";

async function readJson<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    throw new Error(payload.error || `Request failed (${response.status})`);
  }
  return payload;
}

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, signal: init?.signal ?? AbortSignal.timeout(180_000) });
  return readJson<T>(response);
}

export async function fetchHealth(): Promise<{ ok: boolean }> {
  return apiFetch("/api/health");
}

export async function fetchProgress(): Promise<FetchProgress> {
  return apiFetch("/api/instagram/status");
}

export async function fetchDataset(): Promise<DatasetPayload> {
  return apiFetch("/api/instagram/reels");
}

export async function refreshDataset(): Promise<DatasetPayload> {
  return apiFetch("/api/instagram/refresh", { method: "POST" });
}

export async function fetchAccount(): Promise<{ account: InstagramAccount; fetchedAt: string }> {
  return apiFetch("/api/instagram/account");
}
