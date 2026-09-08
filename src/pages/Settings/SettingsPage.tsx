import { TOPICS, CATEGORIES, CONTENT_TYPES } from "@shared/taxonomy";
import { downloadCsv } from "../../lib/downloadCsv";
import { reelsToCsv } from "@shared/csv";
import { formatDateTime, relativeTime } from "@shared/format";
import { useDataset } from "../../hooks/useDataset";
import { useTheme } from "../../hooks/useTheme";
import { Section } from "../../components/common/Section";

export function SettingsPage() {
  const { payload, progress, refresh, refreshing, analytics, overrides } = useDataset();
  const { theme, toggleTheme } = useTheme();
  const overrideCount = Object.values(overrides).filter((item) => item.topic || item.contentType).length;

  return (
    <div>
      <div className="border-b border-[var(--border)] bg-[var(--surface-0)] px-4 py-3">
        <div className="label-caps text-[var(--primary)]">Control plane</div>
        <h1 className="text-2xl font-semibold uppercase">Settings</h1>
      </div>

      <Section title="Instagram account" explanation="Connection uses the server-side Instagram access token. The browser never receives the token.">
        <div className="grid grid-cols-1 gap-px border border-[var(--border)] bg-[var(--border)] md:grid-cols-2 xl:grid-cols-4">
          <Info label="Username" value={payload?.account.username ? `@${payload.account.username}` : "—"} />
          <Info label="Account type" value={payload?.account.accountType || "—"} />
          <Info label="Media count" value={String(payload?.account.mediaCount ?? "—")} />
          <Info label="Reels indexed" value={String(payload?.reelCount ?? 0)} />
          <Info label="Connection" value={payload ? "Connected" : "Offline"} />
          <Info label="Last synced" value={relativeTime(payload?.fetchedAt ?? null)} />
          <Info label="Fetched at" value={formatDateTime(payload?.fetchedAt ?? null)} />
          <Info label="Insights status" value={payload ? `${payload.insightsFetched} ok / ${payload.insightsFailed} unavailable` : progress?.message || "—"} />
        </div>
        <button
          type="button"
          onClick={() => void refresh()}
          disabled={refreshing}
          className="label-caps mt-4 bg-[var(--primary-strong)] px-4 py-2 text-[var(--on-primary)] disabled:opacity-60"
        >
          {refreshing ? "Refreshing…" : "Refresh data"}
        </button>
      </Section>

      <Section title="Appearance" explanation="Dark mode matches the Stitch terminal. Light mode is a separate high-contrast editorial theme.">
        <div className="flex items-center gap-3">
          <span className="label-caps">Theme</span>
          <button type="button" className="label-caps border border-[var(--border)] px-3 py-1" onClick={toggleTheme}>
            {theme === "dark" ? "Switch to light" : "Switch to dark"}
          </button>
        </div>
      </Section>

      <Section title="Taxonomy" explanation="Categories and topics are centralized. Editing the taxonomy later does not require scattering rules through React components.">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div>
            <h3 className="label-caps mb-2">Categories</h3>
            {CATEGORIES.map((category) => (
              <div key={category.id} className="border-b border-[var(--border)] py-1 text-sm">
                {category.label}
              </div>
            ))}
          </div>
          <div>
            <h3 className="label-caps mb-2">Topics</h3>
            <div className="max-h-80 overflow-auto border border-[var(--border)]">
              {TOPICS.map((topic) => (
                <div key={topic.id} className="flex justify-between border-b border-[var(--border)] px-2 py-1 text-sm">
                  <span>{topic.label}</span>
                  <span className="label-caps text-[var(--text-3)]">{topic.category}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4">
          <h3 className="label-caps mb-2">Content types</h3>
          <div className="flex flex-wrap gap-1">
            {CONTENT_TYPES.map((type) => (
              <span key={type} className="border border-[var(--border)] px-2 py-1 text-xs">
                {type}
              </span>
            ))}
          </div>
        </div>
      </Section>

      <Section title="Classification rules" explanation="Keyword rules live in shared/taxonomy.ts and shared/rules.ts. Captions, titles, and hashtags are normalized before matching.">
        <p className="text-sm text-[var(--text-2)]">
          Manual overrides persist in localStorage and survive Instagram refresh. Current overrides: {overrideCount}.
        </p>
      </Section>

      <Section title="Data management" explanation="Export the currently filtered Reel dataset. Credentials are never included.">
        <button
          type="button"
          className="label-caps bg-[var(--primary-strong)] px-4 py-2 text-[var(--on-primary)]"
          onClick={() => downloadCsv(`content-intel-reels-${new Date().toISOString().slice(0, 10)}.csv`, reelsToCsv(analytics.reels))}
        >
          Export CSV
        </button>
        <p className="mt-2 metric text-xs text-[var(--text-3)]">{analytics.reels.length} rows in current filter window.</p>
      </Section>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[var(--surface-2)] p-3">
      <div className="label-caps text-[var(--text-3)]">{label}</div>
      <div className="metric mt-1 text-sm">{value}</div>
    </div>
  );
}
