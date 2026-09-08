import type { ContentType } from "./types";

export interface ContentTypeRule {
  type: ContentType;
  keywords: string[];
}

export const CONTENT_TYPE_RULES: ContentTypeRule[] = [
  {
    type: "Before / After",
    keywords: ["before after", "before and after", "before/after", "b&a", "results after"],
  },
  {
    type: "Transformation",
    keywords: ["transformation", "transform", "glow up", "glow-up", "after 7 days", "after 14 days", "day 1 vs"],
  },
  {
    type: "Myth / Fact",
    keywords: ["myth", "fact", "myth vs", "not true", "stop believing"],
  },
  {
    type: "Problem / Solution",
    keywords: ["if you have", "how to fix", "how to reduce", "stop this", "do this instead", "the problem"],
  },
  {
    type: "Quick Tip",
    keywords: ["quick tip", "in seconds", "30 sec", "30-sec", "60 sec", "in minutes", "hack", "tip:"],
  },
  {
    type: "Tutorial",
    keywords: ["tutorial", "step by step", "step-by-step", "how to do", "learn this"],
  },
  {
    type: "Routine",
    keywords: ["routine", "daily practice", "morning routine", "night routine", "full routine", "sequence"],
  },
  {
    type: "Educational",
    keywords: ["why this works", "anatomy", "muscle", "explained", "science", "because"],
  },
  {
    type: "Exercise",
    keywords: ["exercise", "workout", "reps", "repeat", "hold for", "squeeze", "release"],
  },
];

export function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[#_]/g, " ")
    .replace(/[’']/g, "'")
    .replace(/[^a-z0-9\s/+-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function extractHashtags(caption: string): string[] {
  return Array.from(caption.matchAll(/#([\w.]+)/g)).map((match) => match[1].toLowerCase());
}
