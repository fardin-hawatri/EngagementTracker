import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CartesianGrid, ReferenceLine, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from "recharts";
import { formatCompact, formatDeltaPercent, formatInteger, formatPercent, slugify } from "@shared/format";
import { useDataset } from "../../hooks/useDataset";
import { tooltipSurface } from "../../components/common/ChartTooltip";
import { Section } from "../../components/common/Section";

export function ContentTopicsPage() {
  const { analytics } = useDataset();
  const navigate = useNavigate();
  const [category, setCategory] = useState("ALL");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"avg" | "median" | "eng" | "reels" | "score">("avg");

  const topics = useMemo(() => {
    const filtered = analytics.topics.filter((topic) => {
      if (category !== "ALL" && topic.category !== category) return false;
      if (query && !`${topic.topic} ${topic.category}`.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
    return [...filtered].sort((a, b) => {
      if (sort === "median") return (b.medianViews ?? -1) - (a.medianViews ?? -1);
      if (sort === "eng") return (b.engagement ?? -1) - (a.engagement ?? -1);
      if (sort === "reels") return b.reelCount - a.reelCount;
      if (sort === "score") return (b.performanceScore ?? -1) - (a.performanceScore ?? -1);
      return (b.averageViews ?? -1) - (a.averageViews ?? -1);
    });
  }, [analytics.topics, category, query, sort]);

  const max = Math.max(...topics.map((topic) => topic.averageViews ?? 0), 1);
  const scatter = topics
    .filter((topic) => topic.averageViews !== null && topic.engagement !== null)
    .map((topic) => ({ x: topic.averageViews ?? 0, y: topic.engagement ?? 0, z: topic.reelCount, topic: topic.topic }));

  const cats = ["ALL", ...new Set(analytics.topics.map((topic) => topic.category))];

  return (
    <div>
      <section className="mb-4 bg-[var(--surface-0)] p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="label-caps mb-1 text-[var(--primary)]">Content clustering engine</div>
            <h1 className="text-2xl font-semibold">Content Topics</h1>
            <p className="text-sm text-[var(--text-2)]">Compare the reach, engagement, and consistency of every content topic across your archive.</p>
          </div>
          <div className="flex flex-wrap border border-[var(--border)] bg-[var(--surface-1)]">
            {cats.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`label-caps px-4 py-1 ${category === item ? "bg-[var(--surface-3)] text-[var(--text)]" : "text-[var(--text-3)] hover:bg-[var(--surface-2)]"}`}
              >
                {item === "ALL" ? `All Topics (${analytics.topics.length})` : `${item} (${analytics.topics.filter((topic) => topic.category === item).length})`}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search topic name or category..."
            className="metric w-full max-w-md border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1 text-xs"
          />
          <label className="label-caps flex items-center gap-2 text-[var(--text-3)]">
            Sort by
            <select value={sort} onChange={(event) => setSort(event.target.value as typeof sort)} className="metric border border-[var(--border)] bg-[var(--surface-2)] px-2 py-1 text-[var(--text)]">
              <option value="avg">Avg Views</option>
              <option value="median">Median Views</option>
              <option value="eng">Engagement</option>
              <option value="reels">Reel Count</option>
              <option value="score">Performance Score</option>
            </select>
          </label>
        </div>
      </section>

      <Section title="Topic ranking & reach distribution" explanation="Default ranking is average views, not total views. The notch marks median.">
        <div className="flex flex-col gap-1">
          {topics.map((topic) => (
            <button
              key={topic.topic}
              type="button"
              onClick={() => navigate(`/topics/${slugify(topic.topic)}`)}
              className="flex items-center gap-3 p-1 hover:bg-[var(--surface-2)]"
            >
              <div className="w-48 shrink-0">
                <div className="flex items-center justify-between">
                  <span className="truncate font-semibold">{topic.topic}</span>
                  <span className="label-caps bg-[var(--surface-3)] px-1 text-[var(--primary)]">{topic.category}</span>
                </div>
                <div className="metric text-xs text-[var(--text-3)]">
                  {topic.reelCount} Reels · Peak {formatCompact(topic.maxViews)}
                </div>
              </div>
              <div className="relative h-5 flex-1 bg-[var(--surface-3)]">
                <div className="h-full bg-[color-mix(in_srgb,var(--primary-strong)_75%,transparent)]" style={{ width: `${((topic.averageViews ?? 0) / max) * 100}%` }} />
                {topic.medianViews !== null ? (
                  <div className="absolute top-0 bottom-0 w-1 bg-[var(--positive)]" style={{ left: `${(topic.medianViews / max) * 100}%` }} />
                ) : null}
              </div>
              <div className="metric flex w-72 shrink-0 items-center justify-between text-xs">
                <span>{formatCompact(topic.averageViews)} AVG</span>
                <span className="text-[var(--positive)]">{formatCompact(topic.medianViews)} MED</span>
                <span>{formatPercent(topic.engagement)}</span>
                <span className={ (topic.vsAccount ?? 0) >= 8 ? "text-[var(--positive)]" : (topic.vsAccount ?? 0) <= -8 ? "text-[var(--negative-strong)]" : "text-[var(--secondary)]"}>
                  {(topic.vsAccount ?? 0) >= 8 ? "ABOVE" : (topic.vsAccount ?? 0) <= -8 ? "BELOW" : "NEAR"}
                </span>
              </div>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Reach vs engagement matrix" explanation="Click a point to open that topic. Center lines are account averages.">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart>
              <CartesianGrid stroke="var(--border)" strokeDasharray="2 4" />
              <XAxis type="number" dataKey="x" tickFormatter={(value) => formatCompact(Number(value))} stroke="var(--text-3)" fontSize={10} />
              <YAxis type="number" dataKey="y" tickFormatter={(value) => `${Number(value).toFixed(1)}%`} stroke="var(--text-3)" fontSize={10} />
              <ZAxis dataKey="z" range={[50, 180]} />
              {analytics.summary.averageViews ? <ReferenceLine x={analytics.summary.averageViews} stroke="var(--indigo)" /> : null}
              {analytics.summary.engagementRate ? <ReferenceLine y={analytics.summary.engagementRate} stroke="var(--indigo)" /> : null}
              <Tooltip
                content={({ payload }) => {
                  const row = payload?.[0]?.payload as { topic?: string; x?: number; y?: number; z?: number } | undefined;
                  if (!row?.topic) return null;
                  return tooltipSurface(
                    [
                      { label: "Avg views", value: formatCompact(row.x ?? null) },
                      { label: "Engagement", value: formatPercent(row.y ?? null) },
                      { label: "Reels", value: String(row.z ?? 0) },
                    ],
                    row.topic,
                  );
                }}
              />
              <Scatter
                data={scatter}
                fill="var(--primary-strong)"
                cursor="pointer"
                onClick={(entry) => {
                  const topic = (entry as { topic?: string }).topic;
                  if (topic) navigate(`/topics/${slugify(topic)}`);
                }}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </Section>

      <Section title="Topic performance matrix" explanation="Dense analytical table for every topic in the current date window.">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="label-caps bg-[var(--surface-1)] text-[var(--text-3)]">
                {["Topic", "Category", "Reels", "Avg Views", "Median", "Top Reel", "Avg Likes", "Avg Comments", "Engagement", "vs Bench", "Score", "Action"].map((header) => (
                  <th key={header} className={`px-2 py-2.5 ${["Reels", "Avg Views", "Median", "Top Reel", "Avg Likes", "Avg Comments", "Engagement", "Score"].includes(header) ? "text-right" : ""}`}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topics.map((topic) => (
                <tr key={topic.topic} className="border-b border-[var(--border)] hover:bg-[var(--surface-2)]">
                  <td className="px-2 py-2.5 font-semibold">{topic.topic}</td>
                  <td className="px-2 py-2.5"><span className="label-caps bg-[var(--surface-3)] px-1 text-[var(--primary)]">{topic.category}</span></td>
                  <td className="metric px-2 py-2.5 text-right">{topic.reelCount}</td>
                  <td className="metric px-2 py-2.5 text-right">{formatInteger(topic.averageViews)}</td>
                  <td className="metric px-2 py-2.5 text-right text-[var(--positive)]">{formatInteger(topic.medianViews)}</td>
                  <td className="metric px-2 py-2.5 text-right">{formatInteger(topic.topReelViews)}</td>
                  <td className="metric px-2 py-2.5 text-right">{formatInteger(topic.averageLikes)}</td>
                  <td className="metric px-2 py-2.5 text-right">{formatInteger(topic.averageComments)}</td>
                  <td className="metric px-2 py-2.5 text-right">{formatPercent(topic.engagement)}</td>
                  <td className="metric px-2 py-2.5 text-center">{formatDeltaPercent(topic.vsAccount)}</td>
                  <td className="metric px-2 py-2.5 text-right">{topic.performanceScore === null ? "—" : topic.performanceScore.toFixed(1)}</td>
                  <td className="px-2 py-2.5 text-center">
                    <button type="button" className="label-caps text-[var(--primary)]" onClick={() => navigate(`/topics/${slugify(topic.topic)}`)}>
                      Detail →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}
