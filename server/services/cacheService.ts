import type { FetchProgress, InstagramAccount, Reel } from "../../shared/types";

export interface CacheSnapshot {
  profileId: string;
  platform: "instagram" | "facebook";
  account: InstagramAccount;
  reels: Reel[];
  fetchedAt: string;
  status: "success" | "partial";
  mediaCount: number;
  reelCount: number;
  insightsFetched: number;
  insightsFailed: number;
  availableMetrics: string[];
}

interface ProfileCache {
  progress: FetchProgress;
  snapshot: CacheSnapshot | null;
  inflight: Promise<CacheSnapshot> | null;
}

function createProgress(): FetchProgress {
  return {
    phase: "idle",
    message: "Waiting for first sync.",
    mediaFetched: 0,
    insightsDone: 0,
    insightsTotal: 0,
    error: null,
    lastSyncedAt: null,
  };
}

const caches = new Map<string, ProfileCache>();

function getCache(profileId: string): ProfileCache {
  let cache = caches.get(profileId);
  if (!cache) {
    cache = { progress: createProgress(), snapshot: null, inflight: null };
    caches.set(profileId, cache);
  }
  return cache;
}

export function getProgress(profileId: string): FetchProgress {
  return { ...getCache(profileId).progress };
}

export function getSnapshot(profileId: string): CacheSnapshot | null {
  return getCache(profileId).snapshot;
}

export function setProgress(profileId: string, update: Partial<FetchProgress>): void {
  Object.assign(getCache(profileId).progress, update);
}

export function setSnapshot(profileId: string, next: CacheSnapshot): void {
  const cache = getCache(profileId);
  cache.snapshot = next;
  cache.progress.lastSyncedAt = next.fetchedAt;
  cache.progress.phase = "complete";
  cache.progress.message = `Cached ${next.reelCount} Reels.`;
  cache.progress.error = null;
}

export function getInflight(profileId: string): Promise<CacheSnapshot> | null {
  return getCache(profileId).inflight;
}

export function setInflight(profileId: string, promise: Promise<CacheSnapshot> | null): void {
  getCache(profileId).inflight = promise;
}
