import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { formatCompact, formatPercent, formatShortDate } from "@shared/format";
import { useDataset } from "../../hooks/useDataset";
import { useFilters } from "../../hooks/useFilters";
import { ReelInspection } from "../../components/reels/ReelInspection";
import { StatusBadge } from "../../components/common/Section";
import { useAvailableCategories, useAvailableContentTypes, useAvailableTopics } from "../../hooks/useDataset";
import type { EnrichedReel } from "@shared/types";

type SortKey = "publishedAt" | "views" | "likes" | "comments" | "engagement" | "title" | "topic";

export function AllReelsPage() {
  const { analytics, setSelectedReelId, selectedReelId, payload } = useDataset();
  const filters = useFilters();
  const topics = useAvailableTopics();
  const categories = useAvailableCategories();
  const types = useAvailableContentTypes();
  const [params] = useSearchParams();
  const [sortKey, setSort] = useState<SortKey>("views");
  const [dir, setDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const { setCategory } = filters;

  useEffect(() => {
    const category = params.get("category");
    if (category) setCategory(category);
  }, [params, setCategory]);

  const rows = useMemo(() => {
    const sorted = [...analytics.reels].sort((a, b) => compare(a, b, sortKey, dir));
    return sorted;
  }, [analytics.reels, sortKey, dir]);

  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const pageRows = rows.slice(page * pageSize, page * pageSize + pageSize);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setDir((value) => (value === "asc" ? "desc" : "asc"));
    else {
      setSort(key);
      setDir(key === "title" || key === "topic" || key === "publishedAt" ? "asc" : "desc");
    }
  };

  return (
    <div className="p-4">
      <div className="mb-3 flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <div className="label-caps text-[var(--text-3)]">Corpus explorer / indexed Instagram dataset</div>
          <h1 className="text-2xl font-semibold uppercase">All Reels</h1>
          <p className="metric text-xs text-[var(--text-3)]">
            {rows.length} published entities in view · {payload ? `${payload.reelCount} total cached` : ""}
          </p>
        </div>
      </div>

      <div className="mb-px grid grid-cols-12 gap-px border border-[var(--border)] bg-[var(--border)]">
        <label className="col-span-12 bg-[var(--surface-2)] px-3 py-2 lg:col-span-4">
          <span className="label-caps text-[9px] text-[var(--text-3)]">Search</span>
          <input value={filters.search} onChange={(event) => filters.setSearch(event.target.value)} className="metric w-full bg-transparent text-xs outline-none" placeholder="Title, caption, topic..." />
        </label>
        <Select className="col-span-6 lg:col-span-2" label="Topic" value={filters.topic} onChange={filters.setTopic} options={["ALL", ...topics]} />
        <Select className="col-span-6 lg:col-span-2" label="Category" value={filters.category} onChange={filters.setCategory} options={["ALL", ...categories]} />
        <Select className="col-span-6 lg:col-span-2" label="Content type" value={filters.contentType} onChange={filters.setContentType} options={["ALL", ...types]} />
        <Select className="col-span-6 lg:col-span-2" label="Performance" value={filters.performance} onChange={filters.setPerformance} options={["ALL", "BREAKOUT", "ABOVE", "BELOW", "UNDER"]} />
      </div>

      <div className="grid grid-cols-12 border-x border-b border-[var(--border)]">
        <div className={`${selectedReelId ? "col-span-12 xl:col-span-8" : "col-span-12"} overflow-x-auto`}>
          <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-2)] px-4 py-2">
            <span className="metric text-xs text-[var(--positive)]">{rows.length} matching</span>
            <div className="flex items-center gap-2">
              {[25, 50, 100].map((size) => (
                <button key={size} type="button" className={`label-caps px-2 py-0.5 ${pageSize === size ? "bg-[var(--surface-4)]" : "border border-[var(--border)]"}`} onClick={() => { setPageSize(size); setPage(0); }}>
                  {size}
                </button>
              ))}
            </div>
          </div>
          <table className="w-full min-w-[900px] text-left">
            <thead>
              <tr className="label-caps bg-[var(--surface-1)] text-[10px] text-[var(--text-3)]">
                <Th>#</Th>
                <Th onClick={() => toggleSort("title")} active={sortKey === "title"} dir={dir}>Reel</Th>
                <Th onClick={() => toggleSort("topic")} active={sortKey === "topic"} dir={dir}>Topic</Th>
                <Th>Category</Th>
                <Th onClick={() => toggleSort("publishedAt")} active={sortKey === "publishedAt"} dir={dir}>Date</Th>
                <Th onClick={() => toggleSort("views")} active={sortKey === "views"} dir={dir} right>Views</Th>
                <Th onClick={() => toggleSort("likes")} active={sortKey === "likes"} dir={dir} right>Likes</Th>
                <Th onClick={() => toggleSort("comments")} active={sortKey === "comments"} dir={dir} right>Comments</Th>
                <Th onClick={() => toggleSort("engagement")} active={sortKey === "engagement"} dir={dir} right>Engagement</Th>
                <Th right>Vs topic avg</Th>
                <Th>Performance</Th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((reel, index) => (
                <tr
                  key={reel.id}
                  className={`cursor-pointer border-b border-[var(--border)] hover:bg-[var(--surface-2)] ${selectedReelId === reel.id ? "border-l-2 border-l-[var(--primary-strong)] bg-[var(--surface-3)]" : ""}`}
                  tabIndex={0}
                  onClick={() => setSelectedReelId(reel.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") setSelectedReelId(reel.id);
                  }}
                >
                  <td className="metric px-2 py-2.5 text-center text-[var(--text-3)]">{String(page * pageSize + index + 1).padStart(2, "0")}</td>
                  <td className="px-2 py-2.5">
                    <div className="text-sm font-semibold">{reel.title}</div>
                    <div className="max-w-[240px] truncate text-[10px] text-[var(--text-3)]">{reel.caption}</div>
                  </td>
                  <td className="px-2 py-2.5 text-xs">{reel.finalTopic}</td>
                  <td className="px-2 py-2.5 text-xs">{reel.primaryCategory}</td>
                  <td className="metric px-2 py-2.5 text-center text-[var(--text-3)]">{formatShortDate(reel.publishedAt)}</td>
                  <td className="metric px-2 py-2.5 text-right">{formatCompact(reel.views)}</td>
                  <td className="metric px-2 py-2.5 text-right">{formatCompact(reel.likes)}</td>
                  <td className="metric px-2 py-2.5 text-right">{formatCompact(reel.comments)}</td>
                  <td className="metric px-2 py-2.5 text-right text-[var(--positive)]">{formatPercent(reel.engagement)}</td>
                  <td className="metric px-2 py-2.5 text-right">{reel.topicMultiplier ? `${reel.topicMultiplier.toFixed(1)}×` : "—"}</td>
                  <td className="px-2 py-2.5 text-center"><StatusBadge status={reel.performanceStatus} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex items-center justify-between px-4 py-2">
            <span className="metric text-xs">Page {page + 1} of {pageCount}</span>
            <div className="flex gap-1">
              <button type="button" className="border border-[var(--border)] px-2" disabled={page === 0} onClick={() => setPage(0)}>«</button>
              <button type="button" className="border border-[var(--border)] px-2" disabled={page === 0} onClick={() => setPage((value) => Math.max(0, value - 1))}>‹</button>
              <button type="button" className="border border-[var(--border)] px-2" disabled={page + 1 >= pageCount} onClick={() => setPage((value) => value + 1)}>›</button>
              <button type="button" className="border border-[var(--border)] px-2" disabled={page + 1 >= pageCount} onClick={() => setPage(pageCount - 1)}>»</button>
            </div>
          </div>
        </div>
        {selectedReelId ? (
          <div className="col-span-12 xl:col-span-4">
            <ReelInspection onClose={() => setSelectedReelId(null)} embedded />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  className?: string;
}) {
  return (
    <label className={`bg-[var(--surface-2)] px-3 py-2 ${className ?? ""}`}>
      <span className="label-caps text-[9px] text-[var(--text-3)]">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="metric w-full bg-transparent text-xs outline-none">
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function Th({
  children,
  onClick,
  active,
  dir,
  right,
}: {
  children: string;
  onClick?: () => void;
  active?: boolean;
  dir?: "asc" | "desc";
  right?: boolean;
}) {
  return (
    <th className={`px-2 py-2.5 ${right ? "text-right" : ""}`}>
      <button type="button" className="uppercase" onClick={onClick}>
        {children}
        {active ? (dir === "asc" ? " ↑" : " ↓") : ""}
      </button>
    </th>
  );
}

function compare(a: EnrichedReel, b: EnrichedReel, key: SortKey, dir: "asc" | "desc"): number {
  const mul = dir === "asc" ? 1 : -1;
  if (key === "title") return a.title.localeCompare(b.title) * mul;
  if (key === "topic") return a.finalTopic.localeCompare(b.finalTopic) * mul;
  if (key === "publishedAt") return (new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()) * mul;
  const av = (key === "engagement" ? a.engagement : a[key]) ?? -1;
  const bv = (key === "engagement" ? b.engagement : b[key]) ?? -1;
  return (Number(av) - Number(bv)) * mul;
}
