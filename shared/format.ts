export function formatCompact(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "Unavailable";
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(abs >= 10_000_000 ? 1 : 2).replace(/\.0+$/, "")}M`;
  if (abs >= 1_000) {
    const k = value / 1_000;
    const digits = abs >= 100_000 ? 0 : abs >= 10_000 ? 1 : 1;
    const text = k.toFixed(digits).replace(/\.0$/, "");
    return `${text}K`;
  }
  return Math.round(value).toLocaleString("en-US");
}

export function formatInteger(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "Unavailable";
  return Math.round(value).toLocaleString("en-US");
}

export function formatPercent(value: number | null | undefined, digits = 1): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "Unavailable";
  return `${value.toFixed(digits)}%`;
}

export function formatDeltaPercent(value: number | null | undefined, digits = 1): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(digits)}%`;
}

export function formatMultiplier(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  return `${value.toFixed(1)}×`;
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatShortDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatDateTime(iso: string | null): string {
  if (!iso) return "Never";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Never";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function relativeTime(iso: string | null): string {
  if (!iso) return "Never synced";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "Never synced";
  const diff = Date.now() - then;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Synced just now";
  if (minutes < 60) return `Synced ${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Synced ${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `Synced ${days}d ago`;
}

export function engagementRate(
  likes: number | null,
  comments: number | null,
  views: number | null,
): number | null {
  if (views === null || views <= 0) return null;
  const l = likes ?? 0;
  const c = comments ?? 0;
  const rate = ((l + c) / views) * 100;
  if (!Number.isFinite(rate)) return null;
  return rate;
}

export function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) return (sorted[mid - 1] + sorted[mid]) / 2;
  return sorted[mid];
}

export function stddev(values: number[]): number | null {
  if (values.length < 2) return values.length === 1 ? 0 : null;
  const avg = mean(values);
  if (avg === null) return null;
  const variance = values.reduce((sum, value) => sum + (value - avg) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function deriveTitle(caption: string, existing?: string | null): string {
  if (existing && existing.trim()) return existing.trim();
  const text = caption.replace(/\r/g, "").trim();
  if (!text) return "Untitled Reel";
  const withoutHashtagLead = text.replace(/^(#[\w.]+\s*)+/g, "").trim();
  const source = withoutHashtagLead || text;
  const sentence = source.split(/[\n.!?]/).map((part) => part.trim()).find((part) => {
    const clean = part.replace(/#\w+/g, "").trim();
    return clean.length >= 8;
  });
  const hook = (sentence || source.split("\n")[0] || source)
    .replace(/#[\w.]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!hook) return "Untitled Reel";
  return hook.length > 72 ? `${hook.slice(0, 69).trim()}…` : hook;
}
