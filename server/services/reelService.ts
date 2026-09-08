import { applyClassification } from "../../shared/classifier";
import { deriveTitle } from "../../shared/format";
import type { Reel } from "../../shared/types";
import { fetchAccount } from "../instagram/account";
import { mapPool } from "../instagram/client";
import { fetchMediaInsights } from "../instagram/insights";
import { fetchAllMedia, isReel } from "../instagram/media";
import { getInflight, getSnapshot, setInflight, setProgress, setSnapshot, type CacheSnapshot } from "./cacheService";

const INSIGHT_CONCURRENCY = 8;

export async function loadDataset(force = false): Promise<CacheSnapshot> {
  const cached = getSnapshot();
  if (cached && !force) return cached;
  const existing = getInflight();
  if (existing) return existing;

  const promise = refreshDataset();
  setInflight(promise);
  try {
    return await promise;
  } finally {
    setInflight(null);
  }
}

async function refreshDataset(): Promise<CacheSnapshot> {
  setProgress({
    phase: "account",
    message: "Connecting to Instagram",
    mediaFetched: 0,
    insightsDone: 0,
    insightsTotal: 0,
    error: null,
  });

  const account = await fetchAccount();

  setProgress({ phase: "media", message: "Fetching Reel dataset..." });
  const media = await fetchAllMedia((count) => {
    setProgress({ mediaFetched: count, message: `Fetching media page · ${count} items` });
  });

  const reelsMedia = media.filter(isReel);
  setProgress({
    phase: "insights",
    message: "Analyzing content...",
    insightsTotal: reelsMedia.length,
    insightsDone: 0,
  });

  const insightResults = await mapPool(
    reelsMedia,
    INSIGHT_CONCURRENCY,
    async (item) => {
      try {
        return await fetchMediaInsights(item.id);
      } catch {
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
    },
    (done) => {
      setProgress({
        insightsDone: done,
        message: `Building intelligence... ${done}/${reelsMedia.length} insight requests`,
      });
    },
  );

  let insightsFetched = 0;
  let insightsFailed = 0;
  const metricSet = new Set<string>();

  const reels: Reel[] = reelsMedia.map((item, index) => {
    const insight = insightResults[index];
    const likes = insight.likes ?? item.like_count ?? null;
    const comments = insight.comments ?? item.comments_count ?? null;
    const views = insight.views;
    const insightsAvailable = views !== null;
    if (insight.ok || insightsAvailable) insightsFetched += 1;
    else insightsFailed += 1;
    insight.available.forEach((metric) => metricSet.add(metric));
    if (likes !== null) metricSet.add("likes");
    if (comments !== null) metricSet.add("comments");

    return applyClassification({
      id: item.id,
      caption: item.caption ?? "",
      permalink: item.permalink ?? null,
      publishedAt: item.timestamp ?? new Date().toISOString(),
      mediaType: item.media_type ?? "VIDEO",
      mediaProductType: item.media_product_type ?? "REELS",
      thumbnailUrl: item.thumbnail_url ?? item.media_url ?? null,
      mediaUrl: item.media_url ?? null,
      views,
      likes,
      comments,
      shares: insight.shares,
      saved: insight.saved,
      reach: insight.reach,
      insightsAvailable,
      availableMetrics: Array.from(
        new Set([
          ...insight.available,
          ...(likes !== null ? ["likes"] : []),
          ...(comments !== null ? ["comments"] : []),
        ]),
      ),
      title: deriveTitle(item.caption ?? ""),
    });
  });

  const snapshot = {
    account,
    reels,
    fetchedAt: new Date().toISOString(),
    status: insightsFailed > 0 ? ("partial" as const) : ("success" as const),
    mediaCount: media.length,
    reelCount: reels.length,
    insightsFetched,
    insightsFailed,
    availableMetrics: [...metricSet],
  };

  setSnapshot(snapshot);
  return snapshot;
}
