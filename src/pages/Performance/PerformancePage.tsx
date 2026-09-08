import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CartesianGrid, Line, LineChart, Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine } from "recharts";
import { formatCompact, formatPercent, slugify } from "@shared/format";
import { useDataset } from "../../hooks/useDataset";
import { tooltipSurface } from "../../components/common/ChartTooltip";
import { Section } from "../../components/common/Section";
import type { TimePoint } from "@shared/types";

export function PerformancePage() {
  const { analytics, setSelectedReelId } = useDataset();
  const navigate = useNavigate();
  const [topic, setTopic] = useState(analytics.topics[0]?.topic ?? "");
  const selected = analytics.topics.find((item) => item.topic === topic) ?? analytics.topics[0];

  const series = analytics.timeSeries;
  const dist = analytics.distribution;

  const topicBars = useMemo(
    () =>
      analytics.topics.slice(0, 12).map((item) => ({
        topic: item.topic,
        views: item.averageViews ?? 0,
        engagement: item.engagement ?? 0,
      })),
    [analytics.topics],
  );

  return (
    <div>
      <div className="border-b border-[var(--border)] bg-[var(--surface-0)] px-4 py-3">
        <div className="label-caps text-[var(--primary)]">Performance workspace</div>
        <h1 className="text-2xl font-semibold uppercase">Performance</h1>
        <p className="text-sm text-[var(--text-2)]">
          Time series, distributions, topic and format comparisons calculated from the filtered Instagram dataset.
        </p>
      </div>

      <Section title="Views over time" explanation="Weekly summed views for Reels in the current date window. Hover for date, views, and account benchmark.">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="2 4" />
              <XAxis dataKey="label" stroke="var(--text-3)" fontSize={10} />
              <YAxis tickFormatter={(value) => formatCompact(Number(value))} stroke="var(--text-3)" fontSize={10} />
              {analytics.summary.averageViews ? <ReferenceLine y={analytics.summary.averageViews} stroke="var(--indigo)" strokeDasharray="4 2" /> : null}
              <Tooltip
                content={({ label, payload }) =>
                  tooltipSurface(
                    [
                      { label: "Views", value: formatCompact(Number(payload?.[0]?.payload?.views)) },
                      { label: "Benchmark", value: formatCompact(analytics.summary.averageViews) },
                      { label: "Reels", value: String(payload?.[0]?.payload?.reelCount ?? 0) },
                    ],
                    String(label),
                  )
                }
              />
              <Line type="linear" dataKey="views" stroke="#ff4c83" strokeWidth={2} dot={{ r: 3 }} name="Views" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Section>

      <div className="grid grid-cols-1 lg:grid-cols-3">
        <Section title="Likes over time" explanation="Weekly likes from available Instagram metrics.">
          <MiniLine data={series} dataKey="likes" color="#c0c1ff" />
        </Section>
        <Section title="Comments over time" explanation="Weekly comments from available Instagram metrics.">
          <MiniLine data={series} dataKey="comments" color="#4edea3" />
        </Section>
        <Section title="Engagement over time" explanation="(likes + comments) / views for each week. Null weeks are omitted from the rate.">
          <MiniLine data={series} dataKey="engagement" color="#ffb1c0" percent />
        </Section>
      </div>

      <Section title="Topic performance" explanation="Average views by topic versus the account benchmark line.">
        <div className="mb-3">
          <label className="label-caps text-[var(--text-3)]">
            Focus topic
            <select className="metric ml-2 border border-[var(--border)] bg-[var(--surface-2)] px-2 py-1" value={topic} onChange={(event) => setTopic(event.target.value)}>
              {analytics.topics.map((item) => (
                <option key={item.topic} value={item.topic}>
                  {item.topic}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topicBars}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="2 4" />
              <XAxis dataKey="topic" stroke="var(--text-3)" fontSize={10} interval={0} angle={-25} textAnchor="end" height={70} />
              <YAxis tickFormatter={(value) => formatCompact(Number(value))} stroke="var(--text-3)" fontSize={10} />
              {analytics.summary.averageViews ? <ReferenceLine y={analytics.summary.averageViews} stroke="var(--indigo)" /> : null}
              <Tooltip
                content={({ payload }) => {
                  const row = payload?.[0]?.payload as { topic?: string; views?: number; engagement?: number } | undefined;
                  if (!row?.topic) return null;
                  return tooltipSurface(
                    [
                      { label: "Avg views", value: formatCompact(row.views ?? null) },
                      { label: "Engagement", value: formatPercent(row.engagement ?? null) },
                    ],
                    row.topic,
                  );
                }}
              />
              <Bar
                dataKey="views"
                fill="#ff4c83"
                cursor="pointer"
                onClick={(entry) => navigate(`/topics/${slugify(String((entry as { topic?: string }).topic))}`)}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {selected ? (
          <p className="mt-3 text-sm text-[var(--text-2)]">
            {selected.topic} averages {formatCompact(selected.averageViews)} views with {formatPercent(selected.engagement)} engagement
            {selected.vsAccount !== null ? ` (${selected.vsAccount >= 0 ? "+" : ""}${selected.vsAccount.toFixed(1)}% vs account).` : "."}
          </p>
        ) : null}
      </Section>

      <Section title="Content type performance" explanation="Formats ranked by average views. Content type is independent of topic.">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="label-caps text-[var(--text-3)]">
                <th className="px-2 py-2">Format</th>
                <th className="px-2 py-2 text-right">Reels</th>
                <th className="px-2 py-2 text-right">Avg views</th>
                <th className="px-2 py-2 text-right">Engagement</th>
                <th className="px-2 py-2 text-right">Score</th>
              </tr>
            </thead>
            <tbody>
              {analytics.contentTypes.map((item) => (
                <tr key={item.contentType} className="border-b border-[var(--border)]">
                  <td className="px-2 py-2">{item.contentType}</td>
                  <td className="metric px-2 py-2 text-right">{item.reelCount}</td>
                  <td className="metric px-2 py-2 text-right">{formatCompact(item.averageViews)}</td>
                  <td className="metric px-2 py-2 text-right">{formatPercent(item.engagement)}</td>
                  <td className="metric px-2 py-2 text-right">{item.performanceScore?.toFixed(1) ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="View distribution" explanation="Buckets are generated from the current filtered Reel views.">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dist}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="2 4" />
              <XAxis dataKey="label" stroke="var(--text-3)" fontSize={10} />
              <YAxis stroke="var(--text-3)" fontSize={10} />
              <Tooltip content={({ payload }) => tooltipSurface([{ label: "Reels", value: String(payload?.[0]?.value ?? 0) }, { label: "Share", value: formatPercent(payload?.[0]?.payload?.percentage) }], String(payload?.[0]?.payload?.label))} />
              <Bar dataKey="count" fill="#3131c0" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Section>

      <div className="grid grid-cols-1 lg:grid-cols-2">
        <Section title="Breakouts" explanation="Reels at or above 2.5× topic average or 3× account average.">
          {analytics.breakouts.slice(0, 8).map((reel) => (
            <button key={reel.id} type="button" className="mb-1 flex w-full justify-between px-1 py-1 text-left hover:bg-[var(--surface-2)]" onClick={() => setSelectedReelId(reel.id)}>
              <span>{reel.title}</span>
              <span className="metric text-[var(--positive)]">{reel.topicMultiplier?.toFixed(1)}×</span>
            </button>
          ))}
        </Section>
        <Section title="Underperformers" explanation="Reels at or below 50% of topic or account average views.">
          {analytics.underperformers.slice(0, 8).map((reel) => (
            <button key={reel.id} type="button" className="mb-1 flex w-full justify-between px-1 py-1 text-left hover:bg-[var(--surface-2)]" onClick={() => setSelectedReelId(reel.id)}>
              <span>{reel.title}</span>
              <span className="metric text-[var(--negative-strong)]">{formatCompact(reel.views)}</span>
            </button>
          ))}
        </Section>
      </div>
    </div>
  );
}

function MiniLine({
  data,
  dataKey,
  color,
  percent,
}: {
  data: TimePoint[];
  dataKey: "likes" | "comments" | "engagement";
  color: string;
  percent?: boolean;
}) {
  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="2 4" />
          <XAxis dataKey="label" stroke="var(--text-3)" fontSize={10} />
          <YAxis tickFormatter={(value) => (percent ? `${Number(value).toFixed(1)}%` : formatCompact(Number(value)))} stroke="var(--text-3)" fontSize={10} />
          <Tooltip
            content={({ label, payload }) =>
              tooltipSurface(
                [{ label: dataKey, value: percent ? formatPercent(Number(payload?.[0]?.value)) : formatCompact(Number(payload?.[0]?.value)) }],
                String(label),
              )
            }
          />
          <Line type="linear" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
