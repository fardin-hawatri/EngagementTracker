import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { applyClassification } from "@shared/classifier";
import { computeAnalytics } from "@shared/analytics";
import type {
  AnalyticsBundle,
  ContentType,
  DatasetPayload,
  EnrichedReel,
  FetchProgress,
  ManualOverride,
  Reel,
} from "@shared/types";
import { fetchDataset, fetchProgress, refreshDataset } from "../api/client";
import { reelInDateRange, useFilters } from "./useFilters";

const OVERRIDE_KEY = "content-intel-overrides";

type LoadState = "loading" | "success" | "partial" | "empty" | "error";

interface DatasetContextValue {
  state: LoadState;
  error: string | null;
  progress: FetchProgress | null;
  payload: DatasetPayload | null;
  reels: Reel[];
  filteredReels: Reel[];
  analytics: AnalyticsBundle;
  selectedReelId: string | null;
  selectedReel: EnrichedReel | null;
  setSelectedReelId: (id: string | null) => void;
  refresh: () => Promise<void>;
  refreshing: boolean;
  setOverride: (reelId: string, override: ManualOverride) => void;
  overrides: Record<string, ManualOverride>;
}

const DatasetContext = createContext<DatasetContextValue | null>(null);

function readOverrides(): Record<string, ManualOverride> {
  try {
    const raw = localStorage.getItem(OVERRIDE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, ManualOverride>) : {};
  } catch {
    return {};
  }
}

function applyOverrides(reels: Reel[], overrides: Record<string, ManualOverride>): Reel[] {
  return reels.map((reel) => {
    const override = overrides[reel.id];
    if (!override) return applyClassification(reel);
    return applyClassification(reel, {
      topic: override.topic,
      category: override.category,
      contentType: override.contentType,
    });
  });
}

function matchesSearch(reel: Reel, search: string): boolean {
  if (!search.trim()) return true;
  const q = search.toLowerCase();
  return [reel.title, reel.caption, reel.finalTopic, reel.primaryCategory, reel.contentType, ...(reel.matchedKeywords || [])]
    .join(" ")
    .toLowerCase()
    .includes(q);
}

export function DatasetProvider({ children }: { children: ReactNode }) {
  const filters = useFilters();
  const [payload, setPayload] = useState<DatasetPayload | null>(null);
  const [progress, setProgress] = useState<FetchProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [overrides, setOverrides] = useState<Record<string, ManualOverride>>(readOverrides);
  const [selectedReelId, setSelectedReelId] = useState<string | null>(null);

  const load = useCallback(async (force: boolean) => {
    setError(null);
    if (force) setRefreshing(true);
    else setLoading(true);
    const poll = window.setInterval(async () => {
      try {
        setProgress(await fetchProgress());
      } catch {
        /* ignore poll errors */
      }
    }, 800);
    try {
      const data = force ? await refreshDataset() : await fetchDataset();
      setPayload(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load Instagram data");
    } finally {
      window.clearInterval(poll);
      try {
        setProgress(await fetchProgress());
      } catch {
        /* ignore */
      }
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load(false);
  }, [load]);

  const reels = useMemo(() => (payload ? applyOverrides(payload.reels, overrides) : []), [payload, overrides]);

  const filteredReels = useMemo(() => {
    return reels.filter((reel) => {
      if (!reelInDateRange(reel.publishedAt, filters.date)) return false;
      if (filters.category !== "ALL" && reel.primaryCategory !== filters.category) return false;
      if (filters.topic !== "ALL" && reel.finalTopic !== filters.topic) return false;
      if (filters.contentType !== "ALL" && reel.contentType !== filters.contentType) return false;
      if (!matchesSearch(reel, filters.search)) return false;
      return true;
    });
  }, [reels, filters]);

  const analytics = useMemo(() => computeAnalytics(filteredReels), [filteredReels]);

  const performanceFiltered = useMemo(() => {
    if (filters.performance === "ALL") return analytics;
    const reels = analytics.reels.filter((reel) => {
      if (filters.performance === "BREAKOUT") return reel.isBreakout;
      if (filters.performance === "UNDER") return reel.isUnderperforming;
      if (filters.performance === "ABOVE") return reel.performanceStatus === "ABOVE" || reel.performanceStatus === "BREAKOUT";
      if (filters.performance === "BELOW") return reel.performanceStatus === "BELOW" || reel.performanceStatus === "UNDER";
      return true;
    });
    return { ...analytics, reels };
  }, [analytics, filters.performance]);

  const selectedReel = useMemo(
    () => performanceFiltered.reels.find((reel) => reel.id === selectedReelId) ?? null,
    [performanceFiltered.reels, selectedReelId],
  );

  const setOverride = useCallback((reelId: string, override: ManualOverride) => {
    setOverrides((current) => {
      const next = { ...current, [reelId]: override };
      localStorage.setItem(OVERRIDE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const state: LoadState = loading
    ? "loading"
    : error
      ? "error"
      : !payload
        ? "error"
        : payload.reelCount === 0
          ? "empty"
          : payload.status === "partial"
            ? "partial"
            : "success";

  const value = useMemo<DatasetContextValue>(
    () => ({
      state,
      error,
      progress,
      payload,
      reels,
      filteredReels: performanceFiltered.reels,
      analytics: performanceFiltered,
      selectedReelId,
      selectedReel,
      setSelectedReelId,
      refresh: () => load(true),
      refreshing,
      setOverride,
      overrides,
    }),
    [state, error, progress, payload, reels, performanceFiltered, selectedReelId, selectedReel, load, refreshing, setOverride, overrides],
  );

  return createElement(DatasetContext.Provider, { value }, children);
}

export function useDataset(): DatasetContextValue {
  const value = useContext(DatasetContext);
  if (!value) throw new Error("useDataset must be used within DatasetProvider");
  return value;
}

export function useAvailableTopics(): string[] {
  const { reels } = useDataset();
  return useMemo(() => [...new Set(reels.map((reel) => reel.finalTopic))].sort(), [reels]);
}

export function useAvailableCategories(): string[] {
  const { reels } = useDataset();
  return useMemo(() => [...new Set(reels.map((reel) => reel.primaryCategory))].sort(), [reels]);
}

export function useAvailableContentTypes(): ContentType[] {
  const { reels } = useDataset();
  return useMemo(() => [...new Set(reels.map((reel) => reel.contentType))], [reels]);
}
