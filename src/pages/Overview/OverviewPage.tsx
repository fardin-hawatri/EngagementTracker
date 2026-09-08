import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatCompact, formatDeltaPercent, formatPercent, slugify } from "@shared/format";
import { useDataset } from "../../hooks/useDataset";
import { CursorTip, HoverTip } from "../../components/common/GraphExplain";
import { KpiStrip } from "../../components/common/Section";
import type { CategoryStats, EnrichedReel, TopicStats } from "@shared/types";

const MIX_LABEL: Record<string, string> = {
  FACE: "Facial Dynamics",
  NECK: "Neck & Posture",
  BODY: "Body Drainage",
  SPECIALIZED: "Specialized",
  GENERAL: "General",
};

const MIX_COLOR: Record<string, string> = {
  FACE: "#ff4c83",
  NECK: "#3131c0",
  BODY: "#273646",
  SPECIALIZED: "#4edea3",
  GENERAL: "#a9898e",
};

const SPARK_COLORS = ["#ff4c83", "#4edea3", "#c0c1ff"];

function formatIntegerSafe(value: number | null | undefined): string {
  if (value === null || value === undefined) return "Unavailable";
  return Math.round(value).toLocaleString("en-US");
}

function TopicBars({ topics, accountAvg }: { topics: TopicStats[]; accountAvg: number | null }) {
  const navigate = useNavigate();
  const visible = topics.slice(0, 8);
  const scale = Math.max(...visible.map((topic) => topic.averageViews ?? 0), accountAvg ?? 0, 1);
  const benchPct = accountAvg ? (accountAvg / scale) * 100 : 0;
  const ticks = [0, accountAvg ?? scale * 0.36, scale];

  return (
    <div className="flex flex-col gap-3 pt-2">
      <div className="hidden items-center justify-between border-b border-[var(--border)] pb-1 xl:grid xl:grid-cols-12 xl:gap-2">
        <div className="label-caps col-span-3 text-[var(--text-3)]">Taxonomy topic (n)</div>
        <div className="relative col-span-7 flex justify-between pr-4">
          {ticks.map((tick, index) => (
            <span key={index} className={`label-caps ${tick === accountAvg ? "font-bold text-[var(--primary)]" : "text-[var(--text-3)]"}`}>
              {tick === accountAvg ? `${formatCompact(accountAvg)} (BENCHMARK)` : formatCompact(tick)}
            </span>
          ))}
        </div>
        <div className="label-caps col-span-2 text-right text-[var(--text-3)]">Metric / multiplier</div>
      </div>
      <div className="label-caps flex justify-between text-[var(--text-3)] xl:hidden">
        <span>0</span>
        <span className="font-bold text-[var(--primary)]">{formatCompact(accountAvg)} BENCHMARK</span>
        <span>{formatCompact(scale)}</span>
      </div>
      {visible.map((topic) => {
        const value = topic.averageViews ?? 0;
        const above = accountAvg !== null && value >= accountAvg;
        const valuePct = (value / scale) * 100;
        const surplusPct = Math.max(0, valuePct - benchPct);
        const engagementPct = topic.engagement === null ? null : Math.min(96, Math.max(4, topic.engagement * 10));
        const showInBar = above ? surplusPct >= 18 : valuePct >= 22;
        return (
          <HoverTip
            key={topic.topic}
            className="block w-full min-w-0"
            title={topic.topic}
            body="Average views per Reel versus the account benchmark. The solid bar is mean reach. The diamond is engagement rate, not views. Green surplus means the topic beats the account floor."
            rows={[
              { label: "Published", value: `${topic.reelCount} Reels` },
              { label: "Avg views", value: formatCompact(topic.averageViews) },
              { label: "Vs account", value: formatDeltaPercent(topic.vsAccount) },
              { label: "Engagement", value: formatPercent(topic.engagement) },
              { label: "Benchmark", value: formatCompact(accountAvg) },
            ]}
          >
            <button
              type="button"
              onClick={() => navigate(`/topics/${slugify(topic.topic)}`)}
              className="w-full px-1 py-1 text-left transition-colors duration-150 hover:bg-[var(--surface-2)]"
            >
              <div className="mb-1 flex items-center justify-between gap-2 xl:hidden">
                <span className="min-w-0 truncate text-sm font-semibold">{topic.topic}</span>
                <span className="metric shrink-0 text-[10px] text-[var(--text-3)]">
                  n={topic.reelCount}
                  <span className={`ml-2 font-bold ${above ? "text-[var(--positive)]" : "text-[var(--negative-strong)]"}`}>
                    {formatDeltaPercent(topic.vsAccount)}
                  </span>
                  <span className="ml-2">{formatPercent(topic.engagement)} ER</span>
                </span>
              </div>
              <div className="grid grid-cols-1 items-center gap-2 xl:grid-cols-12">
                <div className="hidden min-w-0 items-center justify-between pr-2 xl:col-span-3 xl:flex">
                  <span className="metric truncate text-sm font-semibold text-[var(--text)]">{topic.topic}</span>
                  <span className="metric shrink-0 text-xs text-[var(--text-3)]">n={topic.reelCount}</span>
                </div>
                <div className="relative flex h-7 min-w-0 items-center overflow-hidden border border-[var(--border)] bg-[var(--surface-0)] xl:col-span-7">
                  <div className="absolute top-0 bottom-0 z-20 w-px bg-[var(--primary-strong)]" style={{ left: `${benchPct}%` }} />
                  {above ? (
                    <>
                      <div className="h-full shrink-0 bg-[var(--surface-4)]" style={{ width: `${benchPct}%` }} />
                      <div
                        className="flex h-full min-w-0 items-center justify-end overflow-hidden bg-[var(--positive)] px-1"
                        style={{ width: `${surplusPct}%` }}
                      >
                        {showInBar ? (
                          <span className="metric truncate text-[10px] font-bold text-[var(--on-tertiary)]">
                            {formatCompact(topic.averageViews)}
                            <span className="hidden sm:inline"> VIEWS</span>
                          </span>
                        ) : null}
                      </div>
                    </>
                  ) : (
                    <div
                      className="flex h-full items-center justify-end overflow-hidden border-r-2 border-[var(--negative-strong)] bg-[color-mix(in_srgb,var(--text-4)_60%,transparent)] px-1"
                      style={{ width: `${Math.max(2, valuePct)}%` }}
                    >
                      {showInBar ? (
                        <span className="metric truncate text-[10px] font-bold text-[var(--negative-strong)]">{formatCompact(topic.averageViews)}</span>
                      ) : null}
                    </div>
                  )}
                  {engagementPct !== null ? (
                    <div
                      className={`absolute top-1/2 z-30 h-3 w-3 -translate-y-1/2 rotate-45 border border-[var(--surface-0)] ${above ? "bg-[var(--primary-strong)]" : "bg-[var(--negative-strong)]"}`}
                      style={{ left: `${engagementPct}%` }}
                    />
                  ) : null}
                </div>
                <div className="hidden items-center justify-end gap-2 xl:col-span-2 xl:flex">
                  <span className={`metric text-xs font-bold ${above ? "text-[var(--positive)]" : "text-[var(--negative-strong)]"}`}>
                    {formatDeltaPercent(topic.vsAccount)}
                  </span>
                  <span
                    className={`metric shrink-0 px-1.5 py-0.5 text-[10px] font-semibold ${above ? "bg-[color-mix(in_srgb,var(--primary)_20%,transparent)] text-[var(--primary)]" : "bg-[color-mix(in_srgb,var(--negative-strong)_20%,transparent)] text-[var(--negative-strong)]"}`}
                  >
                    {formatPercent(topic.engagement)} ER
                  </span>
                </div>
              </div>
            </button>
          </HoverTip>
        );
      })}
    </div>
  );
}

function DeviationPanel({ topics, accountAvg }: { topics: TopicStats[]; accountAvg: number | null }) {
  const over = topics.filter((topic) => (topic.vsAccount ?? 0) > 0).slice(0, 3);
  const under = [...topics]
    .filter((topic) => (topic.vsAccount ?? 0) < 0)
    .sort((a, b) => (a.vsAccount ?? 0) - (b.vsAccount ?? 0))
    .slice(0, 2);
  const rows = [...over, ...under];
  const maxAbs = Math.max(...rows.map((topic) => Math.abs(topic.vsAccount ?? 0)), 1);
  const maxDelta = Math.max(...over.map((topic) => topic.vsAccount ?? 0), 0);

  return (
    <div className="flex h-full min-w-0 flex-col justify-between bg-[var(--surface-1)] p-4">
      <div>
        <HoverTip
          title="Benchmark deviation"
          body="Diverging bars show how far each topic's average views sit from the account mean. Bars to the right (green) overperform. Bars to the left (red) underperform. 0% is the account baseline, not zero views."
          rows={[
            { label: "Baseline", value: formatCompact(accountAvg) },
            { label: "Peak delta", value: formatDeltaPercent(maxDelta || null) },
            { label: "Overperforming", value: `${over.length} / ${rows.length}` },
          ]}
        >
          <div className="mb-1 flex cursor-help items-center justify-between gap-2">
            <span className="label-caps text-[var(--text-3)]">Benchmark deviation</span>
            <span className="metric shrink-0 text-[10px] font-bold text-[var(--positive)]">{formatDeltaPercent(maxDelta || null)} MAX</span>
          </div>
          <h3 className="mb-2 text-sm font-semibold uppercase">Topic Performance vs Account</h3>
          <p className="mb-4 text-xs text-[var(--text-3)]">
            Diverging delta percentage relative to {formatCompact(accountAvg)} account baseline.
          </p>
        </HoverTip>
          <div className="space-y-2">
            {rows.map((topic) => {
              const delta = topic.vsAccount ?? 0;
              const pct = Math.min(100, (Math.abs(delta) / maxAbs) * 100);
              return (
                <HoverTip
                  key={topic.topic}
                  title={topic.topic}
                  body={`${topic.topic} averages ${formatCompact(topic.averageViews)} views, ${formatDeltaPercent(topic.vsAccount)} versus the ${formatCompact(accountAvg)} account floor.`}
                  rows={[
                    { label: "Avg views", value: formatCompact(topic.averageViews) },
                    { label: "Delta", value: formatDeltaPercent(topic.vsAccount) },
                    { label: "Reels", value: String(topic.reelCount) },
                  ]}
                >
                  <div>
                    <div className="metric mb-0.5 flex justify-between gap-2 text-[11px]">
                      <span className={`min-w-0 truncate ${delta < 0 ? "text-[var(--text-3)]" : "text-[var(--text)]"}`}>{topic.topic}</span>
                      <span className={`shrink-0 font-bold ${delta >= 0 ? "text-[var(--positive)]" : "text-[var(--negative-strong)]"}`}>
                        {formatDeltaPercent(topic.vsAccount)}
                      </span>
                    </div>
                    <div className="flex h-2.5 bg-[var(--surface-0)]">
                      <div className="flex w-1/2 justify-end">
                        {delta < 0 ? <div className="h-full bg-[var(--negative-strong)]" style={{ width: `${pct}%` }} /> : null}
                      </div>
                      <div className="w-1/2">
                        {delta > 0 ? <div className="h-full bg-[var(--positive)]" style={{ width: `${pct}%` }} /> : null}
                      </div>
                    </div>
                  </div>
                </HoverTip>
              );
            })}
          </div>
        </div>
        <div className="metric mt-4 flex flex-wrap items-center justify-between gap-1 border-t border-[var(--border)] pt-2 text-[10px] text-[var(--text-3)]">
          <span>0% BASELINE = {formatCompact(accountAvg)}</span>
          <span className="text-[var(--positive)]">
            {over.length} / {rows.length} OVERPERFORMING
          </span>
        </div>
    </div>
  );
}

function WhiskerPanel({ topics }: { topics: TopicStats[] }) {
  const rows = useMemo(() => {
    const top = topics.filter((topic) => topic.minViews !== null && topic.maxViews !== null).slice(0, 3);
    const lag = [...topics]
      .filter((topic) => topic.minViews !== null && !top.includes(topic))
      .sort((a, b) => (a.averageViews ?? 0) - (b.averageViews ?? 0))[0];
    return lag ? [...top, lag] : top;
  }, [topics]);
  const scale = Math.max(...rows.map((topic) => topic.maxViews ?? 0), 1);
  const predictable = rows.filter((topic) => (topic.consistency ?? 0) >= 50).length >= Math.ceil(rows.length / 2);

  return (
    <div className="flex h-full min-w-0 flex-col justify-between bg-[var(--surface-1)] p-4">
      <div>
        <HoverTip
          title="Variance inspection"
          body="Whisker-strip for each topic: left tick is the weakest Reel, the solid marker is the median, right tick is the strongest Reel. A long line means hit-or-miss performance. A tight cluster means predictable reach."
          rows={[{ label: "Readout", value: predictable ? "High predictability" : "High variance" }]}
        >
          <div className="mb-1 flex cursor-help items-center justify-between gap-2">
            <span className="label-caps text-[var(--text-3)]">Variance inspection</span>
            <span className="metric shrink-0 text-[10px] font-bold text-[var(--primary)]">WHISKER-STRIP</span>
          </div>
          <h3 className="mb-2 text-sm font-semibold uppercase">Consistency &amp; Outliers</h3>
          <p className="mb-4 text-xs text-[var(--text-3)]">Range from Min to Max outlier. Solid marker depicts topic median.</p>
        </HoverTip>
          <div className="space-y-3">
            {rows.map((topic) => {
              const min = topic.minViews ?? 0;
              const max = topic.maxViews ?? 0;
              const median = topic.medianViews ?? min;
              const left = (min / scale) * 100;
              const right = 100 - (max / scale) * 100;
              const medianPct = (median / scale) * 100;
              const noOutlier = max > 0 && max < median * 2.2;
              const weak = (topic.vsAccount ?? 0) < 0;
              return (
                <HoverTip
                  key={topic.topic}
                  title={topic.topic}
                  body="Min / median / max views for individual Reels in this topic. Hover the strip to read the spread; a distant max is a viral outlier."
                  rows={[
                    { label: "Min", value: formatCompact(min) },
                    { label: "Median", value: formatCompact(median) },
                    { label: "Max", value: formatCompact(max) },
                    { label: "Consistency", value: formatPercent(topic.consistency) },
                  ]}
                >
                  <div>
                    <div className="mb-1 flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between">
                      <span className="metric truncate text-[11px] text-[var(--text)]">{topic.topic}</span>
                      <span className={`metric text-[10px] ${weak ? "text-[var(--negative-strong)]" : "text-[var(--text-3)]"}`}>
                        {formatCompact(min)} — [{formatCompact(median)}] — {formatCompact(max)}
                        {noOutlier ? " (No Outliers)" : ""}
                      </span>
                    </div>
                    <div className="relative flex h-4 items-center bg-[var(--surface-0)] px-1">
                      <div className="absolute h-0.5 bg-[color-mix(in_srgb,var(--text-3)_60%,transparent)]" style={{ left: `${left}%`, right: `${right}%` }} />
                      <div className={`absolute h-2.5 w-0.5 ${weak ? "bg-[var(--negative-strong)]" : "bg-[var(--text-3)]"}`} style={{ left: `${left}%` }} />
                      <div className={`absolute h-2.5 w-0.5 ${weak ? "bg-[var(--text-4)]" : "bg-[var(--positive)]"}`} style={{ right: `${right}%` }} />
                      <div
                        className={`absolute h-3.5 w-2 border border-[var(--surface-0)] ${weak ? "bg-[var(--negative-strong)]" : "bg-[var(--positive)]"}`}
                        style={{ left: `${medianPct}%` }}
                      />
                    </div>
                  </div>
                </HoverTip>
              );
            })}
          </div>
        </div>
        <div className="metric mt-4 flex flex-wrap items-center justify-between gap-1 border-t border-[var(--border)] pt-2 text-[10px] text-[var(--text-3)]">
          <span>MARKER = MEDIAN</span>
          <span className="font-bold text-[var(--primary)]">{predictable ? "HIGH PREDICTABILITY" : "HIGH VARIANCE"}</span>
        </div>
    </div>
  );
}

function SparklinePanel({
  topics,
  series,
}: {
  topics: TopicStats[];
  series: Array<Record<string, number | string>>;
}) {
  const top3 = topics.slice(0, 3);
  const [hover, setHover] = useState<{ x: number; y: number; index: number } | null>(null);
  const maxY = Math.max(
    ...series.flatMap((row) => top3.map((topic) => Number(row[topic.topic] ?? 0))),
    1,
  );
  const toPoints = (key: string) =>
    series
      .map((row, index) => {
        const x = series.length <= 1 ? 0 : (index / (series.length - 1)) * 200;
        const y = 80 - (Number(row[key] ?? 0) / maxY) * 72;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  const first = series[0];
  const last = series[series.length - 1];
  const firstTotal = top3.reduce((sum, topic) => sum + Number(first?.[topic.topic] ?? 0), 0);
  const lastTotal = top3.reduce((sum, topic) => sum + Number(last?.[topic.topic] ?? 0), 0);
  const velocity = firstTotal > 0 ? ((lastTotal - firstTotal) / firstTotal) * 100 : null;
  const hoverRow = hover ? series[hover.index] : null;

  return (
    <div className="flex h-full min-w-0 flex-col justify-between bg-[var(--surface-1)] p-4">
      <div>
        <HoverTip
          title="Temporal momentum"
          body="Weekly view totals for the three highest-reach topics in the selected date window. Hover the chart to read a week. Spikes are posting weeks with a viral Reel, not a change in the topic itself."
        >
          <div className="mb-1 flex cursor-help items-center justify-between gap-2">
            <span className="label-caps text-[var(--text-3)]">Temporal momentum</span>
            <span className="metric shrink-0 text-[10px] text-[var(--positive)]">LIVE WINDOW</span>
          </div>
          <h3 className="mb-2 text-sm font-semibold uppercase">Views Trajectory (Top 3)</h3>
          <p className="mb-3 text-xs text-[var(--text-3)]">Rolling aggregate views per week by topic. Hover the sparkline for weekly totals.</p>
        </HoverTip>
        <div
          className="relative flex h-24 items-end border border-[var(--border)] bg-[var(--surface-0)] p-1"
          onMouseLeave={() => setHover(null)}
          onMouseMove={(event) => {
            if (!series.length) return;
            const box = event.currentTarget.getBoundingClientRect();
            const t = box.width <= 0 ? 0 : (event.clientX - box.left) / box.width;
            const index = Math.max(0, Math.min(series.length - 1, Math.round(t * (series.length - 1))));
            setHover({ x: event.clientX, y: event.clientY, index });
          }}
          onTouchEnd={() => setHover(null)}
          onTouchMove={(event) => {
            const touch = event.touches[0];
            if (!touch || !series.length) return;
            const box = event.currentTarget.getBoundingClientRect();
            const t = box.width <= 0 ? 0 : (touch.clientX - box.left) / box.width;
            const index = Math.max(0, Math.min(series.length - 1, Math.round(t * (series.length - 1))));
            setHover({ x: touch.clientX, y: touch.clientY, index });
          }}
        >
          <svg className="h-full w-full" viewBox="0 0 200 80" preserveAspectRatio="none" fill="none">
            <line x1="0" x2="200" y1="20" y2="20" stroke="#273646" strokeDasharray="2 2" strokeWidth="0.75" />
            <line x1="0" x2="200" y1="50" y2="50" stroke="#273646" strokeDasharray="2 2" strokeWidth="0.75" />
            {top3.map((topic, index) => (
              <polyline
                key={topic.topic}
                points={toPoints(topic.topic)}
                stroke={SPARK_COLORS[index]}
                strokeWidth={index === 0 ? 2 : 1.75}
                strokeLinecap="square"
              />
            ))}
            {hover && series.length > 1 ? (
              <line
                x1={(hover.index / (series.length - 1)) * 200}
                x2={(hover.index / (series.length - 1)) * 200}
                y1="0"
                y2="80"
                stroke="var(--primary)"
                strokeWidth="0.75"
              />
            ) : null}
          </svg>
          {hover && hoverRow ? (
            <CursorTip
              x={hover.x}
              y={hover.y}
              title={String(hoverRow.date ?? "Week")}
              body="Weekly view totals for the three highest-reach topics in the selected date window. Spikes are posting weeks with a viral Reel, not a change in the topic itself."
              rows={top3.map((topic) => ({
                label: topic.topic,
                value: formatCompact(Number(hoverRow[topic.topic] ?? 0)),
              }))}
            />
          ) : null}
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-1 text-[10px] text-[var(--text-3)]">
          {top3.map((topic, index) => (
            <span key={topic.topic} className="metric flex min-w-0 items-center gap-1">
              <span className="inline-block h-0.5 w-2 shrink-0" style={{ background: SPARK_COLORS[index] }} />
              <span className="truncate">{topic.topic}</span>
            </span>
          ))}
        </div>
      </div>
      <div className="metric mt-4 flex flex-wrap items-center justify-between gap-1 border-t border-[var(--border)] pt-2 text-[10px] text-[var(--text-3)]">
        <span>{String(first?.date ?? "START")}</span>
        <span className="text-[var(--text)]">
          {String(last?.date ?? "NOW")}
          {velocity !== null ? ` (${velocity >= 0 ? "+" : ""}${velocity.toFixed(0)}% VELOCITY)` : ""}
        </span>
      </div>
    </div>
  );
}

function MixPanel({ categories, totalReels }: { categories: CategoryStats[]; totalReels: number }) {
  const navigate = useNavigate();
  const face = categories.find((item) => item.category === "FACE");
  const efficiency = face?.reelCount ? face.totalViews / face.reelCount : null;

  return (
    <div className="flex h-full min-w-0 flex-col justify-between bg-[var(--surface-1)] p-4">
      <div>
        <HoverTip
          title="Anatomical distribution"
          body="Share of the catalog by body-region taxonomy. FACE / NECK / BODY / SPECIALIZED / GENERAL. The stacked strip is mix, not performance. Click a segment or row to open All Reels filtered to that category."
          rows={categories.map((category) => ({
            label: MIX_LABEL[category.category] || category.category,
            value: `${category.percentage.toFixed(0)}% · ${category.reelCount}`,
          }))}
        >
          <div className="mb-1 flex cursor-help items-center justify-between gap-2">
            <span className="label-caps text-[var(--text-3)]">Anatomical distribution</span>
            <span className="metric shrink-0 text-[10px] text-[var(--text)]">{totalReels} POSTS</span>
          </div>
          <h3 className="mb-2 text-sm font-semibold uppercase">Content Mix &amp; Category</h3>
          <p className="mb-3 text-xs text-[var(--text-3)]">High-leverage anatomical taxonomy grouping. Hover a slice for the breakdown.</p>
        </HoverTip>
        <div className="flex h-7 overflow-hidden border border-[var(--border)] bg-[var(--surface-0)]">
            {categories.map((category) => {
              const wide = category.percentage >= 28;
              const mid = category.percentage >= 14;
              const label = wide ? `${category.percentage.toFixed(0)}% ${category.category}` : mid ? `${category.percentage.toFixed(0)}%` : "";
              return (
                <div key={category.category} className="h-full min-w-0 overflow-hidden" style={{ width: `${Math.max(category.percentage, 2)}%` }}>
                  <HoverTip
                    className="block h-full w-full min-w-0"
                    title={MIX_LABEL[category.category] || category.category}
                    body={`${category.percentage.toFixed(0)}% of published Reels sit in ${MIX_LABEL[category.category] || category.category}. This is content mix, not reach.`}
                    rows={[
                      { label: "Share", value: `${category.percentage.toFixed(1)}%` },
                      { label: "Reels", value: String(category.reelCount) },
                      { label: "Views", value: formatCompact(category.totalViews) },
                    ]}
                  >
                    <button
                      type="button"
                      className="metric flex h-full w-full items-center justify-center overflow-hidden px-0.5 text-[9px] font-bold tracking-wide text-[var(--text)] sm:text-[10px]"
                      style={{ background: MIX_COLOR[category.category] || "#a9898e" }}
                      onClick={() => navigate(`/reels?category=${category.category}`)}
                    >
                      <span className="block max-w-full truncate">{label}</span>
                    </button>
                  </HoverTip>
                </div>
              );
            })}
        </div>
          <div className="mt-2 space-y-1.5 text-xs">
            {categories.map((category) => (
              <button
                key={category.category}
                type="button"
                className="metric flex w-full min-w-0 flex-col items-start gap-0.5 text-left text-[var(--text)] hover:text-[var(--primary)] sm:flex-row sm:items-center sm:justify-between"
                onClick={() => navigate(`/reels?category=${category.category}`)}
              >
                <span className="flex min-w-0 items-center gap-1.5">
                  <span className="h-2 w-2 shrink-0" style={{ background: MIX_COLOR[category.category] || "#a9898e" }} />
                  <span className="truncate">{MIX_LABEL[category.category] || category.category}</span>
                </span>
                <span className="pl-3.5 text-[var(--text-3)] sm:pl-2">
                  {category.reelCount} Reels ({formatCompact(category.totalViews)} views)
                </span>
              </button>
            ))}
          </div>
        </div>
        <div className="metric mt-4 flex flex-wrap items-center justify-between gap-1 border-t border-[var(--border)] pt-2 text-[10px] text-[var(--text-3)]">
          <span>EFFICIENCY: FACE {formatCompact(efficiency)}/POST</span>
          <span className="text-[var(--positive)]">{face && face.percentage >= 40 ? "OPTIMAL RATIO" : "MIX IMBALANCED"}</span>
        </div>
    </div>
  );
}

function OpportunityCard({
  index,
  title,
  subtitle,
  color,
  topic,
  body,
  rows,
  action,
  onOpen,
}: {
  index: string;
  title: string;
  subtitle: string;
  color: string;
  topic?: TopicStats;
  body: string;
  rows: Array<[string, string, string?]>;
  action: string;
  onOpen: () => void;
}) {
  return (
    <div className="flex flex-col justify-between border-2 bg-[var(--surface-2)] p-4" style={{ borderColor: color }}>
      <div>
        <div className="mb-1 flex items-center justify-between border-b border-[var(--border)] pb-1">
          <span className="label-caps font-bold tracking-wider" style={{ color }}>
            Quadrant {index}
          </span>
          <span className="h-2 w-2" style={{ background: color }} />
        </div>
        <span className="label-caps mb-1 block text-[10px] font-semibold" style={{ color }}>
          {subtitle}
        </span>
        <h3 className="mb-1 text-base font-semibold uppercase">{title}</h3>
        <p className="mb-2 text-sm" style={{ color }}>
          {topic?.topic || "No topic"}
        </p>
        <p className="mb-4 text-sm text-[var(--text-3)]">{body}</p>
        <div className="mb-4 space-y-1 border border-[var(--border)] bg-[var(--surface-0)] p-2 text-xs">
          {rows.map(([label, value, tone]) => (
            <div key={label} className="metric flex justify-between text-[var(--text)]">
              <span>{label}</span>
              <span className={tone || ""}>{value}</span>
            </div>
          ))}
        </div>
      </div>
      <button
        type="button"
        className="label-caps w-full py-2 font-bold uppercase transition-colors duration-150"
        style={{ background: color, color: "#041423" }}
        onClick={onOpen}
      >
        {action}
      </button>
    </div>
  );
}

export function OverviewPage() {
  const { analytics, payload, setSelectedReelId } = useDataset();
  const navigate = useNavigate();
  const { summary, topics, categories, timeSeries, breakouts, underperformers, reels } = analytics;

  const strongest = topics[0];
  const weakest =
    [...topics]
      .filter((topic) => topic.reelCount >= 2 && topic.topic !== "Uncategorized" && topic.topic !== strongest?.topic)
      .sort((a, b) => (a.averageViews ?? Infinity) - (b.averageViews ?? Infinity))[0] ?? topics.at(-1);

  const topTopics = topics.slice(0, 3);
  const topicSeries = useMemo(() => {
    const byDate = new Map<string, Record<string, number | string>>();
    for (const point of timeSeries) {
      byDate.set(point.date, { date: point.label });
    }
    for (const topic of topTopics) {
      const buckets = new Map<string, number>();
      for (const reel of reels.filter((item) => item.finalTopic === topic.topic)) {
        const date = new Date(reel.publishedAt);
        const week = new Date(date);
        week.setDate(week.getDate() - week.getDay());
        const key = `${week.getFullYear()}-${String(week.getMonth() + 1).padStart(2, "0")}-${String(week.getDate()).padStart(2, "0")}`;
        buckets.set(key, (buckets.get(key) ?? 0) + (reel.views ?? 0));
      }
      for (const [date, row] of byDate) {
        row[topic.topic] = buckets.get(date) ?? 0;
      }
    }
    return [...byDate.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, row]) => row);
  }, [reels, timeSeries, topTopics]);

  const belowFloor = (topicName: string) => {
    const group = reels.filter((reel) => reel.finalTopic === topicName);
    if (!group.length || summary.averageViews === null) return 0;
    return group.filter((reel) => (reel.views ?? 0) < summary.averageViews!).length / group.length;
  };

  const cadence = timeSeries.length ? (summary.totalReels / Math.max(timeSeries.length, 1)).toFixed(1) : "—";
  const doubleDown = topics.find((topic) => topic.quadrant === "DOUBLE_DOWN") ?? strongest;
  const optimize = topics.find((topic) => topic.quadrant === "OPTIMIZE");
  const explore = topics.find((topic) => topic.quadrant === "EXPLORE");
  const review = topics.find((topic) => topic.quadrant === "REVIEW") ?? weakest;

  return (
    <div className="min-w-0 overflow-x-hidden">
      <div className="w-full border-b border-[var(--border)] bg-[var(--surface-0)] px-4 py-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-1">
              <span className="inline-block h-1.5 w-1.5 bg-[var(--primary-strong)]" />
              <span className="label-caps text-[var(--text-3)]">Analytical engine · index L3</span>
            </div>
            <h1 className="text-xl font-semibold uppercase tracking-tight sm:text-2xl">Instagram Content Performance</h1>
            <p className="text-sm text-[var(--text-2)]">
              Understand which content topics drive reach and engagement across {summary.totalReels} analyzed Reels
              {payload ? ` from @${payload.account.username}` : ""}.
            </p>
          </div>
          <div className="w-full min-w-0 lg:max-w-3xl">
            <KpiStrip
              items={[
                { label: "Corpus", value: String(summary.totalReels), hint: "Reels" },
                { label: "Cumulative reach", value: formatCompact(summary.totalViews) },
                { label: "Likes", value: formatCompact(summary.totalLikes) },
                { label: "Comments", value: formatIntegerSafe(summary.totalComments) },
                { label: "Mean engagement", value: formatPercent(summary.engagementRate), positive: true },
                { label: "Benchmark / post", value: formatCompact(summary.averageViews), accent: true },
              ]}
            />
          </div>
        </div>
      </div>

      <div className="border-b border-[var(--border)] bg-[var(--surface-1)] p-4">
        <div className="mb-3 flex flex-col justify-between gap-2 border-b border-[var(--border)] pb-2 lg:flex-row lg:items-center">
          <HoverTip
            title="Topic performance ranking"
            body="Each row is a content topic. The bar length is average views per Reel. The pink vertical line is the account benchmark. Green past the line means the topic beats the floor. The diamond is engagement rate, plotted independently of views."
            rows={[
              { label: "Account mean", value: formatCompact(summary.averageViews) },
              { label: "Topics shown", value: String(Math.min(8, topics.length)) },
            ]}
          >
            <div className="cursor-help">
              <h2 className="text-base font-semibold uppercase tracking-tight">Topic Performance Ranking &amp; Reach vs. Engagement</h2>
              <p className="text-sm text-[var(--text-3)]">
                Average Reel views by topic compared with the account benchmark. Hover a row for the full readout. Solid bar = mean views; diamond = engagement rate.
              </p>
            </div>
          </HoverTip>
          <div className="metric flex flex-wrap items-center gap-4 text-xs text-[var(--text-3)]">
            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-3 border border-[var(--border)] bg-[var(--surface-4)]" /> Sub-Benchmark</span>
            <span className="inline-flex items-center gap-1.5 text-[var(--positive)]"><span className="h-2 w-3 bg-[var(--positive)]" /> Surplus Alpha</span>
            <span className="inline-flex items-center gap-1.5 text-[var(--primary)]"><span className="h-2 w-2 rotate-45 bg-[var(--primary-strong)]" /> Engagement %</span>
            <span className="inline-flex items-center gap-1.5 border-l border-[var(--border)] pl-3">
              <span className="h-3 w-0.5 bg-[var(--primary-strong)]" /> Account Mean: {formatCompact(summary.averageViews)}
            </span>
          </div>
        </div>
        <TopicBars topics={topics} accountAvg={summary.averageViews} />
      </div>

      <div className="grid grid-cols-1 gap-px border-b border-[var(--border)] bg-[var(--border)] md:grid-cols-2 xl:grid-cols-4">
        <DeviationPanel topics={topics} accountAvg={summary.averageViews} />
        <WhiskerPanel topics={topics} />
        <SparklinePanel topics={topics} series={topicSeries} />
        <MixPanel categories={categories} totalReels={summary.totalReels} />
      </div>

      <div className="grid grid-cols-1 border-b border-[var(--border)] md:grid-cols-2">
        <div className="flex flex-col justify-between border-b border-[var(--border)] bg-[var(--surface-1)] p-4 md:border-b-0 md:border-r">
          <div>
            <div className="mb-3 flex items-center justify-between border-b border-[var(--border)] pb-2">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 bg-[var(--positive)]" />
                <span className="label-caps text-[var(--positive)]">Primary leverage driver</span>
              </div>
              <span className="metric text-xs text-[var(--text-3)]">Diagnostic positive</span>
            </div>
            <span className="label-caps text-xs text-[var(--text-3)]">Category leader</span>
            <h4 className="text-xl font-semibold uppercase tracking-tight sm:text-2xl">{strongest?.topic || "—"}</h4>
            <p className="mt-2 text-sm text-[var(--text-2)]">
              {strongest
                ? `${strongest.topic} is the strongest topic in the current dataset, averaging ${
                    strongest.vsAccountMultiplier !== null ? `${strongest.vsAccountMultiplier.toFixed(1)}×` : "—"
                  } the account benchmark of ${formatCompact(summary.averageViews)}. Consistency is ${formatPercent(strongest.consistency)} across ${strongest.reelCount} Reels.`
                : "No topic data yet."}
            </p>
            <div className="mt-4 mb-4 grid grid-cols-3 gap-2 border border-[var(--border)] bg-[var(--surface-2)] p-2">
              <div className="min-w-0">
                <span className="label-caps block text-[10px]">Avg reach</span>
                <span className="metric truncate text-xs font-bold text-[var(--positive)] sm:text-sm">{formatCompact(strongest?.averageViews)}</span>
              </div>
              <div className="min-w-0">
                <span className="label-caps block text-[10px]">Multiplier</span>
                <span className="metric truncate text-xs font-bold sm:text-sm">
                  {strongest?.vsAccountMultiplier ? `${strongest.vsAccountMultiplier.toFixed(1)}x` : "—"}
                  <span className="hidden sm:inline"> ACCOUNT</span>
                </span>
              </div>
              <div className="min-w-0">
                <span className="label-caps block text-[10px]">Consistency</span>
                <span className="metric truncate text-xs font-bold text-[var(--positive)] sm:text-sm">
                  {formatPercent(strongest?.consistency)}
                  <span className="hidden sm:inline"> HIT-RATE</span>
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 border-t border-[var(--border)] pt-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="metric text-[10px] text-[var(--text-3)] sm:text-xs">
              ACTION: ALLOCATE {strongest ? Math.min(45, Math.round((strongest.reelCount / Math.max(summary.totalReels, 1)) * 100) + 10) : 0}% CALENDAR
            </span>
            {strongest ? (
              <button
                type="button"
                className="label-caps w-full bg-[var(--positive-strong)] px-4 py-1.5 font-bold text-[var(--on-tertiary)] sm:w-auto"
                onClick={() => navigate(`/topics/${slugify(strongest.topic)}`)}
              >
                [View Topic Details]
              </button>
            ) : null}
          </div>
        </div>
        <div className="flex flex-col justify-between bg-[var(--surface-1)] p-4">
          <div>
            <div className="mb-3 flex items-center justify-between border-b border-[var(--border)] pb-2">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 bg-[var(--negative-strong)]" />
                <span className="label-caps text-[var(--negative-strong)]">Deficit warning</span>
              </div>
              <span className="metric text-xs text-[var(--text-3)]">Resource drain</span>
            </div>
            <span className="label-caps text-xs text-[var(--text-3)]">Underperforming vector</span>
            <h4 className="text-xl font-semibold uppercase tracking-tight sm:text-2xl">{weakest?.topic || "—"}</h4>
            <p className="mt-2 text-sm text-[var(--text-2)]">
              {weakest
                ? `Persistent drag versus the account floor of ${formatCompact(summary.averageViews)}. ${Math.round(belowFloor(weakest.topic) * 100)}% of ${weakest.topic} Reels failed to clear the baseline. Average reach is ${formatCompact(weakest.averageViews)}.`
                : "No underperforming topic in the current window."}
            </p>
            <div className="mt-4 mb-4 grid grid-cols-3 gap-2 border border-[var(--border)] bg-[var(--surface-2)] p-2">
              <div className="min-w-0">
                <span className="label-caps block text-[10px]">Avg reach</span>
                <span className="metric truncate text-xs font-bold text-[var(--negative-strong)] sm:text-sm">{formatCompact(weakest?.averageViews)}</span>
              </div>
              <div className="min-w-0">
                <span className="label-caps block text-[10px]">Deficit</span>
                <span className="metric truncate text-xs font-bold text-[var(--negative-strong)] sm:text-sm">
                  {weakest?.vsAccountMultiplier !== null ? `${weakest.vsAccountMultiplier.toFixed(2)}x` : "—"}
                  <span className="hidden sm:inline"> ACCOUNT</span>
                </span>
              </div>
              <div className="min-w-0">
                <span className="label-caps block text-[10px]">Failure index</span>
                <span className="metric truncate text-xs font-bold text-[var(--negative-strong)] sm:text-sm">
                  {weakest ? `${Math.round(belowFloor(weakest.topic) * 100)}%` : "—"}
                  <span className="hidden sm:inline"> SUB-PAR</span>
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 border-t border-[var(--border)] pt-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="metric text-[10px] text-[var(--text-3)] sm:text-xs">RECOMMENDATION: RETIRE OR PIVOT FORMAT</span>
            {weakest ? (
              <button
                type="button"
                className="label-caps w-full border border-[var(--negative-strong)] bg-[var(--surface-3)] px-4 py-1.5 font-bold text-[var(--negative-strong)] sm:w-auto"
                onClick={() => navigate(`/topics/${slugify(weakest.topic)}`)}
              >
                [Analyze Topic]
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="border-b border-[var(--border)] bg-[var(--surface-0)] p-4">
        <div className="mb-3 flex flex-col justify-between gap-2 border-b border-[var(--border)] pb-2 md:flex-row md:items-center">
          <div>
            <h2 className="text-base font-semibold uppercase">Top Breakout Reels</h2>
            <p className="text-sm text-[var(--text-3)]">Reels that generated exceptional baseline multiplier ratios compared to topic median.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="metric text-xs text-[var(--text-3)]">SHOWING {Math.min(5, breakouts.length)} ANOMALIES</span>
            <span className="label-caps bg-[color-mix(in_srgb,var(--primary)_20%,transparent)] px-2 py-0.5 font-bold text-[var(--primary)]">ALPHA &gt; 2.5X</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="label-caps border-b border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-3)]">
                <th className="px-3 py-2.5">Reel title &amp; hook transcript</th>
                <th className="px-3 py-2.5">Topic</th>
                <th className="px-3 py-2.5 text-right">Views</th>
                <th className="px-3 py-2.5 text-right">Benchmark</th>
                <th className="px-3 py-2.5 text-right">Multiplier</th>
                <th className="px-3 py-2.5 text-right">Interactions</th>
                <th className="px-3 py-2.5 text-center">Classification</th>
              </tr>
            </thead>
            <tbody>
              {breakouts.slice(0, 5).map((reel) => (
                <BreakoutRow key={reel.id} reel={reel} onOpen={() => setSelectedReelId(reel.id)} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {underperformers.length ? (
        <div className="border-b border-[var(--border)] bg-[var(--surface-0)] p-4">
          <div className="mb-3 border-b border-[var(--border)] pb-2">
            <h2 className="text-base font-semibold uppercase">Underperforming content</h2>
            <p className="text-sm text-[var(--text-3)]">Reels significantly below topic and/or account average views.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="label-caps border-b border-[var(--border)] text-[var(--text-3)]">
                  <th className="px-3 py-2">Reel</th>
                  <th className="px-3 py-2">Topic</th>
                  <th className="px-3 py-2 text-right">Views</th>
                  <th className="px-3 py-2 text-right">Topic avg</th>
                  <th className="px-3 py-2 text-right">Difference</th>
                  <th className="px-3 py-2 text-right">Engagement</th>
                </tr>
              </thead>
              <tbody>
                {underperformers.slice(0, 5).map((reel) => (
                  <tr key={reel.id} className="cursor-pointer border-b border-[var(--border)] hover:bg-[var(--surface-2)]" onClick={() => setSelectedReelId(reel.id)}>
                    <td className="px-3 py-2 text-sm">{reel.title}</td>
                    <td className="px-3 py-2 text-xs">{reel.finalTopic}</td>
                    <td className="metric px-3 py-2 text-right">{formatCompact(reel.views)}</td>
                    <td className="metric px-3 py-2 text-right">{formatCompact(reel.topicAverageViews)}</td>
                    <td className="metric px-3 py-2 text-right text-[var(--negative-strong)]">{formatDeltaPercent(reel.viewsVsTopic)}</td>
                    <td className="metric px-3 py-2 text-right">{formatPercent(reel.engagement)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      <div className="bg-[var(--surface-1)] p-4">
        <div className="mb-4 flex flex-col gap-2 border-b border-[var(--border)] pb-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold uppercase">Content Opportunities Decision Matrix</h2>
            <p className="text-sm text-[var(--text-3)]">Strategic portfolio allocation directives based on Reach Velocity and Engagement Elasticity.</p>
          </div>
          <div className="metric shrink-0 text-xs text-[var(--text-3)]">ACTIVE CADENCE: {cadence} REELS / WK</div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <OpportunityCard
            index="01"
            title="DOUBLE DOWN"
            subtitle="HIGH REACH · HIGH ENGAGEMENT"
            color="#4edea3"
            topic={doubleDown}
            body={
              doubleDown
                ? `Sustained audience retention with unmatched viral multipliers. Increase production allocation immediately.`
                : "No topic currently sits in this quadrant."
            }
            rows={[
              ["Published:", `${doubleDown?.reelCount ?? 0} Reels`],
              ["Avg views:", formatCompact(doubleDown?.averageViews), "text-[var(--positive)] font-bold"],
              ["Engagement:", formatPercent(doubleDown?.engagement)],
            ]}
            action="Expand Cadence"
            onOpen={() => doubleDown && navigate(`/topics/${slugify(doubleDown.topic)}`)}
          />
          <OpportunityCard
            index="02"
            title="OPTIMIZE HOOKS"
            subtitle="HIGH REACH · LOW ENGAGEMENT"
            color="#c0c1ff"
            topic={optimize}
            body={
              optimize
                ? `Discovery clears the reach floor, but engagement is ${formatPercent(optimize.engagement)} versus the account ${formatPercent(summary.engagementRate)}. Redesign hooks and CTAs.`
                : "No high-reach / low-engagement topic in the current window."
            }
            rows={[
              ["Current ER:", formatPercent(optimize?.engagement), "text-[var(--negative-strong)]"],
              ["Account ER:", formatPercent(summary.engagementRate), "font-bold"],
              ["Action:", "A/B CTA Testing"],
            ]}
            action="Audit Hooks"
            onOpen={() => optimize && navigate(`/topics/${slugify(optimize.topic)}`)}
          />
          <OpportunityCard
            index="03"
            title="EXPLORE & SCALE"
            subtitle="LOW REACH · HIGH ENGAGEMENT"
            color="#ff4c83"
            topic={explore}
            body={
              explore
                ? `Only ${explore.reelCount} Reels published, yet engagement is ${formatPercent(explore.engagement)}. High-confidence test candidate.`
                : "No low-reach / high-engagement topic in the current window."
            }
            rows={[
              ["Sample size:", `n=${explore?.reelCount ?? 0} Posts`],
              ["Avg views:", formatCompact(explore?.averageViews), "font-bold"],
              ["Signal:", formatPercent(explore?.engagement)],
            ]}
            action="Commission Batch"
            onOpen={() => explore && navigate(`/topics/${slugify(explore.topic)}`)}
          />
          <OpportunityCard
            index="04"
            title="REVIEW / PIVOT"
            subtitle="LOW REACH · LOW ENGAGEMENT"
            color="#ffb4ab"
            topic={review}
            body={
              review
                ? `Persistent underperformance across ${review.reelCount} Reels. Diminishing returns confirm audience resistance to the current framing.`
                : "No review-quadrant topic in the current window."
            }
            rows={[
              ["Deficit delta:", formatDeltaPercent(review?.vsAccount), "text-[var(--negative-strong)]"],
              ["Avg views:", formatCompact(review?.averageViews), "font-bold"],
              ["Action:", "Halt Standard Cut"],
            ]}
            action="Pivot Strategy"
            onOpen={() => review && navigate(`/topics/${slugify(review.topic)}`)}
          />
        </div>
      </div>

      <div className="flex flex-col items-center justify-between border-t border-[var(--border)] bg-[var(--surface-0)] px-4 py-2 sm:flex-row">
        <div className="metric flex items-center gap-3 text-xs text-[var(--text-3)]">
          <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 bg-[var(--positive)]" /> LIVE DATA FEED</span>
          <span>/</span>
          <span>TOTAL COMPUTED REELS: {summary.totalReels}</span>
        </div>
        <div className="metric flex items-center gap-4 text-xs text-[var(--text-3)]">
          <span className="font-semibold text-[var(--primary)]">
            SIG: {summary.reelsWithViews && summary.totalReels ? `${((summary.reelsWithViews / summary.totalReels) * 100).toFixed(1)}% METRIC COVERAGE` : "—"}
          </span>
          <span>SYSTEM COORD: [REELS_INTEL_V1]</span>
        </div>
      </div>
    </div>
  );
}

function BreakoutRow({ reel, onOpen }: { reel: EnrichedReel; onOpen: () => void }) {
  const hook = reel.caption.replace(/\s+/g, " ").trim().slice(0, 90);
  return (
    <tr className="cursor-pointer border-b border-[var(--border)] transition-colors duration-150 hover:bg-[color-mix(in_srgb,var(--surface-2)_60%,transparent)]" onClick={onOpen}>
      <td className="px-3 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-8 shrink-0 items-center justify-center border border-[var(--border)] bg-[var(--surface-3)]">
            <span className="text-[var(--primary)]">▶</span>
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="text-xs font-semibold hover:text-[var(--primary)]">{reel.title}</span>
            <span className="max-w-sm truncate text-[11px] text-[var(--text-3)]">{hook ? `“${hook}...”` : "No caption"}</span>
          </div>
        </div>
      </td>
      <td className="px-3 py-3">
        <span className="border border-[var(--border)] bg-[var(--surface-3)] px-1.5 py-0.5 text-[10px] uppercase">{reel.finalTopic}</span>
      </td>
      <td className="metric px-3 py-3 text-right font-bold">{formatCompact(reel.views)}</td>
      <td className="metric px-3 py-3 text-right text-[var(--text-3)]">{formatCompact(reel.topicAverageViews)}</td>
      <td className="px-3 py-3 text-right">
        <span className="border border-[color-mix(in_srgb,var(--positive)_40%,transparent)] bg-[color-mix(in_srgb,var(--positive)_20%,transparent)] px-1.5 py-0.5 font-bold text-[var(--positive)]">
          {reel.topicMultiplier ? `${reel.topicMultiplier.toFixed(1)}x AVG` : "—"}
        </span>
      </td>
      <td className="metric px-3 py-3 text-right text-[var(--text-3)]">
        <span className="font-semibold text-[var(--text)]">{formatIntegerSafe(reel.likes)}</span> L ·{" "}
        <span className="font-semibold text-[var(--text)]">{formatIntegerSafe(reel.comments)}</span> C
      </td>
      <td className="px-3 py-3 text-center">
        <span className="label-caps bg-[var(--primary-strong)] px-2 py-0.5 text-[10px] font-bold tracking-wider text-[var(--on-primary)]">
          {reel.performanceStatus}
        </span>
      </td>
    </tr>
  );
}
