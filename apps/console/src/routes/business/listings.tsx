import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouteContext } from "@tanstack/react-router";
import { LISTING_STATUSES } from "@wayfound/core";
import { Badge, Card, Spinner } from "../../components/ui.tsx";
import { api } from "../../lib/api.ts";
import { ago } from "../../lib/format.ts";

interface Listing {
  id: string;
  platform: string;
  status: (typeof LISTING_STATUSES)[number];
  url: string | null;
  notes: string | null;
  updatedAt: string;
}

const PLATFORM = {
  google: { name: "Google Business Profile", why: "Google Maps and AI Overviews" },
  apple: { name: "Apple Business Connect", why: "Apple Maps, Siri, iPhone visitors" },
  bing: { name: "Bing Places", why: "Bing, Copilot and ChatGPT search" },
  yandex: { name: "Yandex Business", why: "Russian-speaking and CIS visitors" },
  amap: { name: "Amap (Gaode)", why: "Visitors from China" },
} as Record<string, { name: string; why: string }>;
const TONE = { missing: "bad", in_progress: "warn", claimed: "info", live: "ok" } as const;

export function ListingsPage() {
  const { bid } = useParams({ from: "/app/b/$bid/listings" });
  const { user } = useRouteContext({ from: "/app" });
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["listings", bid],
    queryFn: () =>
      api<{ listings: Listing[] }>(`/console/businesses/${bid}/listings`).then((r) => r.listings),
  });
  const patch = useMutation({
    mutationFn: ({ id, ...body }: { id: string; status?: string; notes?: string }) =>
      api(`/console/businesses/${bid}/listings/${id}`, { method: "PATCH", json: body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["listings", bid] }),
  });
  if (!data) return <Spinner />;
  const order = Object.keys(PLATFORM);
  return (
    <div className="grid max-w-4xl gap-3">
      <p className="text-sm text-ink-soft">
        Map and directory listings, tracked by hand in the demo.{" "}
        {user.role === "agency"
          ? "Update the status as you work through each one."
          : "Your agency team keeps this up to date."}
      </p>
      {[...data]
        .sort((a, b) => order.indexOf(a.platform) - order.indexOf(b.platform))
        .map((l) => (
          <Card key={l.id} className="flex flex-wrap items-center gap-3 p-4">
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-ink">{PLATFORM[l.platform]?.name ?? l.platform}</p>
              <p className="text-xs text-ink-soft">
                {PLATFORM[l.platform]?.why} · updated {ago(l.updatedAt)}
              </p>
              {l.notes ? <p className="mt-1 text-sm text-ink-soft">{l.notes}</p> : null}
            </div>
            {user.role === "agency" ? (
              <select
                aria-label={`${l.platform} status`}
                className="field w-auto"
                value={l.status}
                onChange={(e) => patch.mutate({ id: l.id, status: e.target.value })}
              >
                {LISTING_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.replace("_", " ")}
                  </option>
                ))}
              </select>
            ) : (
              <Badge tone={TONE[l.status]}>{l.status.replace("_", " ")}</Badge>
            )}
          </Card>
        ))}
    </div>
  );
}
