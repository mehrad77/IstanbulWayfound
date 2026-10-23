import type { QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  createRoute,
  createRouter,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { Shell } from "./components/shell.tsx";
import { businessesQuery, meQuery } from "./lib/session.ts";
import { AgencyAudits } from "./routes/agency/audits.tsx";
import { LeadsPage } from "./routes/agency/leads.tsx";
import { AgencyOverview } from "./routes/agency/overview.tsx";
import { TemplatesPage } from "./routes/agency/templates.tsx";
import { CatalogPage } from "./routes/business/catalog.tsx";
import { BusinessLayout } from "./routes/business/layout.tsx";
import { ListingsPage } from "./routes/business/listings.tsx";
import { BusinessOverview } from "./routes/business/overview.tsx";
import { PackageEditPage } from "./routes/business/package-edit.tsx";
import { PackagesPage } from "./routes/business/packages.tsx";
import { ProfilePage } from "./routes/business/profile.tsx";
import { QrPage } from "./routes/business/qr.tsx";
import { ReviewsPage } from "./routes/business/reviews.tsx";
import { StatsPage } from "./routes/business/stats.tsx";
import { LoginPage } from "./routes/login.tsx";

const rootRoute = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: () => <Outlet />,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  validateSearch: (s: Record<string, unknown>) => ({
    error: typeof s.error === "string" ? s.error : undefined,
  }),
  component: LoginPage,
});

const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "app",
  beforeLoad: async ({ context }) => {
    const user = await context.queryClient.fetchQuery(meQuery);
    if (!user) throw redirect({ to: "/login", search: { error: undefined } });
    return { user };
  },
  component: Shell,
});

const indexRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/",
  beforeLoad: async ({ context }) => {
    const user = await context.queryClient.fetchQuery(meQuery);
    if (user?.role === "agency") throw redirect({ to: "/agency" });
    const businesses = await context.queryClient.fetchQuery(businessesQuery);
    if (businesses[0]) throw redirect({ to: "/b/$bid", params: { bid: businesses[0].id } });
  },
  component: () => <p className="p-8 text-ink-soft">No businesses on this account yet.</p>,
});

const bizRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/b/$bid",
  component: BusinessLayout,
});
const bizIndex = createRoute({
  getParentRoute: () => bizRoute,
  path: "/",
  component: BusinessOverview,
});
const bizProfile = createRoute({
  getParentRoute: () => bizRoute,
  path: "/profile",
  component: ProfilePage,
});
const bizCatalog = createRoute({
  getParentRoute: () => bizRoute,
  path: "/catalog",
  component: CatalogPage,
});
const bizPackages = createRoute({
  getParentRoute: () => bizRoute,
  path: "/packages",
  component: PackagesPage,
});
const bizPackageEdit = createRoute({
  getParentRoute: () => bizRoute,
  path: "/packages/$pid",
  component: PackageEditPage,
});
const bizQr = createRoute({ getParentRoute: () => bizRoute, path: "/qr", component: QrPage });
const bizReviews = createRoute({
  getParentRoute: () => bizRoute,
  path: "/reviews",
  component: ReviewsPage,
});
const bizStats = createRoute({
  getParentRoute: () => bizRoute,
  path: "/stats",
  component: StatsPage,
});
const bizListings = createRoute({
  getParentRoute: () => bizRoute,
  path: "/listings",
  component: ListingsPage,
});

const leadsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/leads",
  component: LeadsPage,
});
const templatesRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/templates",
  component: TemplatesPage,
});
const agencyRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/agency",
  component: AgencyOverview,
});
const agencyAudits = createRoute({
  getParentRoute: () => appRoute,
  path: "/agency/audits",
  component: AgencyAudits,
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  appRoute.addChildren([
    indexRoute,
    bizRoute.addChildren([
      bizIndex,
      bizProfile,
      bizCatalog,
      bizPackages,
      bizPackageEdit,
      bizQr,
      bizReviews,
      bizStats,
      bizListings,
    ]),
    leadsRoute,
    templatesRoute,
    agencyRoute,
    agencyAudits,
  ]),
]);

export const router = createRouter({
  routeTree,
  context: { queryClient: undefined! },
  defaultPreload: "intent",
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
