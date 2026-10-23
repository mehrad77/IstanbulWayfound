import {
  BRAND,
  type Currency,
  mapsUrl,
  type ProfileBundle,
  publicReviewButtons,
  telUrl,
  whatsappUrl,
} from "@wayfound/core";
import { isLocale, type Locale, t } from "@wayfound/i18n";
import {
  breadcrumbs,
  faqPage,
  graph,
  localBusiness,
  medicalProcedure,
  menu,
  offerCatalog,
} from "@wayfound/schema";
import { type Context, Hono } from "hono";
import type { AppEnv, Env } from "./env.ts";
import { Layout } from "./layout.tsx";
import { api, loadBusiness, track } from "./lib/api.ts";
import { resolveCurrency, resolveLocale, withQuery } from "./lib/request.ts";
import { waText } from "./lib/whatsapp.ts";
import { ClinicIndexPage, PackagePage } from "./pages/clinic.tsx";
import { MenuPage, parseFilters } from "./pages/menu.tsx";
import { DemoRedirectPage, ReviewPage } from "./pages/review.tsx";

const app = new Hono<AppEnv>();

// Every public page reads live from the Business Profile; never let an edge cache serve a stale price.
app.use("*", async (c, next) => {
  await next();
  if (c.res.headers.get("content-type")?.includes("text/html")) {
    c.res.headers.set("cache-control", "no-store");
  }
});

const abs = (env: Env, path: string) => `${env.PUBLIC_ORIGIN}${path}`;

function langLinks(c: Context<AppEnv>, path: string) {
  return {
    hrefLang: (l: Locale) => withQuery(c, { lang: l }),
    hrefCurrency: (cur: Currency) => withQuery(c, { cur }),
    alternates: { en: abs(c.env, `${path}?lang=en`), tr: abs(c.env, `${path}?lang=tr`) },
  };
}

function whatsappNumber(env: Env, bundle: ProfileBundle) {
  return bundle.business.isDemo && env.DEMO_WHATSAPP_OVERRIDE
    ? env.DEMO_WHATSAPP_OVERRIDE
    : bundle.business.whatsapp;
}

app.get("/", (c) => {
  const locale = resolveLocale(c);
  const demos = [
    { href: "/m/cafe-lale", name: "Café Lale", what: "QR menu" },
    { href: "/m/selvi-showroom", name: "Selvi Textile Showroom", what: "Catalog" },
    { href: "/m/defne-dental", name: "Defne Dental Clinic", what: "Price list" },
    {
      href: "/c/defne-dental/implants-6-day",
      name: "Defne Dental Clinic",
      what: "Implant package",
    },
    { href: "/r/cafe-lale", name: "Café Lale", what: "Review funnel" },
  ];
  return c.html(
    <Layout
      locale={locale}
      title={`${BRAND.name} visitor pages`}
      description="Demo visitor pages"
      canonical={abs(c.env, "/")}
      noindex
    >
      <main class="mx-auto max-w-md px-4 py-12">
        <h1 class="font-serif text-3xl font-semibold text-cobalt-900">
          {BRAND.name} visitor pages
        </h1>
        <p class="mt-2 text-ink-soft">
          Demo businesses. Each page opens from a QR code or NFC tap.
        </p>
        <ul class="mt-6 grid gap-2">
          {demos.map((d) => (
            <li>
              <a class="card flex justify-between p-4" href={d.href}>
                <span class="font-semibold">{d.name}</span>
                <span class="text-ink-soft">{d.what}</span>
              </a>
            </li>
          ))}
        </ul>
      </main>
    </Layout>,
  );
});

app.get("/health", (c) => c.json({ ok: true, service: "wayfound-public" }));

// --- QR Menu / Catalog -------------------------------------------------------------------
app.get("/m/:slug", async (c) => {
  const locale = resolveLocale(c);
  const currency = resolveCurrency(c);
  const slug = c.req.param("slug");
  const data = await loadBusiness(c.env, slug, locale);
  if (!data?.bundle) return c.notFound();
  const { bundle, fx } = data;
  const path = `/m/${slug}`;
  const links = langLinks(c, path);
  const urls = { base: c.env.PUBLIC_ORIGIN, page: abs(c.env, path) };
  const vertical = bundle.business.vertical;

  track(c.env, c.executionCtx, {
    businessSlug: slug,
    type: c.req.query("src") === "qr" ? "scan" : "view",
    lang: locale,
    currency,
    path,
  });

  const jsonLd = graph(
    localBusiness(bundle, urls),
    vertical === "dining" ? menu(bundle, urls) : offerCatalog(bundle, urls),
    faqPage(bundle.faqs, urls.page),
    breadcrumbs([
      { name: BRAND.name, url: c.env.SITE_ORIGIN },
      { name: bundle.business.name, url: urls.page },
    ]),
  );
  const what =
    vertical === "dining"
      ? t(locale, "menu.title")
      : vertical === "retail"
        ? t(locale, "menu.catalog")
        : t(locale, "menu.priceList");
  return c.html(
    <Layout
      locale={locale}
      title={`${bundle.business.name} · ${what}`}
      description={bundle.business.description}
      canonical={links.alternates[locale]}
      alternates={links.alternates}
      jsonLd={jsonLd}
    >
      <MenuPage
        bundle={bundle}
        fx={fx}
        locale={locale}
        currency={currency}
        filters={parseFilters(new URL(c.req.url))}
        hrefLang={links.hrefLang}
        hrefCurrency={links.hrefCurrency}
        waNumber={whatsappNumber(c.env, bundle)}
      />
    </Layout>,
  );
});

// --- Clinic Package Portal -----------------------------------------------------------------
app.get("/c/:slug", async (c) => {
  const locale = resolveLocale(c);
  const currency = resolveCurrency(c);
  const slug = c.req.param("slug");
  const data = await loadBusiness(c.env, slug, locale);
  if (data?.bundle?.business.vertical !== "clinic") return c.notFound();
  const path = `/c/${slug}`;
  const links = langLinks(c, path);
  const urls = { base: c.env.PUBLIC_ORIGIN, page: abs(c.env, path) };
  track(c.env, c.executionCtx, { businessSlug: slug, type: "view", lang: locale, currency, path });
  return c.html(
    <Layout
      locale={locale}
      title={`${data.bundle.business.name} · ${t(locale, "clinic.packages")}`}
      description={data.bundle.business.description}
      canonical={links.alternates[locale]}
      alternates={links.alternates}
      jsonLd={graph(localBusiness(data.bundle, urls), faqPage(data.bundle.faqs, urls.page))}
    >
      <ClinicIndexPage
        bundle={data.bundle}
        fx={data.fx}
        locale={locale}
        currency={currency}
        hrefLang={links.hrefLang}
        hrefCurrency={links.hrefCurrency}
        waNumber={whatsappNumber(c.env, data.bundle)}
      />
    </Layout>,
  );
});

async function renderPackage(c: Context<AppEnv>, error?: string, status: 200 | 400 = 200) {
  const locale = resolveLocale(c);
  const currency = resolveCurrency(c);
  const slug = c.req.param("slug")!;
  const pkgSlug = c.req.param("pkg")!;
  const preview = c.req.query("preview");
  const data = await loadBusiness(c.env, slug, locale, preview);
  const pkg = data?.bundle.packages.find((p) => p.slug === pkgSlug);
  if (!data?.bundle || !pkg) return c.notFound();
  const path = `/c/${slug}/${pkgSlug}`;
  const links = langLinks(c, path);
  const urls = { base: c.env.PUBLIC_ORIGIN, page: abs(c.env, path) };
  if (!error && !preview)
    track(c.env, c.executionCtx, {
      businessSlug: slug,
      type: "view",
      lang: locale,
      currency,
      path,
    });
  return c.html(
    <Layout
      locale={locale}
      noindex={Boolean(preview) || !pkg.published}
      title={`${pkg.name} · ${data.bundle.business.name}`}
      description={pkg.summary}
      canonical={links.alternates[locale]}
      alternates={links.alternates}
      jsonLd={graph(
        localBusiness(data.bundle, urls),
        medicalProcedure(data.bundle, pkg, urls.page, c.env.PUBLIC_ORIGIN),
        faqPage(pkg.faqs, urls.page),
        breadcrumbs([
          { name: data.bundle.business.name, url: abs(c.env, `/c/${slug}`) },
          { name: pkg.name, url: urls.page },
        ]),
      )}
    >
      <PackagePage
        bundle={data.bundle}
        pkg={pkg}
        fx={data.fx}
        locale={locale}
        currency={currency}
        hrefLang={links.hrefLang}
        hrefCurrency={links.hrefCurrency}
        waNumber={whatsappNumber(c.env, data.bundle)}
        error={error}
      />
    </Layout>,
    status,
  );
}

app.get("/c/:slug/:pkg", (c) => renderPackage(c));

// Works without JavaScript: save the lead, then hand over to WhatsApp with the summary written.
app.post("/c/:slug/:pkg/inquiry", async (c) => {
  const form = await c.req.parseBody();
  const lang = isLocale(form.lang) ? form.lang : resolveLocale(c);
  const body = {
    name: String(form.name ?? ""),
    country: String(form.country ?? ""),
    dates: String(form.dates ?? ""),
    treatment: String(form.treatment ?? ""),
    lang,
  };
  const { status, data } = await api<{ whatsappUrl: string; error?: unknown }>(
    c.env,
    `/public/businesses/${c.req.param("slug")}/packages/${c.req.param("pkg")}/inquiries`,
    { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) },
  );
  if (status !== 200) {
    return renderPackage(
      c,
      lang === "tr" ? "Lütfen tüm alanları doldurun." : "Please fill in every field.",
      400,
    );
  }
  let target = data.whatsappUrl;
  if (c.env.DEMO_WHATSAPP_OVERRIDE) {
    const text = new URL(target).searchParams.get("text") ?? "";
    target = whatsappUrl(c.env.DEMO_WHATSAPP_OVERRIDE, text);
  }
  return c.redirect(target, 303);
});

// --- Review Funnel ---------------------------------------------------------------------------
async function renderReview(c: Context<AppEnv>, sent: boolean) {
  const locale = resolveLocale(c);
  const slug = c.req.param("slug")!;
  const data = await loadBusiness(c.env, slug, locale);
  if (!data?.bundle) return c.notFound();
  const path = `/r/${slug}`;
  const links = langLinks(c, path);
  return c.html(
    <Layout
      locale={locale}
      title={t(locale, "review.title", { name: data.bundle.business.name })}
      description={t(locale, "review.lead")}
      canonical={abs(c.env, path)}
      noindex
    >
      <ReviewPage
        bundle={data.bundle}
        locale={locale}
        staff={c.req.query("staff") ?? ""}
        sent={sent}
        hrefLang={links.hrefLang}
      />
    </Layout>,
  );
}

app.get("/r/:slug", (c) => renderReview(c, c.req.query("sent") === "1"));

app.post("/r/:slug/feedback", async (c) => {
  const form = await c.req.parseBody();
  const lang = isLocale(form.lang) ? form.lang : resolveLocale(c);
  await api(c.env, `/public/businesses/${c.req.param("slug")}/feedback`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      message: String(form.message ?? ""),
      contact: String(form.contact ?? ""),
      staff: String(form.staff ?? ""),
      lang,
    }),
  });
  return c.redirect(`/r/${c.req.param("slug")}?sent=1&lang=${lang}`, 303);
});

app.get("/r/:slug/go/:platform", async (c) => {
  const locale = resolveLocale(c);
  const slug = c.req.param("slug");
  const data = await loadBusiness(c.env, slug, locale);
  if (!data?.bundle) return c.notFound();
  const button = publicReviewButtons(
    data.bundle.business.vertical,
    data.bundle.business.reviewLinks,
  ).find((b) => b.platform === c.req.param("platform"));
  if (!button) return c.notFound();
  const staff = c.req.query("staff") ?? "";
  track(c.env, c.executionCtx, {
    businessSlug: slug,
    type: "review_click",
    lang: locale,
    staff,
    path: `/r/${slug}/${button.platform}`,
  });
  if (data.bundle.business.isDemo) {
    return c.html(
      <Layout
        locale={locale}
        title={`${button.label} · demo`}
        description=""
        canonical={abs(c.env, `/r/${slug}`)}
        noindex
      >
        <DemoRedirectPage
          locale={locale}
          businessName={data.bundle.business.name}
          platform={button.label}
          target={button.url}
          back={`/r/${slug}${staff ? `?staff=${encodeURIComponent(staff)}` : ""}`}
        />
      </Layout>,
    );
  }
  return c.redirect(button.url, 302);
});

// --- Tracked outbound actions ------------------------------------------------------------------
app.get("/go/wa/:slug", async (c) => {
  const lang = isLocale(c.req.query("lang")) ? (c.req.query("lang") as Locale) : resolveLocale(c);
  const slug = c.req.param("slug");
  const data = await loadBusiness(c.env, slug, lang);
  if (!data?.bundle) return c.notFound();
  const kind =
    (["table", "general", "quote", "treatment"] as const).find((k) => k === c.req.query("m")) ??
    "general";
  const text = waText(data.bundle, kind, lang, c.req.query("item"));
  track(c.env, c.executionCtx, {
    businessSlug: slug,
    type: "whatsapp_click",
    lang,
    currency: resolveCurrency(c),
    path: `/go/wa/${slug}`,
  });
  return c.redirect(whatsappUrl(whatsappNumber(c.env, data.bundle), text), 302);
});

// <a ping> beacon: records a click on a direct link without a redirect hop.
app.post("/go/ping/:slug", (c) => {
  const type = c.req.query("type") === "whatsapp_click" ? "whatsapp_click" : "view";
  track(c.env, c.executionCtx, {
    businessSlug: c.req.param("slug"),
    type,
    lang: c.req.query("lang"),
    currency: resolveCurrency(c),
  });
  return c.body(null, 204);
});

app.get("/go/call/:slug", async (c) => {
  const slug = c.req.param("slug");
  const data = await loadBusiness(c.env, slug, "en");
  if (!data?.bundle) return c.notFound();
  track(c.env, c.executionCtx, { businessSlug: slug, type: "call_click" });
  return c.redirect(telUrl(data.bundle.business.phone), 302);
});

app.get("/go/map/:slug", async (c) => {
  const slug = c.req.param("slug");
  const data = await loadBusiness(c.env, slug, "en");
  if (!data?.bundle) return c.notFound();
  track(c.env, c.executionCtx, { businessSlug: slug, type: "directions_click" });
  return c.redirect(mapsUrl(data.bundle.location, data.bundle.business.name), 302);
});

// Photos live in R2 behind the API; serve them on this origin.
app.get("/media/*", async (c) => {
  const key = c.req.path.replace(/^\/media\//, "");
  return c.env.API.fetch(new Request(`https://api.internal/api/media/${key}`));
});

app.get("/robots.txt", (c) =>
  c.text(`User-agent: *\nAllow: /m/\nAllow: /c/\nDisallow: /r/\nDisallow: /go/\n`),
);

app.notFound((c) =>
  c.html(
    <Layout locale="en" title="Not found" description="" canonical={abs(c.env, "/")} noindex>
      <main class="mx-auto max-w-md px-4 py-16 text-center">
        <h1 class="font-serif text-2xl font-semibold text-cobalt-900">Page not found</h1>
        <a class="mt-4 inline-block text-cobalt-700" href="/">
          {BRAND.name}
        </a>
      </main>
    </Layout>,
    404,
  ),
);

export default app;
