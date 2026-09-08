import type {
  AnalyticsBundle,
  AccountSummary,
  CategoryStats,
  ContentTypeStats,
  DistributionBucket,
  EnrichedReel,
  InsightCard,
  OpportunityQuadrant,
  PerformanceStatus,
  Reel,
  TimePoint,
  TopicStats,
} from "./types";
import { CATEGORIES } from "./taxonomy";
import { clamp, engagementRate, mean, median, stddev } from "./format";

const BREAKOUT_TOPIC_MULTIPLIER = 2.5;
const BREAKOUT_ACCOUNT_MULTIPLIER = 3;
const UNDER_TOPIC_RATIO = 0.5;
const UNDER_ACCOUNT_RATIO = 0.5;

function numeric(values: Array<number | null | undefined>): number[] {
  return values.filter((value): value is number => typeof value === "number" && Number.isFinite(value));
}

function ratio(value: number | null, baseline: number | null): number | null {
  if (value === null || baseline === null || baseline === 0) return null;
  return ((value - baseline) / baseline) * 100;
}

function multiplier(value: number | null, baseline: number | null): number | null {
  if (value === null || baseline === null || baseline === 0) return null;
  const result = value / baseline;
  return Number.isFinite(result) ? result : null;
}

function performanceStatus(
  views: number | null,
  topicAvg: number | null,
  accountAvg: number | null,
): { status: PerformanceStatus; isBreakout: boolean; isUnderperforming: boolean; score: number | null } {
  if (views === null) {
    return { status: "UNAVAILABLE", isBreakout: false, isUnderperforming: false, score: null };
  }
  const topicMult = multiplier(views, topicAvg);
  const accountMult = multiplier(views, accountAvg);
  const isBreakout =
    (topicMult !== null && topicMult >= BREAKOUT_TOPIC_MULTIPLIER) ||
    (accountMult !== null && accountMult >= BREAKOUT_ACCOUNT_MULTIPLIER);
  const isUnderperforming =
    !isBreakout &&
    ((topicMult !== null && topicMult <= UNDER_TOPIC_RATIO) ||
      (accountMult !== null && accountMult <= UNDER_ACCOUNT_RATIO));

  let status: PerformanceStatus = "NEAR";
  if (isBreakout) status = "BREAKOUT";
  else if (topicMult !== null && topicMult >= 1.15) status = "ABOVE";
  else if (topicMult !== null && topicMult <= 0.7) status = "UNDER";
  else if (topicMult !== null && topicMult < 0.9) status = "BELOW";

  const scoreBase = topicMult ?? accountMult;
  const score = scoreBase === null ? null : clamp(scoreBase * 40, 0, 100);

  return { status, isBreakout, isUnderperforming, score };
}

function opportunityQuadrant(
  topicAvg: number | null,
  accountAvg: number | null,
  topicEng: number | null,
  accountEng: number | null,
): { quadrant: OpportunityQuadrant; reachBand: "HIGH" | "LOW"; engagementBand: "HIGH" | "LOW" } {
  const highReach = topicAvg !== null && accountAvg !== null && topicAvg >= accountAvg;
  const highEng = topicEng !== null && accountEng !== null && topicEng >= accountEng;
  const reachBand = highReach ? "HIGH" : "LOW";
  const engagementBand = highEng ? "HIGH" : "LOW";
  let quadrant: OpportunityQuadrant = "REVIEW";
  if (highReach && highEng) quadrant = "DOUBLE_DOWN";
  else if (highReach && !highEng) quadrant = "OPTIMIZE";
  else if (!highReach && highEng) quadrant = "EXPLORE";
  return { quadrant, reachBand, engagementBand };
}

export function summarizeAccount(reels: Reel[]): AccountSummary {
  const views = numeric(reels.map((reel) => reel.views));
  const likes = numeric(reels.map((reel) => reel.likes));
  const comments = numeric(reels.map((reel) => reel.comments));
  const totalViews = views.reduce((sum, value) => sum + value, 0);
  const totalLikes = likes.reduce((sum, value) => sum + value, 0);
  const totalComments = comments.reduce((sum, value) => sum + value, 0);
  const averageViews = mean(views);
  return {
    totalReels: reels.length,
    reelsWithViews: views.length,
    totalViews,
    totalLikes,
    totalComments,
    averageViews,
    medianViews: median(views),
    averageLikes: mean(likes),
    averageComments: mean(comments),
    engagementRate: engagementRate(totalLikes, totalComments, totalViews || null),
  };
}

function buildTopicStats(reels: Reel[], accountAvg: number | null, accountEng: number | null): TopicStats[] {
  const groups = new Map<string, Reel[]>();
  for (const reel of reels) {
    const key = reel.finalTopic || "Uncategorized";
    const list = groups.get(key) ?? [];
    list.push(reel);
    groups.set(key, list);
  }

  const stats: TopicStats[] = [];
  for (const [topic, group] of groups) {
    const views = numeric(group.map((reel) => reel.views));
    const likes = numeric(group.map((reel) => reel.likes));
    const comments = numeric(group.map((reel) => reel.comments));
    const totalViews = views.reduce((sum, value) => sum + value, 0);
    const totalLikes = likes.reduce((sum, value) => sum + value, 0);
    const totalComments = comments.reduce((sum, value) => sum + value, 0);
    const averageViews = mean(views);
    const engagement = engagementRate(totalLikes, totalComments, totalViews || null);
    const spread = stddev(views);
    const consistency =
      averageViews && spread !== null && averageViews > 0
        ? clamp(100 * (1 - spread / averageViews), 0, 100)
        : views.length <= 1
          ? 100
          : null;
    const top = [...group].sort((a, b) => (b.views ?? -1) - (a.views ?? -1))[0];
    const vsAccount = ratio(averageViews, accountAvg);
    const vsAccountMultiplier = multiplier(averageViews, accountAvg);
    const { quadrant, reachBand, engagementBand } = opportunityQuadrant(
      averageViews,
      accountAvg,
      engagement,
      accountEng,
    );
    const performanceScore =
      vsAccountMultiplier === null
        ? null
        : clamp(50 + vsAccountMultiplier * 20 + (engagement ?? 0) * 2, 0, 100);

    stats.push({
      topic,
      category: group[0]?.primaryCategory || "GENERAL",
      reelCount: group.length,
      totalViews,
      averageViews,
      medianViews: median(views),
      minViews: views.length ? Math.min(...views) : null,
      maxViews: views.length ? Math.max(...views) : null,
      averageLikes: mean(likes),
      averageComments: mean(comments),
      totalLikes,
      totalComments,
      engagement,
      vsAccount,
      vsAccountMultiplier,
      performanceScore,
      consistency,
      topReelId: top?.id ?? null,
      topReelTitle: top?.title ?? null,
      topReelViews: top?.views ?? null,
      quadrant,
      reachBand,
      engagementBand,
    });
  }

  stats.sort((a, b) => (b.averageViews ?? -1) - (a.averageViews ?? -1));
  return stats;
}

function buildCategories(reels: Reel[]): CategoryStats[] {
  const groups = new Map<string, Reel[]>();
  for (const reel of reels) {
    const key = reel.primaryCategory || "GENERAL";
    const list = groups.get(key) ?? [];
    list.push(reel);
    groups.set(key, list);
  }
  const total = reels.length || 1;
  const stats: CategoryStats[] = [];
  for (const category of [...CATEGORIES.map((item) => item.id), ...groups.keys()]) {
    const group = groups.get(category);
    if (!group || stats.some((item) => item.category === category)) continue;
    const views = numeric(group.map((reel) => reel.views));
    const totalViews = views.reduce((sum, value) => sum + value, 0);
    const likes = numeric(group.map((reel) => reel.likes)).reduce((sum, value) => sum + value, 0);
    const comments = numeric(group.map((reel) => reel.comments)).reduce((sum, value) => sum + value, 0);
    stats.push({
      category,
      reelCount: group.length,
      percentage: (group.length / total) * 100,
      totalViews,
      averageViews: mean(views),
      engagement: engagementRate(likes, comments, totalViews || null),
    });
  }
  stats.sort((a, b) => b.reelCount - a.reelCount);
  return stats;
}

function buildContentTypes(reels: Reel[], accountAvg: number | null): ContentTypeStats[] {
  const groups = new Map<string, Reel[]>();
  for (const reel of reels) {
    const list = groups.get(reel.contentType) ?? [];
    list.push(reel);
    groups.set(reel.contentType, list);
  }
  return [...groups.entries()]
    .map(([contentType, group]) => {
      const views = numeric(group.map((reel) => reel.views));
      const totalViews = views.reduce((sum, value) => sum + value, 0);
      const likes = numeric(group.map((reel) => reel.likes)).reduce((sum, value) => sum + value, 0);
      const comments = numeric(group.map((reel) => reel.comments)).reduce((sum, value) => sum + value, 0);
      const averageViews = mean(views);
      const mult = multiplier(averageViews, accountAvg);
      return {
        contentType: contentType as ContentTypeStats["contentType"],
        reelCount: group.length,
        averageViews,
        engagement: engagementRate(likes, comments, totalViews || null),
        performanceScore: mult === null ? null : clamp(mult * 40, 0, 100),
      };
    })
    .sort((a, b) => (b.averageViews ?? -1) - (a.averageViews ?? -1));
}

function enrichReels(reels: Reel[], topics: TopicStats[], accountAvg: number | null): EnrichedReel[] {
  const topicMap = new Map(topics.map((topic) => [topic.topic, topic]));
  return reels.map((reel) => {
    const topic = topicMap.get(reel.finalTopic);
    const topicAvg = topic?.averageViews ?? null;
    const engagement = engagementRate(reel.likes, reel.comments, reel.views);
    const { status, isBreakout, isUnderperforming, score } = performanceStatus(
      reel.views,
      topicAvg,
      accountAvg,
    );
    return {
      ...reel,
      engagement,
      topicAverageViews: topicAvg,
      accountAverageViews: accountAvg,
      viewsVsTopic: ratio(reel.views, topicAvg),
      viewsVsAccount: ratio(reel.views, accountAvg),
      topicMultiplier: multiplier(reel.views, topicAvg),
      accountMultiplier: multiplier(reel.views, accountAvg),
      performanceScore: score,
      performanceStatus: status,
      isBreakout,
      isUnderperforming,
    };
  });
}

function buildTimeSeries(reels: Reel[], accountAvg: number | null): TimePoint[] {
  const buckets = new Map<string, Reel[]>();
  for (const reel of reels) {
    const date = new Date(reel.publishedAt);
    if (Number.isNaN(date.getTime())) continue;
    const week = new Date(date);
    const day = week.getDay();
    week.setDate(week.getDate() - day);
    const weekKey = `${week.getFullYear()}-${String(week.getMonth() + 1).padStart(2, "0")}-${String(week.getDate()).padStart(2, "0")}`;
    const list = buckets.get(weekKey) ?? [];
    list.push(reel);
    buckets.set(weekKey, list);
  }
  return [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, group]) => {
      const views = numeric(group.map((reel) => reel.views)).reduce((sum, value) => sum + value, 0);
      const likes = numeric(group.map((reel) => reel.likes)).reduce((sum, value) => sum + value, 0);
      const comments = numeric(group.map((reel) => reel.comments)).reduce((sum, value) => sum + value, 0);
      return {
        date,
        label: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        views,
        likes,
        comments,
        engagement: engagementRate(likes, comments, views || null),
        reelCount: group.length,
        benchmark: accountAvg,
      };
    });
}

export function buildTopicTimeSeries(reels: Reel[], topic: string, accountAvg: number | null): TimePoint[] {
  return buildTimeSeries(
    reels.filter((reel) => reel.finalTopic === topic),
    accountAvg,
  );
}

export function buildDistribution(reels: Reel[]): DistributionBucket[] {
  const views = numeric(reels.map((reel) => reel.views)).sort((a, b) => a - b);
  if (views.length === 0) return [];
  const max = Math.max(...views);
  const step = max <= 20_000 ? 5_000 : max <= 80_000 ? 20_000 : max <= 200_000 ? 40_000 : 100_000;
  const buckets: DistributionBucket[] = [];
  for (let min = 0; min < max + step; min += step) {
    const maxBound = min + step;
    const count = views.filter((value) => value >= min && (maxBound > max ? value >= min : value < maxBound)).length;
    if (min > max && count === 0) break;
    buckets.push({
      label: min === 0 ? `0 – ${formatBucket(maxBound)}` : `${formatBucket(min)} – ${formatBucket(maxBound)}`,
      min,
      max: maxBound,
      count,
      percentage: (count / views.length) * 100,
    });
    if (maxBound > max) break;
  }
  return buckets.filter((bucket, index, list) => bucket.count > 0 || index === list.length - 1);
}

function formatBucket(value: number): string {
  if (value >= 1_000_000) return `${value / 1_000_000}M`;
  if (value >= 1_000) return `${value / 1_000}K`;
  return String(value);
}

function buildInsights(
  summary: AccountSummary,
  topics: TopicStats[],
  contentTypes: ContentTypeStats[],
  breakouts: EnrichedReel[],
  underperformers: EnrichedReel[],
): InsightCard[] {
  const cards: InsightCard[] = [];
  const strongest = topics[0];
  const weakest = [...topics].reverse().find((topic) => topic.reelCount >= 2) ?? topics[topics.length - 1];
  if (strongest) {
    cards.push({
      id: "strongest",
      section: "STRONGEST",
      title: strongest.topic,
      observation: `${strongest.topic} is the strongest topic in the current dataset.`,
      data: `${strongest.reelCount} Reels · ${formatMaybe(strongest.averageViews)} avg views · ${formatPct(strongest.engagement)} engagement`,
      comparison:
        strongest.vsAccountMultiplier !== null
          ? `Averages ${strongest.vsAccountMultiplier.toFixed(1)}× the account benchmark.`
          : "Account benchmark comparison is unavailable without view metrics.",
      action: `Increase production cadence for ${strongest.topic}; it currently carries the highest average reach.`,
      topic: strongest.topic,
    });
  }
  if (weakest && weakest.topic !== strongest?.topic) {
    cards.push({
      id: "weakest",
      section: "WEAKEST",
      title: weakest.topic,
      observation: `${weakest.topic} is among the weakest topics by average views.`,
      data: `${weakest.reelCount} Reels · ${formatMaybe(weakest.averageViews)} avg views · ${formatPct(weakest.engagement)} engagement`,
      comparison:
        weakest.vsAccount !== null
          ? `${weakest.vsAccount.toFixed(1)}% vs account average.`
          : "Insufficient view data for a benchmark comparison.",
      action: `Pause or reformat ${weakest.topic} until a clearer hook/format pattern outperforms the account floor.`,
      topic: weakest.topic,
    });
  }
  if (breakouts[0]) {
    const reel = breakouts[0];
    cards.push({
      id: "breakout-pattern",
      section: "BREAKOUT",
      title: reel.title,
      observation: "Breakout Reels cluster around topics that already beat account reach.",
      data: `${reel.title} reached ${formatMaybe(reel.views)} views with ${formatPct(reel.engagement)} engagement.`,
      comparison:
        reel.topicMultiplier !== null
          ? `${reel.topicMultiplier.toFixed(1)}× its topic average (${reel.finalTopic}).`
          : "Topic multiplier unavailable.",
      action: `Replicate the ${reel.contentType} format used in this ${reel.finalTopic} Reel.`,
      topic: reel.finalTopic,
    });
  }
  if (underperformers[0]) {
    const reel = underperformers[0];
    cards.push({
      id: "under-pattern",
      section: "UNDERPERFORMING",
      title: reel.finalTopic,
      observation: "Underperforming Reels are concentrated in topics below the account floor.",
      data: `${reel.title} generated ${formatMaybe(reel.views)} views.`,
      comparison:
        reel.viewsVsTopic !== null
          ? `${reel.viewsVsTopic.toFixed(0)}% vs ${reel.finalTopic} average.`
          : "Topic comparison unavailable.",
      action: "Review hooks and thumbnail framing on below-benchmark posts before repeating the format.",
      topic: reel.finalTopic,
    });
  }
  const doubleDown = topics.filter((topic) => topic.quadrant === "DOUBLE_DOWN");
  if (doubleDown[0]) {
    cards.push({
      id: "opportunity",
      section: "OPPORTUNITY",
      title: "Double down",
      observation: `${doubleDown.map((topic) => topic.topic).slice(0, 3).join(", ")} combine above-average reach with above-average engagement.`,
      data: `${doubleDown.length} topic${doubleDown.length === 1 ? "" : "s"} sit in the DOUBLE DOWN quadrant.`,
      comparison: `Account average is ${formatMaybe(summary.averageViews)} views at ${formatPct(summary.engagementRate)} engagement.`,
      action: "Allocate the next production block to these topics first.",
      topic: doubleDown[0].topic,
    });
  }
  if (contentTypes[0]) {
    const format = contentTypes[0];
    cards.push({
      id: "format",
      section: "FORMAT",
      title: format.contentType,
      observation: `${format.contentType} is the highest-reaching content type in the filtered dataset.`,
      data: `${format.reelCount} Reels · ${formatMaybe(format.averageViews)} avg views · ${formatPct(format.engagement)} engagement`,
      comparison: "Content type is scored independently from topic taxonomy.",
      action: `Produce more ${format.contentType} Reels inside winning topics.`,
    });
  }
  return cards;
}

function formatMaybe(value: number | null | undefined): string {
  if (value === null || value === undefined) return "Unavailable";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return Math.round(value).toLocaleString("en-US");
}

function formatPct(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "Unavailable";
  return `${value.toFixed(1)}%`;
}

export function computeAnalytics(reels: Reel[]): AnalyticsBundle {
  const summary = summarizeAccount(reels);
  const topics = buildTopicStats(reels, summary.averageViews, summary.engagementRate);
  const categories = buildCategories(reels);
  const contentTypes = buildContentTypes(reels, summary.averageViews);
  const enriched = enrichReels(reels, topics, summary.averageViews);
  const breakouts = [...enriched]
    .filter((reel) => reel.isBreakout)
    .sort((a, b) => (b.topicMultiplier ?? b.accountMultiplier ?? 0) - (a.topicMultiplier ?? a.accountMultiplier ?? 0));
  const underperformers = [...enriched]
    .filter((reel) => reel.isUnderperforming)
    .sort((a, b) => (a.topicMultiplier ?? 99) - (b.topicMultiplier ?? 99));
  const timeSeries = buildTimeSeries(reels, summary.averageViews);
  const distribution = buildDistribution(reels);
  const insights = buildInsights(summary, topics, contentTypes, breakouts, underperformers);

  return {
    summary,
    topics,
    categories,
    contentTypes,
    reels: enriched,
    breakouts,
    underperformers,
    timeSeries,
    distribution,
    insights,
  };
}

export function explainReel(reel: EnrichedReel): string {
  if (reel.views === null) {
    return "View metrics are unavailable for this Reel, so benchmark comparison cannot be computed.";
  }
  if (reel.topicMultiplier !== null && reel.topicMultiplier >= 1) {
    return `This Reel generated ${reel.topicMultiplier.toFixed(1)}× the average views of ${reel.finalTopic} Reels.`;
  }
  if (reel.topicMultiplier !== null) {
    return `This Reel generated ${(reel.topicMultiplier * 100).toFixed(0)}% of the average views of ${reel.finalTopic} Reels.`;
  }
  if (reel.accountMultiplier !== null) {
    return `This Reel generated ${reel.accountMultiplier.toFixed(1)}× the account average views.`;
  }
  return "Not enough benchmark data is available to explain this Reel's performance.";
}

export function explainTopic(topic: TopicStats, summary: AccountSummary): string {
  const pieces: string[] = [];
  if (topic.vsAccountMultiplier !== null) {
    pieces.push(
      `${topic.topic} averages ${topic.vsAccountMultiplier.toFixed(1)}× the account benchmark of ${formatMaybe(summary.averageViews)} views.`,
    );
  } else {
    pieces.push(`${topic.topic} has ${topic.reelCount} indexed Reels in the current filter window.`);
  }
  if (topic.engagement !== null && summary.engagementRate !== null) {
    const delta = topic.engagement - summary.engagementRate;
    pieces.push(
      `Engagement is ${topic.engagement.toFixed(1)}% (${delta >= 0 ? "+" : ""}${delta.toFixed(1)} pts vs account).`,
    );
  }
  return pieces.join(" ");
}
