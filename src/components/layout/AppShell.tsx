import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useDataset } from "../../hooks/useDataset";
import { ReelInspection } from "../reels/ReelInspection";
import { CommandBar } from "./CommandBar";
import { ErrorScreen, LoadingScreen } from "./LoadingScreen";
import { Sidebar } from "./Sidebar";

const TITLES: Record<string, string> = {
  "/": "Reels Intelligence Engine",
  "/topics": "Content Topics",
  "/reels": "All Reels",
  "/performance": "Performance",
  "/insights": "Insights",
  "/settings": "Settings",
};

export function AppShell() {
  const { state, error, selectedReelId, setSelectedReelId } = useDataset();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const showOverlayInspector = Boolean(selectedReelId) && !location.pathname.startsWith("/reels");
  const title =
    TITLES[location.pathname] ||
    (location.pathname.startsWith("/topics/") ? "Topic Detail" : "Reels Intelligence Engine");

  if (state === "loading") return <LoadingScreen />;
  if (state === "error") {
    return <ErrorScreen message={error || "Unknown error"} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="min-h-screen bg-[var(--canvas)]">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="min-w-0 xl:pl-72">
        <CommandBar title={title} onMenu={() => setOpen(true)} />
        <main className="app-scroll min-h-screen overflow-x-hidden pt-[5.75rem] xl:pt-14">
          {state === "partial" ? (
            <div className="border-b border-[var(--border)] bg-[var(--surface-0)] px-4 py-2 text-xs text-[var(--warning)]">
              Partial success: some Reel insights were unavailable. Available metrics are shown; missing values remain Unavailable.
            </div>
          ) : null}
          <Outlet />
        </main>
      </div>
      {showOverlayInspector ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/40"
            aria-label="Close reel inspection"
            onClick={() => setSelectedReelId(null)}
          />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md">
            <ReelInspection onClose={() => setSelectedReelId(null)} embedded />
          </div>
        </>
      ) : null}
    </div>
  );
}
