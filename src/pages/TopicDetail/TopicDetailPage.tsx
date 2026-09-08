import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine, Bar, BarChart } from "recharts";
import { buildDistribution, buildTopicTimeSeries, explainTopic } from "@shared/analytics";
import { formatCompact, formatDate, formatPercent, slugify } from "@shared/format";
import { useDataset } from "../../hooks/useDataset";
import { tooltipSurface } from "../../components/common/ChartTooltip";
import { EmptyState, KpiStrip, Section } from "../../components/common/Section";

export function TopicDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { analytics, setSelectedReelId } = useDataset();
  const topic = analytics.topics.find((item) => slugify(item.topic) === slug);

  const reels = useMemo(
    () => analytics.reels.filter((reel) => slugify(reel.finalTopic) === slug),
    [analytics.reels, slug],
  );

  const timeSeries = useMemo(
    () => (topic ? buildTopicTimeSeries(reels, topic.topic, analytics.summary.averageViews) : []),
    [analytics.summary.averageViews, reels, topic],
  );
  const distribution = useMemo(() => buildDistribution(reels), [reels]);

  const formats = useMemo(() => {
    const groups = new Map<string, typeof reels>();
    for (const reel of reels) {
      const list = groups.get(reel.contentType) ?? [];
      list.push(reel);
      groups.set(reel.contentType, list);
    }
    return [...groups.entries()]
      .map(([contentType, group]) => {
        const views = group.map((reel) => reel.views).filter((value): value is number => value !== null);
        const avg = views.length ? views.reduce((sum, value) => sum + value, 0) / views.length : null;
        const likes = group.reduce((sum, reel) => sum + (reel.likes ?? 0), 0);
        const comments = group.reduce((sum, reel) => sum + (reel.comments ?? 0), 0);
        const totalViews = views.reduce((sum, value) => sum + value, 0);
        const engagement = totalViews > 0 ? ((likes + comments) / totalViews) * 100 : null;
        return { contentType, reelCount: group.length, averageViews: avg, engagement };
      })
      .sort((a, b) => (b.averageViews ?? -1) - (a.averageViews ?? -1));
  }, [reels]);

  if (!topic) {
    return (
      <div className="p-4">
        <EmptyState title="Topic not found" body="This topic is not present in the current filtered dataset." />
      </div>
    );
  }

  const top = [...reels].sort((a, b) => (b.views ?? -1) - (a.views ?? -1)).slice(0, 5);
  const under = [...reels].filter((reel) => reel.isUnderperforming).slice(0, 5);
  const bestFormat = formats[0];

  return (
    <div>
      <section className="bg-[var(--surface-1)]">
        <div className="flex items-center justify-between bg-[var(--surface-0)] px-4 py-2">
          <div className="label-caps flex items-center gap-1 text-[var(--text-3)]">
            <Link to="/topics" className="hover:text-[var(--primary)]">← Topics Registry</Link>
            <span>/</span>
            <span className="text-[var(--secondary)]">{topic.category}</span>
            <span>/</span>
            <span className="text-[var(--primary)]">{topic.topic}</span>
          </div>
        </div>
        <div className="flex flex-col justify-between gap-4 p-4 md:flex-row md:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold uppercase">{topic.topic}</h1>
              <span className="label-caps bg-[var(--surface-3)] px-1 text-[var(--secondary)]">Category: {topic.category}</span>
            </div>
            <p className="mt-2 max-w-3xl text-sm text-[var(--text-2)]">{explainTopic(topic, analytics.summary)}</p>
            {bestFormat ? (
              <p className="mt-2 text-sm text-[var(--text-3)]">
                {bestFormat.contentType} Reels currently lead this topic at {formatCompact(bestFormat.averageViews)} average views.
              </p>
            ) : null}
          </div>
        </div>
        <KpiStrip
          items={[
            { label: "Published Reels", value: String(topic.reelCount) },
            { label: "Total Views", value: formatCompact(topic.totalViews) },
            { label: "Average Views", value: formatCompact(topic.averageViews), accent: true },
            { label: "Median Views", value: formatCompact(topic.medianViews) },
            { label: "Avg Engagement", value: formatPercent(topic.engagement) },
            { label: "Consistency", value: formatPercent(topic.consistency) },
          ]}
        />
      </section>

      <section className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-12">
        <div className="border border-[var(--border)] bg-[var(--surface-1)] p-4 lg:col-span-8">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold uppercase">Views over time</h2>
              <p className="text-xs text-[var(--text-3)]">Actual weekly views versus the account benchmark.</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeries}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="2 4" />
                <XAxis dataKey="label" stroke="var(--text-3)" fontSize={10} />
                <YAxis tickFormatter={(value) => formatCompact(Number(value))} stroke="var(--text-3)" fontSize={10} />
                {analytics.summary.averageViews ? <ReferenceLine y={analytics.summary.averageViews} stroke="var(--primary)" strokeDasharray="4 2" /> : null}
                <Tooltip
                  content={({ payload, label }) =>
                    tooltipSurface(
                      [
                        { label: "Views", value: formatCompact(Number(payload?.[0]?.value)) },
                        { label: "Benchmark", value: formatCompact(analytics.summary.averageViews) },
                        { label: "Reels", value: String(payload?.[0]?.payload?.reelCount ?? 0) },
                      ],
                      String(label),
                    )
                  }
                />
                <Line type="linear" dataKey="views" name={topic.topic} stroke="#ffb1c0" strokeWidth={2} dot={{ r: 3, fill: "#ff4c83" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="border border-[var(--border)] bg-[var(--surface-1)] p-4 lg:col-span-4">
          <h2 className="text-base font-semibold uppercase">Distribution</h2>
          <p className="mb-3 text-xs text-[var(--text-3)]">How Reel views in this topic are spread across buckets.</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distribution} layout="vertical">
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="label" width={90} stroke="var(--text-3)" fontSize={10} />
                <Tooltip content={({ payload }) => tooltipSurface([{ label: "Reels", value: String(payload?.[0]?.value ?? 0) }], String(payload?.[0]?.payload?.label))} />
                <Bar dataKey="count" fill="#ff4c83" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <Section title="Content type breakdown" explanation="Content type is scored independently from topic. Use this to decide which format to produce next.">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="label-caps text-[var(--text-3)]">
                <th className="px-2 py-2">Format</th>
                <th className="px-2 py-2 text-right">Reels</th>
                <th className="px-2 py-2 text-right">Avg views</th>
                <th className="px-2 py-2 text-right">Engagement</th>
              </tr>
            </thead>
            <tbody>
              {formats.map((format) => (
                <tr key={format.contentType} className="border-b border-[var(--border)]">
                  <td className="px-2 py-2 font-semibold">{format.contentType}</td>
                  <td className="metric px-2 py-2 text-right">{format.reelCount}</td>
                  <td className="metric px-2 py-2 text-right">{formatCompact(format.averageViews)}</td>
                  <td className="metric px-2 py-2 text-right">{formatPercent(format.engagement)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <div className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-2">
        <div className="border border-[var(--border)] bg-[var(--surface-1)] p-4">
          <h2 className="mb-3 text-base font-semibold uppercase">Top performing Reels</h2>
          {top.map((reel) => (
            <button key={reel.id} type="button" className="mb-2 flex w-full items-start justify-between border border-[var(--border)] bg-[var(--surface-2)] p-2 text-left hover:bg-[var(--surface-3)]" onClick={() => setSelectedReelId(reel.id)}>
              <div>
                <div className="font-semibold">{reel.title}</div>
                <div className="metric text-[11px] text-[var(--text-3)]">{formatDate(reel.publishedAt)} · {reel.contentType}</div>
              </div>
              <div className="metric text-right">
                <div className="font-bold text-[var(--primary)]">{formatCompact(reel.views)}</div>
                <div className="text-[var(--positive)]">{formatPercent(reel.engagement)}</div>
              </div>
            </button>
          ))}
        </div>
        <div className="border border-[var(--border)] bg-[var(--surface-1)] p-4">
          <h2 className="mb-3 text-base font-semibold uppercase">Underperforming Reels</h2>
          {under.length === 0 ? <p className="text-sm text-[var(--text-3)]">No underperforming Reels in this topic for the current window.</p> : null}
          {under.map((reel) => (
            <button key={reel.id} type="button" className="mb-2 flex w-full items-start justify-between border border-[var(--border)] bg-[var(--surface-2)] p-2 text-left" onClick={() => setSelectedReelId(reel.id)}>
              <div>
                <div className="font-semibold">{reel.title}</div>
                <div className="metric text-[11px] text-[var(--text-3)]">{formatDate(reel.publishedAt)}</div>
              </div>
              <div className="metric text-right text-[var(--negative-strong)]">{formatCompact(reel.views)}</div>
            </button>
          ))}
        </div>
      </div>

      <Section title="Production recommendation" explanation="Generated from the current topic's live averages, formats, and consistency.">
        <p className="text-sm">
          {topic.vsAccountMultiplier && topic.vsAccountMultiplier >= 1
            ? `Increase production of ${topic.topic}. It is averaging ${topic.vsAccountMultiplier.toFixed(1)}× account views.`
            : `Reform ${topic.topic} before adding volume. Average views sit ${topic.vsAccount !== null ? `${topic.vsAccount.toFixed(0)}% vs account` : "without a reliable benchmark"}.`}
          {bestFormat ? ` Prioritize the ${bestFormat.contentType} format.` : ""}
        </p>
        <button type="button" className="label-caps mt-3 border border-[var(--border)] px-3 py-1" onClick={() => navigate("/reels")}>
          Open matching Reels
        </button>
      </Section>
    </div>
  );
}
