import type { FetchProgress, InstagramAccount, Reel } from "../../shared/types";

export interface CacheSnapshot {
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

const progress: FetchProgress = {
  phase: "idle",
  message: "Waiting for first sync.",
  mediaFetched: 0,
  insightsDone: 0,
  insightsTotal: 0,
  error: null,
  lastSyncedAt: null,
};

let snapshot: CacheSnapshot | null = null;
let inflight: Promise<CacheSnapshot> | null = null;

export function getProgress(): FetchProgress {
  return { ...progress };
}

export function getSnapshot(): CacheSnapshot | null {
  return snapshot;
}

export function setProgress(update: Partial<FetchProgress>): void {
  Object.assign(progress, update);
}

export function setSnapshot(next: CacheSnapshot): void {
  snapshot = next;
  progress.lastSyncedAt = next.fetchedAt;
  progress.phase = "complete";
  progress.message = `Cached ${next.reelCount} Reels.`;
  progress.error = null;
}

export function getInflight(): Promise<CacheSnapshot> | null {
  return inflight;
}

export function setInflight(promise: Promise<CacheSnapshot> | null): void {
  inflight = promise;
}
