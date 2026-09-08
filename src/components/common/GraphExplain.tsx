import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

export type TipRow = { label: string; value: string };

type TipBody = {
  title: string;
  body?: string;
  rows?: TipRow[];
};

function TipCard({
  id,
  title,
  body,
  rows,
  top,
  left,
  placeAbove,
}: TipBody & { id?: string; top: number; left: number; placeAbove: boolean }) {
  return (
    <div
      id={id}
      role="tooltip"
      className="pointer-events-none fixed z-[80] w-[min(20rem,calc(100vw-16px))] border border-[var(--border-strong)] bg-[var(--surface-3)] px-3 py-2 shadow-[0_4px_0_0_rgba(0,0,0,0.6)]"
      style={{
        top,
        left,
        transform: placeAbove ? "translateY(-100%)" : undefined,
      }}
    >
      <div className="label-caps mb-1 text-[var(--primary)]">{title}</div>
      {body ? <p className="mb-2 text-xs leading-relaxed text-[var(--text-2)]">{body}</p> : null}
      {rows?.map((row) => (
        <div key={row.label} className="metric flex items-center justify-between gap-4 text-xs">
          <span className="shrink-0 text-[var(--text-3)]">{row.label}</span>
          <span className="min-w-0 text-right font-semibold text-[var(--text)]">{row.value}</span>
        </div>
      ))}
    </div>
  );
}

function clampLeft(left: number, width = 320) {
  return Math.max(8, Math.min(left, window.innerWidth - width - 8));
}

/** Hover (desktop) or tap (touch) explanation for a chart or data point. */
export function HoverTip({
  title,
  body,
  rows,
  children,
  className,
}: TipBody & { children: ReactNode; className?: string }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, placeAbove: true });
  const anchorRef = useRef<HTMLDivElement>(null);
  const id = useId();

  const update = () => {
    const el = anchorRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const placeAbove = rect.top > 170;
    setCoords({
      top: placeAbove ? rect.top - 8 : rect.bottom + 8,
      left: clampLeft(rect.left + rect.width / 2 - 140),
      placeAbove,
    });
  };

  const show = () => {
    update();
    setOpen(true);
  };

  const hide = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    const close = () => hide();
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  return (
    <>
      <div
        ref={anchorRef}
        className={className ?? "relative min-w-0"}
        onPointerEnter={show}
        onPointerLeave={hide}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        onClick={() => {
          if (!window.matchMedia("(hover: none)").matches) return;
          update();
          setOpen((was) => !was);
        }}
        aria-describedby={open ? id : undefined}
      >
        {children}
      </div>
      {open
        ? createPortal(
            <TipCard id={id} title={title} body={body} rows={rows} {...coords} />,
            document.body,
          )
        : null}
    </>
  );
}

/** Cursor-following tooltip for line charts and similar. */
export function CursorTip({
  x,
  y,
  title,
  body,
  rows,
}: TipBody & { x: number; y: number }) {
  const left = clampLeft(x + 14);
  const placeAbove = y > 170;
  return createPortal(
    <TipCard title={title} body={body} rows={rows} top={placeAbove ? y - 12 : y + 14} left={left} placeAbove={placeAbove} />,
    document.body,
  );
}
