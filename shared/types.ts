export type Confidence = "HIGH" | "MEDIUM" | "LOW" | "NONE";

export type ContentType =
  | "Exercise"
  | "Routine"
  | "Quick Tip"
  | "Tutorial"
  | "Before / After"
  | "Educational"
  | "Problem / Solution"
  | "Myth / Fact"
  | "Transformation"
  | "Other";

export type PerformanceStatus =
  | "BREAKOUT"
  | "ABOVE"
  | "NEAR"
  | "BELOW"
  | "UNDER"
  | "UNAVAILABLE";

export type OpportunityQuadrant = "DOUBLE_DOWN" | "OPTIMIZE" | "EXPLORE" | "REVIEW";

export type DatePreset = "7D" | "30D" | "90D" | "YTD" | "ALL" | "CUSTOM";

export interface InstagramAccount {
  id: string;
  username: string;
  name: string | null;
  accountType: string | null;
  profilePictureUrl: string | null;
  followersCount: number | null;
  mediaCount: number | null;
}

export interface ReelMetrics {
  views: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  saved: number | null;
  reach: number | null;
  totalInteractions: number | null;
}

export interface Reel {
  id: string;
  title: string;
  caption: string;
  permalink: string | null;
  publishedAt: string;
  mediaType: string;
  mediaProductType: string;
  thumbnailUrl: string | null;
  mediaUrl: string | null;
  views: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  saved: number | null;
  reach: number | null;
  insightsAvailable: boolean;
  availableMetrics: string[];
  primaryCategory: string;
  primaryTopic: string;
  secondaryTopics: string[];
  contentType: ContentType;
  detectedTopic: string;
  detectedCategory: string;
  detectedContentType: ContentType;
  manualTopic: string | null;
  finalTopic: string;
  confidence: Confidence;
  matchedKeywords: string[];
}

export interface DatasetPayload {
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

export interface FetchProgress {
  phase:
    | "idle"
    | "account"
    | "media"
    | "insights"
    | "complete"
    | "error";
  message: string;
  mediaFetched: number;
  insightsDone: number;
  insightsTotal: number;
  error: string | null;
  lastSyncedAt: string | null;
}

export interface ManualOverride {
  topic: string | null;
  category: string | null;
  contentType: ContentType | null;
}

export interface TopicStats {
  topic: string;
  category: string;
  reelCount: number;
  totalViews: number;
  averageViews: number | null;
  medianViews: number | null;
  minViews: number | null;
  maxViews: number | null;
  averageLikes: number | null;
  averageComments: number | null;
  totalLikes: number;
  totalComments: number;
  engagement: number | null;
  vsAccount: number | null;
  vsAccountMultiplier: number | null;
  performanceScore: number | null;
  consistency: number | null;
  topReelId: string | null;
  topReelTitle: string | null;
  topReelViews: number | null;
  quadrant: OpportunityQuadrant;
  reachBand: "HIGH" | "LOW";
  engagementBand: "HIGH" | "LOW";
}

export interface CategoryStats {
  category: string;
  reelCount: number;
  percentage: number;
  totalViews: number;
  averageViews: number | null;
  engagement: number | null;
}

export interface ContentTypeStats {
  contentType: ContentType;
  reelCount: number;
  averageViews: number | null;
  engagement: number | null;
  performanceScore: number | null;
}

export interface AccountSummary {
  totalReels: number;
  reelsWithViews: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  averageViews: number | null;
  medianViews: number | null;
  averageLikes: number | null;
  averageComments: number | null;
  engagementRate: number | null;
}

export interface ReelBenchmark {
  reelId: string;
  topicAverageViews: number | null;
  accountAverageViews: number | null;
  viewsVsTopic: number | null;
  viewsVsAccount: number | null;
  topicMultiplier: number | null;
  accountMultiplier: number | null;
  performanceScore: number | null;
  performanceStatus: PerformanceStatus;
  isBreakout: boolean;
  isUnderperforming: boolean;
  engagement: number | null;
}

export interface EnrichedReel extends Reel {
  engagement: number | null;
  topicAverageViews: number | null;
  accountAverageViews: number | null;
  viewsVsTopic: number | null;
  viewsVsAccount: number | null;
  topicMultiplier: number | null;
  accountMultiplier: number | null;
  performanceScore: number | null;
  performanceStatus: PerformanceStatus;
  isBreakout: boolean;
  isUnderperforming: boolean;
}

export interface TimePoint {
  date: string;
  label: string;
  views: number;
  likes: number;
  comments: number;
  engagement: number | null;
  reelCount: number;
  benchmark: number | null;
}

export interface DistributionBucket {
  label: string;
  min: number;
  max: number;
  count: number;
  percentage: number;
}

export interface InsightCard {
  id: string;
  section:
    | "STRONGEST"
    | "WEAKEST"
    | "BREAKOUT"
    | "UNDERPERFORMING"
    | "OPPORTUNITY"
    | "FORMAT";
  title: string;
  observation: string;
  data: string;
  comparison: string;
  action: string;
  topic?: string;
}

export interface AnalyticsBundle {
  summary: AccountSummary;
  topics: TopicStats[];
  categories: CategoryStats[];
  contentTypes: ContentTypeStats[];
  reels: EnrichedReel[];
  breakouts: EnrichedReel[];
  underperformers: EnrichedReel[];
  timeSeries: TimePoint[];
  distribution: DistributionBucket[];
  insights: InsightCard[];
}
