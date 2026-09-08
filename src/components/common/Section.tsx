import type { ReactNode, CSSProperties } from "react";

export function Section({
  kicker,
  title,
  explanation,
  action,
  children,
}: {
  kicker?: string;
  title: string;
  explanation?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="border-b border-[var(--border)] bg-[var(--surface-1)]">
      <div className="flex flex-col gap-1 border-b border-[var(--border)] bg-[var(--surface-0)] px-4 py-3 md:flex-row md:items-end md:justify-between">
        <div>
          {kicker ? <div className="label-caps mb-1 text-[var(--text-3)]">{kicker}</div> : null}
          <h2 className="text-base font-semibold uppercase tracking-tight text-[var(--text)]">{title}</h2>
          {explanation ? <p className="mt-1 max-w-3xl text-sm text-[var(--text-3)]">{explanation}</p> : null}
        </div>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

export function KpiStrip({
  items,
}: {
  items: Array<{ label: string; value: string; hint?: string; accent?: boolean; positive?: boolean; negative?: boolean }>;
}) {
  const cols =
    items.length <= 4
      ? "grid-cols-2 sm:grid-cols-4"
      : items.length === 5
        ? "grid-cols-2 sm:grid-cols-3 xl:grid-cols-5"
        : "grid-cols-2 sm:grid-cols-3 xl:grid-cols-6";
  return (
    <div className={`grid w-full min-w-0 gap-px border border-[var(--border)] bg-[var(--border)] ${cols}`}>
      {items.map((item) => (
        <div
          key={item.label}
          className="flex min-w-0 flex-col px-2 py-1.5 sm:px-3"
          style={{ background: item.accent ? "var(--surface-3)" : "var(--surface-2)" }}
          title={item.hint ? `${item.label}: ${item.value} ${item.hint}` : `${item.label}: ${item.value}`}
        >
          <span className="label-caps truncate text-[10px] text-[var(--text-3)]">{item.label}</span>
          <span
            className="metric truncate text-xs font-semibold sm:text-sm"
            style={
              {
                color: item.positive ? "var(--positive)" : item.negative ? "var(--negative-strong)" : item.accent ? "var(--primary-strong)" : "var(--text)",
              } as CSSProperties
            }
          >
            {item.value}
          </span>
          {item.hint ? <span className="metric truncate text-[10px] text-[var(--text-3)]">{item.hint}</span> : null}
        </div>
      ))}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "BREAKOUT"
      ? "text-[var(--primary-strong)] border-[var(--primary-strong)] bg-[color-mix(in_srgb,var(--primary-strong)_16%,transparent)]"
      : status === "ABOVE"
        ? "text-[var(--positive)] border-[color-mix(in_srgb,var(--positive)_40%,transparent)]"
        : status === "UNDER" || status === "BELOW"
          ? "text-[var(--negative-strong)] border-[color-mix(in_srgb,var(--negative-strong)_40%,transparent)]"
          : "text-[var(--text-3)] border-[var(--border)]";
  return <span className={`label-caps border px-1.5 py-0.5 ${tone}`}>{status}</span>;
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="border border-[var(--border)] bg-[var(--surface-0)] p-6">
      <div className="label-caps text-[var(--text-3)]">No records</div>
      <h3 className="mt-1 text-lg font-semibold uppercase">{title}</h3>
      <p className="mt-2 max-w-xl text-sm text-[var(--text-3)]">{body}</p>
    </div>
  );
}

export function MetricCell({ value, align = "right" }: { value: string; align?: "left" | "right" | "center" }) {
  return (
    <span className={`metric block text-xs ${align === "right" ? "text-right" : align === "center" ? "text-center" : ""}`}>
      {value}
    </span>
  );
}
