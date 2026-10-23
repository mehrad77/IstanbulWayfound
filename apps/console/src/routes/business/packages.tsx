import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import type { Localized } from "@wayfound/core";
import { Plus } from "lucide-react";
import { Badge, Button, Card, Empty, Spinner } from "../../components/ui.tsx";
import { api, PUBLIC_ORIGIN } from "../../lib/api.ts";
import { ago, lira } from "../../lib/format.ts";
import { useBusiness } from "../../lib/session.ts";

interface PackageRow {
  id: string;
  slug: string;
  published: boolean;
  name: Localized;
  daysInIstanbul: number;
  priceFromKurus: number;
  updatedAt: string;
}

const blank = (n: number) => ({
  slug: `new-package-${n}`,
  name: { en: "New package", tr: "Yeni paket" },
  summary: { en: "", tr: "" },
  procedureName: { en: "", tr: "" },
  priceFactors: { en: "", tr: "" },
  daysInIstanbul: 3,
  visits: 2,
  priceFromKurus: 0,
  languages: ["en", "tr"],
  inclusions: [
    "consultation",
    "procedure",
    "hotel",
    "transfers",
    "interpreter",
    "aftercareKit",
  ].map((key) => ({ key, included: key !== "hotel" })),
  steps: [],
  faqs: [],
  published: false,
});

export function PackagesPage() {
  const { bid } = useParams({ from: "/app/b/$bid/packages" });
  const biz = useBusiness(bid)!;
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ["packages", bid],
    queryFn: () =>
      api<{ packages: PackageRow[] }>(`/console/businesses/${bid}/packages`).then(
        (r) => r.packages,
      ),
  });
  const create = useMutation({
    mutationFn: () =>
      api<{ id: string }>(`/console/businesses/${bid}/packages`, {
        method: "POST",
        json: blank((data?.length ?? 0) + 1),
      }),
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ["packages", bid] });
      navigate({ to: "/b/$bid/packages/$pid", params: { bid, pid: r.id } });
    },
  });
  if (isLoading) return <Spinner />;
  return (
    <div className="grid max-w-4xl gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-soft">
          Each package is one public page with a day-by-day roadmap, inclusions, FAQ and a WhatsApp
          inquiry.
        </p>
        <Button size="sm" onClick={() => create.mutate()}>
          <Plus className="size-3.5" /> New package
        </Button>
      </div>
      {!data?.length ? (
        <Empty>No packages yet.</Empty>
      ) : (
        data.map((p) => (
          <Card key={p.id} className="flex flex-wrap items-center gap-3 p-4">
            <div className="min-w-0 flex-1">
              <Link
                to="/b/$bid/packages/$pid"
                params={{ bid, pid: p.id }}
                className="font-semibold text-ink hover:text-cobalt-700"
              >
                {p.name.en}
              </Link>
              <p className="text-sm text-ink-soft">
                {p.name.tr} · {p.daysInIstanbul} days · from {lira(p.priceFromKurus)} · edited{" "}
                {ago(p.updatedAt)}
              </p>
            </div>
            {p.published ? <Badge tone="ok">Published</Badge> : <Badge>Draft</Badge>}
            <a
              className="text-sm font-semibold text-terracotta-600"
              href={`${PUBLIC_ORIGIN}/c/${biz.slug}/${p.slug}`}
              target="_blank"
              rel="noreferrer"
            >
              View ↗
            </a>
          </Card>
        ))
      )}
    </div>
  );
}
