import type { EnrichedReel } from "./types";

function csvEscape(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return "";
  const text = String(value);
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

const HEADERS = [
  "reel_id",
  "reel_title",
  "caption",
  "permalink",
  "published_date",
  "primary_category",
  "primary_topic",
  "secondary_topics",
  "content_type",
  "detected_topic",
  "manual_topic",
  "final_topic",
  "confidence",
  "matched_keywords",
  "views",
  "likes",
  "comments",
  "engagement_rate",
  "topic_average_views",
  "account_average_views",
  "views_vs_topic_average",
  "views_vs_account_average",
  "performance_score",
  "performance_status",
  "is_breakout",
  "is_underperforming",
] as const;

export function reelsToCsv(reels: EnrichedReel[]): string {
  const rows = reels.map((reel) =>
    [
      reel.id,
      reel.title,
      reel.caption,
      reel.permalink,
      reel.publishedAt,
      reel.primaryCategory,
      reel.primaryTopic,
      reel.secondaryTopics.join("; "),
      reel.contentType,
      reel.detectedTopic,
      reel.manualTopic,
      reel.finalTopic,
      reel.confidence,
      reel.matchedKeywords.join("; "),
      reel.views,
      reel.likes,
      reel.comments,
      reel.engagement,
      reel.topicAverageViews,
      reel.accountAverageViews,
      reel.viewsVsTopic,
      reel.viewsVsAccount,
      reel.performanceScore,
      reel.performanceStatus,
      reel.isBreakout,
      reel.isUnderperforming,
    ]
      .map(csvEscape)
      .join(","),
  );
  return [HEADERS.join(","), ...rows].join("\n");
}
