import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Badge, Card, PageHeader, Spinner, Stat } from "../../components/ui.tsx";
import { api, PUBLIC_ORIGIN } from "../../lib/api.ts";
import { VERTICAL_LABEL } from "../../lib/format.ts";

interface Overview {
  businesses: {
    id: string;
    name: string;
    slug: string;
    vertical: keyof typeof VERTICAL_LABEL;
    rating: number | null;
    reviews: number;
    openReviews: number;
    scans7d: number;
    listingsLive: number;
    listingsTotal: number;
  }[];
  leads: { status: string; kind: string; n: number }[];
  audits: { count: number; averageScore: number | null };
}

export function AgencyOverview() {
  const { data, isLoading } = useQuery({
    queryKey: ["agency-overview"],
    queryFn: () => api<Overview>("/console/agency/overview"),
  });
  if (isLoading || !data) return <Spinner />;
  const newLeads = data.leads.filter((l) => l.status === "new").reduce((a, l) => a + l.n, 0);
  const totalLeads = data.leads.reduce((a, l) => a + l.n, 0);
  return (
    <>
      <PageHeader
        title="Agency overview"
        subtitle="Every client's Business Profile, reputation and discovery status in one place."
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Clients" value={data.businesses.length} />
        <Stat label="New leads" value={newLeads} hint={`${totalLeads} total`} />
        <Stat
          label="Audits run"
          value={data.audits.count}
          hint={
            data.audits.averageScore !== null ? `avg score ${data.audits.averageScore}` : undefined
          }
        />
        <Stat
          label="Reviews awaiting reply"
          value={data.businesses.reduce((a, b) => a + b.openReviews, 0)}
        />
      </div>
      <h2 className="mt-8 mb-3 font-serif text-lg font-semibold text-cobalt-900">Clients</h2>
      <div className="grid gap-3 md:grid-cols-3">
        {data.businesses.map((b) => (
          <Card key={b.id} className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <Link
                  to="/b/$bid"
                  params={{ bid: b.id }}
                  className="font-semibold text-ink hover:text-cobalt-700"
                >
                  {b.name}
                </Link>
                <p className="text-xs text-ink-soft">{VERTICAL_LABEL[b.vertical]}</p>
              </div>
              <Badge tone="warn">Demo</Badge>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div>
                <dt className="text-xs text-ink-soft">Scans (7 days)</dt>
                <dd className="font-semibold tabular-nums">{b.scans7d}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink-soft">Avg rating</dt>
                <dd className="font-semibold tabular-nums">{b.rating?.toFixed(2) ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink-soft">Open reviews</dt>
                <dd className="font-semibold tabular-nums">{b.openReviews}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink-soft">Map listings live</dt>
                <dd className="font-semibold tabular-nums">
                  {b.listingsLive}/{b.listingsTotal}
                </dd>
              </div>
            </dl>
            <div className="mt-3 flex flex-wrap gap-3 text-sm">
              <Link
                to="/b/$bid/listings"
                params={{ bid: b.id }}
                className="font-semibold text-cobalt-700"
              >
                Listings
              </Link>
              <Link
                to="/b/$bid/reviews"
                params={{ bid: b.id }}
                className="font-semibold text-cobalt-700"
              >
                Reviews
              </Link>
              <a
                href={`${PUBLIC_ORIGIN}/m/${b.slug}`}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-terracotta-600"
              >
                Public page ↗
              </a>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
