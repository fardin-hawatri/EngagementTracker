import { useDataset } from "../../hooks/useDataset";

const STEPS = [
  "CONNECTING TO INSTAGRAM",
  "Fetching Reel dataset...",
  "Analyzing content...",
  "Building intelligence...",
];

export function LoadingScreen() {
  const { progress } = useDataset();
  const message = progress?.message || STEPS[0];
  const total = progress?.insightsTotal || 0;
  const done = progress?.insightsDone || 0;
  const percent = total > 0 ? Math.round((done / total) * 100) : progress?.phase === "complete" ? 100 : progress?.phase === "media" ? 25 : 8;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--canvas)] px-6 text-center">
      <img src="/performance.svg" alt="Content Intel" className="h-16 w-16" />
      <h1 className="mt-6 text-3xl font-semibold uppercase tracking-tight">Content Intel</h1>
      <p className="label-caps mt-2 text-[var(--primary)]">{STEPS[0]}</p>
      <p className="metric mt-6 text-sm text-[var(--text-3)]">{message}</p>
      <div className="mt-6 h-2 w-full max-w-md border border-[var(--border)] bg-[var(--surface-0)]">
        <div className="h-full bg-[var(--primary-strong)] transition-all duration-200" style={{ width: `${percent}%` }} />
      </div>
      <div className="mt-3 flex w-full max-w-md justify-between">
        {STEPS.slice(1).map((step) => (
          <span key={step} className="label-caps text-[10px] text-[var(--text-4)]">
            {step.replace("...", "")}
          </span>
        ))}
      </div>
    </div>
  );
}

export function ErrorScreen({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--canvas)] px-6 text-center">
      <img src="/performance.svg" alt="Content Intel" className="h-16 w-16" />
      <h1 className="mt-6 text-3xl font-semibold uppercase tracking-tight">Content Intel</h1>
      <p className="label-caps mt-2 text-[var(--negative-strong)]">Instagram connection failed</p>
      <p className="mt-4 max-w-lg text-sm text-[var(--text-3)]">{message}</p>
      <button type="button" onClick={onRetry} className="label-caps mt-6 bg-[var(--primary-strong)] px-4 py-2 text-[var(--on-primary)]">
        Retry
      </button>
    </div>
  );
}
