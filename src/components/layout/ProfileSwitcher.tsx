import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown, Facebook, Instagram, User } from "lucide-react";
import type { ConnectedPlatform } from "@shared/types";
import { useDataset } from "../../hooks/useDataset";

function PlatformIcon({ platform }: { platform: ConnectedPlatform }) {
  if (platform === "facebook") return <Facebook size={14} />;
  return <Instagram size={14} />;
}

export function ProfileSwitcher() {
  const { profiles, activeProfileId, activeProfile, payload, setActiveProfileId } = useDataset();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const username = payload?.account.username || activeProfile?.usernameHint || activeProfile?.label || "Account";
  const picture = payload?.account.profilePictureUrl;

  if (profiles.length === 0) {
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-[var(--primary-strong)] text-[var(--on-primary)]" title="No profiles">
        <User size={16} />
      </div>
    );
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
        className="flex h-8 max-w-[11rem] items-center gap-1.5 border border-[var(--border)] bg-[var(--surface-2)] pl-1 pr-1.5 hover:bg-[var(--surface-3)]"
        title={`Switch profile · @${username}`}
      >
        {picture ? (
          <img src={picture} alt="" className="h-6 w-6 object-cover" />
        ) : (
          <span className="flex h-6 w-6 items-center justify-center bg-[var(--primary-strong)] text-[var(--on-primary)]">
            <User size={14} />
          </span>
        )}
        <span className="hidden min-w-0 flex-col leading-none sm:flex">
          <span className="metric truncate text-[10px] font-semibold text-[var(--text)]">@{username}</span>
          <span className="label-caps truncate text-[9px] text-[var(--text-3)]">{activeProfile?.platform ?? "instagram"}</span>
        </span>
        <ChevronDown size={14} className={`shrink-0 text-[var(--text-3)] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <div
          id={menuId}
          role="listbox"
          aria-label="Connected profiles"
          className="absolute right-0 top-[calc(100%+4px)] z-50 w-64 border border-[var(--border)] bg-[var(--surface-0)] shadow-[0_12px_32px_rgba(0,0,0,0.35)]"
        >
          <div className="border-b border-[var(--border)] px-3 py-2">
            <div className="label-caps text-[var(--text-3)]">Connected profiles</div>
            <p className="metric mt-0.5 text-[10px] text-[var(--text-3)]">Instagram now · Facebook later</p>
          </div>
          <div className="max-h-72 overflow-auto py-1">
            {profiles.map((profile) => {
              const selected = profile.id === activeProfileId;
              const liveName =
                selected && payload?.account.username
                  ? payload.account.username
                  : profile.usernameHint || profile.label;
              return (
                <button
                  key={profile.id}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  disabled={!profile.configured}
                  onClick={() => {
                    if (profile.id === activeProfileId) {
                      setOpen(false);
                      return;
                    }
                    setActiveProfileId(profile.id);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-[var(--surface-2)] disabled:opacity-50 ${
                    selected ? "bg-[var(--surface-2)]" : ""
                  }`}
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center border border-[var(--border)] text-[var(--text-2)]">
                    <PlatformIcon platform={profile.platform} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="metric block truncate text-xs font-semibold text-[var(--text)]">@{liveName}</span>
                    <span className="label-caps block truncate text-[9px] text-[var(--text-3)]">
                      {profile.platform} · {profile.label}
                    </span>
                  </span>
                  {selected ? <Check size={14} className="shrink-0 text-[var(--primary-strong)]" /> : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
