import { getActiveProfile } from "../profiles/context";
import { InstagramApiError, igFetch } from "./client";

export interface InsightBag {
  views: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  saved: number | null;
  reach: number | null;
  totalInteractions: number | null;
  available: string[];
  ok: boolean;
}

interface InsightEntry {
  name?: string;
  values?: Array<{ value?: number }>;
  value?: number;
}

interface InsightsResponse {
  data?: InsightEntry[];
}

const METRIC_SETS = [
  "views,likes,comments,shares,saved,reach,total_interactions",
  "views,likes,comments,shares,saved",
  "views,likes,comments",
  "views,likes",
  "views",
  "plays,likes,comments",
  "plays",
];

const workingMetricSets = new Map<string, string>();

function readMetric(entry: InsightEntry): number | null {
  if (typeof entry.value === "number") return entry.value;
  const value = entry.values?.[0]?.value;
  return typeof value === "number" ? value : null;
}

function parseInsights(payload: InsightsResponse): InsightBag {
  const bag: InsightBag = {
    views: null,
    likes: null,
    comments: null,
    shares: null,
    saved: null,
    reach: null,
    totalInteractions: null,
    available: [],
    ok: false,
  };

  for (const entry of payload.data ?? []) {
    const name = entry.name;
    const value = readMetric(entry);
    if (!name || value === null) continue;
    if (name === "views" || name === "plays") {
      bag.views = value;
      bag.available.push("views");
    } else if (name === "likes") {
      bag.likes = value;
      bag.available.push("likes");
    } else if (name === "comments") {
      bag.comments = value;
      bag.available.push("comments");
    } else if (name === "shares") {
      bag.shares = value;
      bag.available.push("shares");
    } else if (name === "saved" || name === "saves") {
      bag.saved = value;
      bag.available.push("saved");
    } else if (name === "reach") {
      bag.reach = value;
      bag.available.push("reach");
    } else if (name === "total_interactions") {
      bag.totalInteractions = value;
      bag.available.push("total_interactions");
    }
  }

  bag.ok = bag.views !== null || bag.likes !== null || bag.comments !== null;
  bag.available = Array.from(new Set(bag.available));
  return bag;
}

export async function fetchMediaInsights(mediaId: string): Promise<InsightBag> {
  const profileId = getActiveProfile().id;
  let lastError: unknown = null;
  const preferred = workingMetricSets.get(profileId) ?? null;
  const sets = preferred ? [preferred, ...METRIC_SETS.filter((item) => item !== preferred)] : METRIC_SETS;
  for (const metric of sets) {
    try {
      const payload = await igFetch<InsightsResponse>(`/${mediaId}/insights`, { metric });
      const parsed = parseInsights(payload);
      if (parsed.ok || (payload.data && payload.data.length > 0)) {
        workingMetricSets.set(profileId, metric);
        return parsed;
      }
    } catch (error) {
      lastError = error;
      if (error instanceof InstagramApiError && error.status === 400) continue;
    }
  }
  if (lastError instanceof InstagramApiError && lastError.status !== 400) {
    throw lastError;
  }
  return {
    views: null,
    likes: null,
    comments: null,
    shares: null,
    saved: null,
    reach: null,
    totalInteractions: null,
    available: [],
    ok: false,
  };
}
