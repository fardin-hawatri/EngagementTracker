import { createContext, createElement, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { DatePreset } from "@shared/types";

export interface DateRange {
  preset: DatePreset;
  start: Date | null;
  end: Date | null;
}

export interface FilterState {
  search: string;
  date: DateRange;
  category: string;
  topic: string;
  contentType: string;
  performance: string;
}

interface FilterContextValue extends FilterState {
  setSearch: (value: string) => void;
  setDatePreset: (preset: DatePreset) => void;
  setCustomRange: (start: Date, end: Date) => void;
  setCategory: (value: string) => void;
  setTopic: (value: string) => void;
  setContentType: (value: string) => void;
  setPerformance: (value: string) => void;
  resetFilters: () => void;
  rangeLabel: string;
}

const FilterContext = createContext<FilterContextValue | null>(null);

function startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

function rangeFromPreset(preset: DatePreset): DateRange {
  const now = new Date();
  if (preset === "ALL") return { preset, start: null, end: null };
  if (preset === "YTD") return { preset, start: startOfDay(new Date(now.getFullYear(), 0, 1)), end: endOfDay(now) };
  if (preset === "CUSTOM") {
    const start = startOfDay(new Date(now.getTime() - 89 * 86400000));
    return { preset, start, end: endOfDay(now) };
  }
  const days = preset === "7D" ? 7 : preset === "30D" ? 30 : 90;
  const start = startOfDay(new Date(now.getTime() - (days - 1) * 86400000));
  return { preset, start, end: endOfDay(now) };
}

function formatRange(range: DateRange): string {
  if (range.preset === "ALL") return "All time";
  if (!range.start || !range.end) return range.preset;
  const fmt = (date: Date) => date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const labels: Record<DatePreset, string> = {
    "7D": "Last 7 Days",
    "30D": "Last 30 Days",
    "90D": "Last 90 Days",
    YTD: "Year to date",
    ALL: "All time",
    CUSTOM: "Custom",
  };
  return `${labels[range.preset]} (${fmt(range.start)} – ${fmt(range.end)})`;
}

const INITIAL: FilterState = {
  search: "",
  date: rangeFromPreset("ALL"),
  category: "ALL",
  topic: "ALL",
  contentType: "ALL",
  performance: "ALL",
};

export function FilterProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FilterState>(INITIAL);

  const setSearch = useCallback((search: string) => setState((current) => ({ ...current, search })), []);
  const setDatePreset = useCallback((preset: DatePreset) => {
    setState((current) => ({ ...current, date: rangeFromPreset(preset) }));
  }, []);
  const setCustomRange = useCallback((start: Date, end: Date) => {
    setState((current) => ({ ...current, date: { preset: "CUSTOM", start: startOfDay(start), end: endOfDay(end) } }));
  }, []);
  const setCategory = useCallback((category: string) => setState((current) => ({ ...current, category, topic: "ALL" })), []);
  const setTopic = useCallback((topic: string) => setState((current) => ({ ...current, topic })), []);
  const setContentType = useCallback((contentType: string) => setState((current) => ({ ...current, contentType })), []);
  const setPerformance = useCallback((performance: string) => setState((current) => ({ ...current, performance })), []);
  const resetFilters = useCallback(() => setState(INITIAL), []);

  const value = useMemo<FilterContextValue>(
    () => ({
      ...state,
      setSearch,
      setDatePreset,
      setCustomRange,
      setCategory,
      setTopic,
      setContentType,
      setPerformance,
      resetFilters,
      rangeLabel: formatRange(state.date),
    }),
    [state, setSearch, setDatePreset, setCustomRange, setCategory, setTopic, setContentType, setPerformance, resetFilters],
  );

  return createElement(FilterContext.Provider, { value }, children);
}

export function useFilters(): FilterContextValue {
  const value = useContext(FilterContext);
  if (!value) throw new Error("useFilters must be used within FilterProvider");
  return value;
}

export function reelInDateRange(publishedAt: string, range: DateRange): boolean {
  if (!range.start || !range.end) return true;
  const time = new Date(publishedAt).getTime();
  if (Number.isNaN(time)) return false;
  return time >= range.start.getTime() && time <= range.end.getTime();
}
