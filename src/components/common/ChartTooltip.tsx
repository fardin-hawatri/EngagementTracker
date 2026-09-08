import type { TooltipProps } from "recharts";

export function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="border border-[var(--border-strong)] bg-[var(--surface-3)] px-3 py-2 shadow-[0_4px_0_0_rgba(0,0,0,0.6)]">
      {label ? <div className="label-caps mb-1 text-[var(--text-3)]">{String(label)}</div> : null}
      {payload.map((entry) => (
        <div key={String(entry.dataKey)} className="metric flex items-center justify-between gap-6 text-xs">
          <span className="text-[var(--text-3)]">{entry.name}</span>
          <span className="font-semibold text-[var(--text)]">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export function tooltipSurface(body: Array<{ label: string; value: string }>, title?: string) {
  return (
    <div className="border border-[var(--border-strong)] bg-[var(--surface-3)] px-3 py-2 shadow-[0_4px_0_0_rgba(0,0,0,0.6)]">
      {title ? <div className="label-caps mb-1 text-[var(--primary)]">{title}</div> : null}
      {body.map((row) => (
        <div key={row.label} className="metric flex items-center justify-between gap-6 text-xs">
          <span className="text-[var(--text-3)]">{row.label}</span>
          <span className="font-semibold text-[var(--text)]">{row.value}</span>
        </div>
      ))}
    </div>
  );
}
