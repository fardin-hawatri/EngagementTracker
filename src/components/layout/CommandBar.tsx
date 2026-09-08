import { Download, Moon, RefreshCw, Search, Sun, User } from "lucide-react";
import type { DatePreset } from "@shared/types";
import { reelsToCsv } from "@shared/csv";
import { downloadCsv } from "../../lib/downloadCsv";
import { useDataset } from "../../hooks/useDataset";
import { useFilters } from "../../hooks/useFilters";
import { useTheme } from "../../hooks/useTheme";

const PRESETS: DatePreset[] = ["7D", "30D", "90D", "YTD", "ALL"];

export function CommandBar({
  title,
  onMenu,
}: {
  title: string;
  onMenu: () => void;
}) {
  const { search, setSearch, date, setDatePreset, setCustomRange, rangeLabel } = useFilters();
  const { refresh, refreshing, analytics, payload } = useDataset();
  const { theme, toggleTheme } = useTheme();

  const exportCsv = () => {
    const csv = reelsToCsv(analytics.reels);
    downloadCsv(`content-intel-reels-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  const presetButtons = (
    <>
      {PRESETS.map((preset) => (
        <button
          key={preset}
          type="button"
          onClick={() => setDatePreset(preset)}
          className={`label-caps shrink-0 border-r border-[var(--border)] px-2 py-1 ${
            date.preset === preset ? "bg-[var(--surface-4)] font-semibold text-[var(--text)]" : "text-[var(--text-3)] hover:bg-[var(--surface-3)]"
          }`}
        >
          {preset}
        </button>
      ))}
      <button
        type="button"
        onClick={() => setDatePreset("CUSTOM")}
        className={`label-caps shrink-0 border-r border-[var(--border)] px-2 py-1 ${
          date.preset === "CUSTOM" ? "bg-[var(--surface-4)] font-semibold text-[var(--text)]" : "text-[var(--text-3)] hover:bg-[var(--surface-3)]"
        }`}
      >
        CUSTOM
      </button>
    </>
  );

  return (
    <header className="fixed right-0 top-0 z-30 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--surface-0)_95%,transparent)] backdrop-blur-md xl:left-72">
      <div className="flex h-14 min-w-0 items-center justify-between gap-2 px-3 lg:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <button type="button" className="shrink-0 border border-[var(--border)] px-2 py-1 xl:hidden" onClick={onMenu} aria-label="Open menu">
            Menu
          </button>
          <div className="label-caps hidden min-w-0 text-[var(--text-3)] xl:flex">
            <span>Workspace</span>
            <span className="mx-1 text-[var(--text-4)]">/</span>
            <span className="truncate font-semibold text-[var(--text)]">{title}</span>
          </div>
          <div className="hidden h-4 w-px bg-[var(--border)] xl:block" />
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2" size={14} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="metric w-full min-w-0 max-w-64 border border-[var(--border)] bg-[var(--surface-2)] py-1 pl-8 pr-2 text-xs outline-none focus:border-[var(--primary)]"
              placeholder="Search..."
              aria-label="Global search"
            />
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <div className="hidden items-center border border-[var(--border)] bg-[var(--surface-2)] xl:flex">
            {presetButtons}
            {date.preset === "CUSTOM" ? (
              <div className="flex items-center gap-1 px-2 py-0.5">
                <input
                  type="date"
                  className="metric bg-transparent text-[10px] outline-none"
                  onChange={(event) => {
                    const start = new Date(event.target.value);
                    const end = date.end ?? new Date();
                    if (!Number.isNaN(start.getTime())) setCustomRange(start, end);
                  }}
                />
                <input
                  type="date"
                  className="metric bg-transparent text-[10px] outline-none"
                  onChange={(event) => {
                    const end = new Date(event.target.value);
                    const start = date.start ?? new Date(0);
                    if (!Number.isNaN(end.getTime())) setCustomRange(start, end);
                  }}
                />
              </div>
            ) : (
              <div className="metric hidden items-center gap-1 px-2.5 py-1 text-xs text-[var(--text)] 2xl:flex">{rangeLabel}</div>
            )}
          </div>
          <button
            type="button"
            onClick={() => void refresh()}
            disabled={refreshing}
            className="label-caps flex h-8 items-center gap-1 border border-[var(--border)] bg-[var(--surface-2)] px-2 hover:bg-[var(--surface-3)] disabled:opacity-60"
            title="Refresh Data"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            <span className="hidden xl:inline">Refresh Data</span>
          </button>
          <button
            type="button"
            onClick={exportCsv}
            className="label-caps flex h-8 items-center gap-1 bg-[var(--primary-strong)] px-2 font-semibold text-[var(--on-primary)] hover:bg-[var(--accent)]"
            title="Export CSV"
          >
            <Download size={14} />
            <span className="hidden xl:inline">Export CSV</span>
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-8 w-8 shrink-0 items-center justify-center border border-[var(--border)] text-[var(--text-3)] hover:bg-[var(--surface-2)]"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-[var(--primary-strong)] text-[var(--on-primary)]" title={payload?.account.username || "Account"}>
            <User size={16} />
          </div>
        </div>
      </div>
      <div className="flex items-center overflow-x-auto border-t border-[var(--border)] xl:hidden" aria-label="Date range">
        <div className="flex min-w-max items-center bg-[var(--surface-2)]">{presetButtons}</div>
        {date.preset === "CUSTOM" ? (
          <div className="flex items-center gap-1 px-2 py-1">
            <input type="date" className="metric bg-transparent text-[10px] outline-none" onChange={(event) => {
              const start = new Date(event.target.value);
              const end = date.end ?? new Date();
              if (!Number.isNaN(start.getTime())) setCustomRange(start, end);
            }} />
            <input type="date" className="metric bg-transparent text-[10px] outline-none" onChange={(event) => {
              const end = new Date(event.target.value);
              const start = date.start ?? new Date(0);
              if (!Number.isNaN(end.getTime())) setCustomRange(start, end);
            }} />
          </div>
        ) : null}
      </div>
    </header>
  );
}
