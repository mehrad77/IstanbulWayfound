import { Link, Outlet, useParams } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { Badge } from "../../components/ui.tsx";
import { PUBLIC_ORIGIN } from "../../lib/api.ts";
import { CATALOG_LABEL, VERTICAL_LABEL } from "../../lib/format.ts";
import { useBusiness } from "../../lib/session.ts";

export function BusinessLayout() {
  const { bid } = useParams({ from: "/app/b/$bid" });
  const biz = useBusiness(bid);
  if (!biz) return null;
  const tabs = [
    { to: "/b/$bid", label: "Overview", exact: true },
    { to: "/b/$bid/catalog", label: CATALOG_LABEL[biz.vertical] },
    ...(biz.vertical === "clinic" ? [{ to: "/b/$bid/packages", label: "Packages" }] : []),
    { to: "/b/$bid/profile", label: "Profile & FAQ" },
    { to: "/b/$bid/qr", label: "QR & print" },
    { to: "/b/$bid/reviews", label: "Reviews" },
    { to: "/b/$bid/stats", label: "Stats" },
    { to: "/b/$bid/listings", label: "Listings" },
  ];
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1">
        <h1 className="font-serif text-2xl font-semibold text-cobalt-900">{biz.name}</h1>
        <Badge>{VERTICAL_LABEL[biz.vertical]}</Badge>
        {biz.isDemo ? <Badge tone="warn">Invented demo business</Badge> : null}
        <a
          className="ms-auto inline-flex items-center gap-1 text-sm font-semibold text-terracotta-600"
          href={`${PUBLIC_ORIGIN}/${biz.vertical === "clinic" ? "c" : "m"}/${biz.slug}`}
          target="_blank"
          rel="noreferrer"
        >
          View public page <ExternalLink className="size-3.5" />
        </a>
      </div>
      <nav className="-mx-4 mb-6 flex gap-1 overflow-x-auto border-b border-line px-4 sm:mx-0 sm:px-0">
        {tabs.map((t) => (
          <Link
            key={t.to}
            to={t.to}
            params={{ bid }}
            activeOptions={{ exact: Boolean(t.exact) }}
            className="-mb-px border-b-2 border-transparent px-3 py-2 text-sm font-medium whitespace-nowrap text-ink-soft hover:text-ink"
            activeProps={{ className: "!border-cobalt-700 !text-cobalt-800" }}
          >
            {t.label}
          </Link>
        ))}
      </nav>
      <Outlet />
    </div>
  );
}
