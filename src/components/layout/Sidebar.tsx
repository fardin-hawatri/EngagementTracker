import { useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Grid2x2,
  Lightbulb,
  PlayCircle,
  Settings,
  Tags,
} from "lucide-react";
import { useDataset } from "../../hooks/useDataset";
import { relativeTime } from "@shared/format";

const NAV = [
  { to: "/", label: "Overview", icon: Grid2x2 },
  { to: "/topics", label: "Content Topics", icon: Tags },
  { to: "/reels", label: "All Reels", icon: PlayCircle },
  { to: "/performance", label: "Performance", icon: BarChart3 },
  { to: "/insights", label: "Insights", icon: Lightbulb },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { payload, progress } = useDataset();
  const username = payload?.account.username;
  const connected = Boolean(payload);

  const go = (to: string) => {
    navigate(to);
    onClose();
  };

  return (
    <>
      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 xl:hidden"
          aria-label="Close navigation"
          onClick={onClose}
        />
      ) : null}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col justify-between border-r border-[var(--border)] bg-[var(--surface-1)] transition-transform duration-200 ${open ? "translate-x-0" : "-translate-x-full"} xl:translate-x-0`}
      >
        <div>
          <div className="flex h-14 items-center gap-2 border-b border-[var(--border)] bg-[var(--surface-0)] px-4">
            <img src="/performance.svg" alt="Content Intel" className="h-8 w-8" />
            <div className="flex min-w-0 flex-col">
              <span className="text-base font-semibold uppercase leading-none tracking-tight">Content Intel</span>
              <span className="label-caps mt-0.5 text-[var(--text-2)]">Instagram Reels Intelligence</span>
            </div>
          </div>
          <div className="flex items-center justify-between border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--surface-2)_40%,transparent)] px-4 py-2">
            <span className="label-caps text-[var(--text-3)]">Terminal matrix</span>
            <span className="metric flex items-center gap-1 text-xs text-[var(--positive)]">
              <span className="h-1.5 w-1.5 bg-[var(--positive)]" />
              {connected ? "ONLINE" : "SYNCING"}
            </span>
          </div>
          <nav className="flex flex-col py-1" aria-label="Primary">
            {NAV.map((item) => {
              const active = item.to === "/" ? location.pathname === "/" : location.pathname.startsWith(item.to);
              const Icon = item.icon;
              return (
                <button
                  key={item.to}
                  type="button"
                  onClick={() => go(item.to)}
                  className={`flex items-center gap-2 border-l-2 px-4 py-2 text-left uppercase transition-colors duration-150 ${
                    active
                      ? "border-[var(--primary-strong)] bg-[var(--surface-3)] pl-[14px] font-semibold text-[var(--text)]"
                      : "border-transparent text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
                  }`}
                >
                  <Icon size={16} />
                  <span className="label-caps">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
        <div className="border-t border-[var(--border)] bg-[var(--surface-0)] p-4">
          <div className="flex flex-col gap-1 border border-[var(--border)] bg-[var(--surface-2)] p-2">
            <div className="flex items-center justify-between">
              <span className="metric text-xs font-semibold">@{username || "instagram"}</span>
              <span className="label-caps text-[var(--primary)]">V1 INTEL</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`h-2 w-2 ${connected ? "bg-[var(--positive)]" : "bg-[var(--warning)]"}`} />
              <span className="metric text-xs text-[var(--positive)]">
                {connected ? "Connected" : "Connecting"} · {relativeTime(progress?.lastSyncedAt || payload?.fetchedAt || null)}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
