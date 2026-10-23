import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";
import { Card, Stat } from "../../components/ui.tsx";
import { api, PUBLIC_ORIGIN } from "../../lib/api.ts";
import { ago, CATALOG_LABEL } from "../../lib/format.ts";
import { useBusiness } from "../../lib/session.ts";
import type { Review } from "../../lib/types.ts";
import type { Stats } from "./stats.tsx";

export function BusinessOverview() {
  const { bid } = useParams({ from: "/app/b/$bid/" });
  const biz = useBusiness(bid)!;
  const stats = useQuery({
    queryKey: ["stats", bid, 30],
    queryFn: () => api<Stats>(`/console/businesses/${bid}/stats?days=30`),
  });
  const reviews = useQuery({
    queryKey: ["reviews", bid],
    queryFn: () =>
      api<{ reviews: Review[]; metrics: { average: number | null; replyRate: number } }>(
        `/console/businesses/${bid}/reviews`,
      ),
  });
  const open = reviews.data?.reviews.filter((r) => r.status !== "replied") ?? [];
  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Scans · 30 days" value={stats.data?.totals.scans ?? "…"} />
        <Stat label="WhatsApp clicks" value={stats.data?.totals.whatsappClicks ?? "…"} />
        <Stat label="Avg review rating" value={reviews.data?.metrics.average?.toFixed(2) ?? "…"} />
        <Stat label="Reviews to answer" value={reviews.data ? open.length : "…"} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="font-semibold text-ink">One profile, published everywhere</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Change a price or a dish here and it shows on the QR page, in the schema AI crawlers
            read and in the audit at the same moment.
          </p>
          <ul className="mt-3 grid gap-2 text-sm">
            <li>
              <Link className="font-semibold text-cobalt-700" to="/b/$bid/catalog" params={{ bid }}>
                Edit {CATALOG_LABEL[biz.vertical].toLowerCase()} →
              </Link>
            </li>
            {biz.vertical === "clinic" ? (
              <li>
                <Link
                  className="font-semibold text-cobalt-700"
                  to="/b/$bid/packages"
                  params={{ bid }}
                >
                  Edit treatment packages →
                </Link>
              </li>
            ) : null}
            <li>
              <Link className="font-semibold text-cobalt-700" to="/b/$bid/qr" params={{ bid }}>
                Download QR codes and print kit →
              </Link>
            </li>
            <li>
              <a
                className="font-semibold text-terracotta-600"
                href={`${PUBLIC_ORIGIN}/m/${biz.slug}`}
                target="_blank"
                rel="noreferrer"
              >
                Open the tourist view ↗
              </a>
            </li>
          </ul>
        </Card>
        <Card className="p-5">
          <h2 className="font-semibold text-ink">Latest reviews</h2>
          <ul className="mt-3 divide-y divide-line">
            {(reviews.data?.reviews ?? []).slice(0, 4).map((r) => (
              <li key={r.id} className="py-2 text-sm">
                <span className="font-semibold">{"★".repeat(r.rating)}</span>
                <span className="text-ink-soft">{"★".repeat(5 - r.rating)}</span>{" "}
                <span className="text-ink">{r.author}</span>
                <span className="text-xs text-ink-soft">
                  {" "}
                  · {r.platform} · {ago(r.postedAt)}
                </span>
                <p className="line-clamp-1 text-ink-soft">{r.text}</p>
              </li>
            ))}
          </ul>
          <Link
            className="mt-2 inline-block text-sm font-semibold text-cobalt-700"
            to="/b/$bid/reviews"
            params={{ bid }}
          >
            Open the Reputation Desk →
          </Link>
        </Card>
      </div>
    </div>
  );
}
