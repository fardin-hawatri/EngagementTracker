import type { Confidence, ContentType, Reel } from "./types";
import { TOPICS } from "./taxonomy";
import { CONTENT_TYPE_RULES, extractHashtags, normalizeText } from "./rules";
import { deriveTitle } from "./format";

export interface ClassificationResult {
  detectedTopic: string;
  detectedCategory: string;
  secondaryTopics: string[];
  contentType: ContentType;
  confidence: Confidence;
  matchedKeywords: string[];
}

interface TopicHit {
  label: string;
  category: string;
  score: number;
  keywords: string[];
}

function findPhrase(haystack: string, phrase: string): boolean {
  if (!phrase) return false;
  if (phrase.includes(" ")) return haystack.includes(phrase);
  const pattern = new RegExp(`(?:^|\\s)${phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:s|es)?(?:$|\\s)`);
  return pattern.test(` ${haystack} `);
}

function scoreTopic(normalized: string, hashtags: string[], keywords: string[]): { score: number; matched: string[] } {
  const matched: string[] = [];
  let score = 0;
  for (const keyword of keywords) {
    const key = keyword.toLowerCase();
    if (findPhrase(normalized, key)) {
      matched.push(keyword);
      score += key.includes(" ") ? 4 : 2;
    } else if (hashtags.some((tag) => tag.replace(/[._]/g, " ").includes(key.replace(/\s+/g, "")))) {
      matched.push(`#${keyword}`);
      score += 3;
    }
  }
  return { score, matched };
}

function classifyContentType(normalized: string): ContentType {
  let best: { type: ContentType; score: number } = { type: "Other", score: 0 };
  for (const rule of CONTENT_TYPE_RULES) {
    let score = 0;
    for (const keyword of rule.keywords) {
      if (normalized.includes(keyword)) score += keyword.includes(" ") ? 3 : 2;
    }
    if (score > best.score) best = { type: rule.type, score };
  }
  return best.type;
}

function confidenceFromScore(score: number, matches: number): Confidence {
  if (matches === 0 || score <= 0) return "NONE";
  if (score >= 8 || matches >= 3) return "HIGH";
  if (score >= 4 || matches >= 2) return "MEDIUM";
  return "LOW";
}

export function classifyCaption(title: string, caption: string): ClassificationResult {
  const combined = `${title}\n${caption}`;
  const normalized = normalizeText(combined);
  const hashtags = extractHashtags(caption);
  const hits: TopicHit[] = [];

  for (const topic of TOPICS) {
    if (topic.keywords.length === 0) continue;
    const { score, matched } = scoreTopic(normalized, hashtags, topic.keywords);
    if (score > 0) {
      hits.push({
        label: topic.label,
        category: topic.category,
        score,
        keywords: matched,
      });
    }
  }

  hits.sort((a, b) => b.score - a.score);

  if (hits.length === 0) {
    const fallback = /face|facial/.test(normalized)
      ? { topic: "General Face Yoga", category: "FACE" }
      : /neck|posture|shoulder/.test(normalized)
        ? { topic: "General Wellness", category: "NECK" }
        : /body|belly|fat|workout/.test(normalized)
          ? { topic: "General Fitness", category: "BODY" }
          : { topic: "Uncategorized", category: "GENERAL" };
    return {
      detectedTopic: fallback.topic,
      detectedCategory: fallback.category,
      secondaryTopics: [],
      contentType: classifyContentType(normalized),
      confidence: "NONE",
      matchedKeywords: [],
    };
  }

  const primary = hits[0];
  const secondary = hits
    .slice(1)
    .filter((hit) => hit.score >= Math.max(2, primary.score * 0.4))
    .slice(0, 3)
    .map((hit) => hit.label);

  return {
    detectedTopic: primary.label,
    detectedCategory: primary.category,
    secondaryTopics: secondary,
    contentType: classifyContentType(normalized),
    confidence: confidenceFromScore(primary.score, primary.keywords.length),
    matchedKeywords: Array.from(new Set(primary.keywords)).slice(0, 8),
  };
}

export function applyClassification(
  reel: Omit<
    Reel,
    | "title"
    | "primaryCategory"
    | "primaryTopic"
    | "secondaryTopics"
    | "contentType"
    | "detectedTopic"
    | "detectedCategory"
    | "detectedContentType"
    | "manualTopic"
    | "finalTopic"
    | "confidence"
    | "matchedKeywords"
  > & { title?: string },
  override?: { topic?: string | null; category?: string | null; contentType?: ContentType | null },
): Reel {
  const title = deriveTitle(reel.caption, reel.title);
  const detected = classifyCaption(title, reel.caption);
  const finalTopic = override?.topic || detected.detectedTopic;
  const finalCategory =
    override?.category ||
    TOPICS.find((topic) => topic.label === finalTopic)?.category ||
    detected.detectedCategory;
  const contentType = override?.contentType || detected.contentType;

  return {
    ...reel,
    title,
    primaryCategory: finalCategory,
    primaryTopic: finalTopic,
    secondaryTopics: detected.secondaryTopics,
    contentType,
    detectedTopic: detected.detectedTopic,
    detectedCategory: detected.detectedCategory,
    detectedContentType: detected.contentType,
    manualTopic: override?.topic ?? null,
    finalTopic,
    confidence: override?.topic ? "HIGH" : detected.confidence,
    matchedKeywords: detected.matchedKeywords,
  };
}
