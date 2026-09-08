import { X } from "lucide-react";
import { CONTENT_TYPES, TOPICS } from "@shared/taxonomy";
import { explainReel } from "@shared/analytics";
import { formatCompact, formatDate, formatInteger, formatMultiplier, formatPercent } from "@shared/format";
import type { ContentType } from "@shared/types";
import { useDataset } from "../../hooks/useDataset";
import { StatusBadge } from "../common/Section";

export function ReelInspection({
  onClose,
  embedded = false,
}: {
  onClose?: () => void;
  embedded?: boolean;
}) {
  const { selectedReel, setOverride, overrides } = useDataset();
  if (!selectedReel) {
    return (
      <aside className="flex h-full items-center justify-center border-l border-[var(--border)] bg-[var(--surface-1)] p-6 text-sm text-[var(--text-3)]">
        Select a Reel to inspect.
      </aside>
    );
  }

  const reel = selectedReel;
  const max = Math.max(reel.views ?? 0, reel.topicAverageViews ?? 0, reel.accountAverageViews ?? 0, 1);
  const override = overrides[reel.id];

  return (
    <aside className={`${embedded ? "h-full" : "fixed inset-y-0 right-0 z-50 w-full max-w-md"} flex flex-col border-l border-[var(--border)] bg-[var(--surface-1)] transition-transform duration-200`}>
      <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-0)] px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 bg-[var(--primary-strong)]" />
          <span className="label-caps font-semibold">Reel inspection</span>
          {reel.isBreakout ? <span className="metric text-[10px] text-[var(--positive)]">CONFIRMED {formatMultiplier(reel.topicMultiplier)}</span> : null}
        </div>
        <div className="flex items-center gap-2">
          {reel.permalink ? (
            <a
              href={reel.permalink}
              target="_blank"
              rel="noreferrer"
              className="label-caps border border-[color-mix(in_srgb,var(--primary)_30%,transparent)] px-1.5 py-0.5 text-[var(--primary)]"
            >
              Instagram
            </a>
          ) : null}
          {onClose ? (
            <button type="button" onClick={onClose} aria-label="Close inspection">
              <X size={16} />
            </button>
          ) : null}
        </div>
      </div>
      <div className="app-scroll flex flex-col gap-4 overflow-y-auto p-4">
        <div className="grid grid-cols-12 gap-3 border border-[var(--border)] bg-[var(--surface-2)] p-2">
          <div className="relative col-span-4 aspect-[9/16] overflow-hidden border border-[var(--border)] bg-[var(--surface-4)]">
            {reel.thumbnailUrl ? (
              <img src={reel.thumbnailUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-[var(--text-4)]">No still</div>
            )}
          </div>
          <div className="col-span-8 flex flex-col justify-between">
            <div>
              <div className="label-caps text-[9px] text-[var(--positive)]">
                Topic: {reel.finalTopic} [{reel.primaryCategory}]
              </div>
              <h2 className="mt-1 text-base font-semibold leading-tight">{reel.title}</h2>
            </div>
            <div className="my-2 grid grid-cols-2 gap-2 border-y border-[var(--border)] py-2 text-[11px]">
              <div>
                <div className="label-caps text-[var(--text-3)]">Published</div>
                <div className="metric">{formatDate(reel.publishedAt)}</div>
              </div>
              <div>
                <div className="label-caps text-[var(--text-3)]">Duration</div>
                <div className="metric text-[var(--text-3)]">Unavailable</div>
              </div>
              <div>
                <div className="label-caps text-[var(--text-3)]">Format</div>
                <div className="text-[var(--primary)]">{reel.contentType}</div>
              </div>
              <div>
                <div className="label-caps text-[var(--text-3)]">Confidence</div>
                <div className="metric">{reel.confidence}</div>
              </div>
            </div>
            <div className="metric text-[10px] text-[var(--text-3)]">ID: {reel.id}</div>
          </div>
        </div>

        <div className="border border-[var(--border)] bg-[var(--surface-0)]">
          <div className="label-caps border-b border-[var(--border)] bg-[var(--surface-2)] px-2 py-1.5 text-[var(--text-3)]">Caption</div>
          <p className="p-2 text-sm leading-relaxed text-[var(--text-2)]">{reel.caption || "No caption"}</p>
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <span className="label-caps text-[var(--text-3)]">Performance audit metrics</span>
            <StatusBadge status={reel.performanceStatus} />
          </div>
          <div className="grid grid-cols-3 gap-px border border-[var(--border)] bg-[var(--border)]">
            {[
              ["Views", formatCompact(reel.views)],
              ["Likes", formatInteger(reel.likes)],
              ["Comments", formatInteger(reel.comments)],
              ["Engagement", formatPercent(reel.engagement)],
              ["Shares", formatInteger(reel.shares)],
              ["Saves", formatInteger(reel.saved)],
            ].map(([label, value]) => (
              <div key={label} className="bg-[var(--surface-2)] p-2">
                <div className="label-caps text-[9px] text-[var(--text-3)]">{label}</div>
                <div className="metric text-xl font-semibold">{value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-[var(--border)] bg-[var(--surface-2)] p-2">
          <div className="label-caps mb-2 border-b border-[var(--border)] pb-1">This Reel vs benchmarks</div>
          {[
            ["This Reel", reel.views, "var(--primary-strong)"],
            [`${reel.finalTopic} topic avg`, reel.topicAverageViews, "var(--secondary)"],
            ["Account average", reel.accountAverageViews, "var(--text-3)"],
          ].map(([label, value, color]) => (
            <div key={String(label)} className="mb-2">
              <div className="metric mb-0.5 flex justify-between text-[11px]">
                <span>{label}</span>
                <span>{formatCompact(value as number | null)}</span>
              </div>
              <div className="h-3 border border-[var(--border)] bg-[var(--surface-0)] p-0.5">
                <div className="h-full" style={{ width: `${Math.max(2, ((Number(value) || 0) / max) * 100)}%`, background: String(color) }} />
              </div>
            </div>
          ))}
          <p className="mt-2 border border-[var(--border)] bg-[var(--surface-0)] p-2 text-sm text-[var(--text)]">{explainReel(reel)}</p>
        </div>

        <div className="border border-[var(--border)] bg-[var(--surface-2)] p-2">
          <div className="label-caps mb-2 border-b border-[var(--border)] pb-1">Taxonomy & classification</div>
          <div className="metric space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-[var(--text-3)]">Detected topic</span>
              <span>{reel.detectedTopic}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-3)]">Final topic</span>
              <span>{reel.finalTopic}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-3)]">Content type</span>
              <span>{reel.contentType}</span>
            </div>
          </div>
          <div className="mt-2">
            <div className="label-caps text-[var(--text-3)]">Matched keywords</div>
            <div className="mt-1 flex flex-wrap gap-1">
              {reel.matchedKeywords.length ? (
                reel.matchedKeywords.map((keyword) => (
                  <span key={keyword} className="metric border border-[var(--border)] bg-[var(--surface-0)] px-1.5 py-0.5 text-[10px]">
                    {keyword}
                  </span>
                ))
              ) : (
                <span className="text-xs text-[var(--text-3)]">None</span>
              )}
            </div>
          </div>
          <div className="mt-3 border-t border-[var(--border)] pt-2">
            <div className="label-caps mb-1 text-[var(--text-3)]">Manual override</div>
            <select
              className="metric w-full border border-[var(--border)] bg-[var(--surface-0)] px-2 py-1 text-xs"
              value={override?.topic || ""}
              onChange={(event) =>
                setOverride(reel.id, {
                  topic: event.target.value || null,
                  category: TOPICS.find((topic) => topic.label === event.target.value)?.category || null,
                  contentType: override?.contentType ?? null,
                })
              }
            >
              <option value="">Use detected ({reel.detectedTopic})</option>
              {TOPICS.map((topic) => (
                <option key={topic.id} value={topic.label}>
                  {topic.label}
                </option>
              ))}
            </select>
            <select
              className="metric mt-2 w-full border border-[var(--border)] bg-[var(--surface-0)] px-2 py-1 text-xs"
              value={override?.contentType || reel.contentType}
              onChange={(event) =>
                setOverride(reel.id, {
                  topic: override?.topic ?? null,
                  category: override?.category ?? null,
                  contentType: event.target.value as ContentType,
                })
              }
            >
              {CONTENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </aside>
  );
}
