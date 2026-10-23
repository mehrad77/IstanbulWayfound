import { useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { useState } from "react";
import { Card, Spinner, Stat } from "../../components/ui.tsx";
import { api } from "../../lib/api.ts";

export interface Stats {
  days: number;
  totals: {
    scans: number;
    whatsappClicks: number;
    reviewClicks: number;
    inquiries: number;
    calls: number;
    directions: number;
  };
  languages: { key: string; n: number }[];
  currencies: { key: string; n: number }[];
  daily: { day: string; n: number }[];
  staff: { key: string; n: number }[];
}

const LANG_NAMES: Record<string, string> = {
  en: "English",
  tr: "Turkish",
  ar: "Arabic",
  ru: "Russian",
  de: "German",
};

function Bars({
  rows,
  label,
}: {
  rows: { key: string; n: number }[];
  label: (k: string) => string;
}) {
  const total = rows.reduce((a, r) => a + r.n, 0) || 1;
  const sorted = [...rows].sort((a, b) => b.n - a.n);
  return (
    <ul className="grid gap-2">
      {sorted.map((r) => (
        <li key={r.key} className="grid grid-cols-[90px_1fr_48px] items-center gap-2 text-sm">
          <span className="truncate text-ink">{label(r.key)}</span>
          <span className="h-2.5 rounded-full bg-paper-deep">
            <span
              className="block h-full rounded-full bg-cobalt-500"
              style={{ width: `${(r.n / total) * 100}%` }}
            />
          </span>
          <span className="text-end tabular-nums text-ink-soft">
            {Math.round((r.n / total) * 100)}%
          </span>
        </li>
      ))}
    </ul>
  );
}

export function StatsPage() {
  const { bid } = useParams({ from: "/app/b/$bid/stats" });
  const [days, setDays] = useState(30);
  const { data } = useQuery({
    queryKey: ["stats", bid, days],
    queryFn: () => api<Stats>(`/console/businesses/${bid}/stats?days=${days}`),
  });
  if (!data) return <Spinner />;
  const max = Math.max(1, ...data.daily.map((d) => d.n));
  return (
    <div className="grid gap-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-ink-soft">
          Includes seeded demo traffic so the screens aren't empty after a reset.
        </p>
        <select
          aria-label="Period"
          className="field w-auto"
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="QR scans" value={data.totals.scans} />
        <Stat
          label="WhatsApp clicks"
          value={data.totals.whatsappClicks}
          hint={
            data.totals.scans
              ? `${Math.round((data.totals.whatsappClicks / data.totals.scans) * 100)}% of scans`
              : undefined
          }
        />
        <Stat label="Review taps" value={data.totals.reviewClicks} />
        <Stat label="Inquiries" value={data.totals.inquiries} />
      </div>
      <Card className="p-5">
        <h2 className="font-semibold text-ink">Scans per day</h2>
        <div className="mt-4 flex h-32 items-end gap-1" role="img" aria-label="Scans per day">
          {data.daily.map((d) => (
            <div key={d.day} className="group relative flex-1">
              <div
                className="rounded-t bg-cobalt-500/80 group-hover:bg-cobalt-700"
                style={{ height: `${(d.n / max) * 120}px` }}
              />
              <span className="pointer-events-none absolute -top-6 left-1/2 hidden -translate-x-1/2 rounded bg-ink px-1.5 py-0.5 text-[10px] text-white group-hover:block">
                {d.day.slice(5)}: {d.n}
              </span>
            </div>
          ))}
        </div>
      </Card>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <h2 className="mb-3 font-semibold text-ink">Language mix</h2>
          <Bars rows={data.languages} label={(k) => LANG_NAMES[k] ?? k} />
        </Card>
        <Card className="p-5">
          <h2 className="mb-3 font-semibold text-ink">Currency mix</h2>
          <Bars rows={data.currencies} label={(k) => k} />
        </Card>
        <Card className="p-5">
          <h2 className="mb-3 font-semibold text-ink">Review taps by station</h2>
          {data.staff.length ? (
            <Bars rows={data.staff} label={(k) => (k === "none" ? "No code" : k)} />
          ) : (
            <p className="text-sm text-ink-soft">No taps yet.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
