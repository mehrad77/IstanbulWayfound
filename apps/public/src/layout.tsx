import { BRAND } from "@wayfound/core";
import { dirFor, type Locale, SUPPORTED_LOCALES, t } from "@wayfound/i18n";
import { toScriptJson } from "@wayfound/schema";
import { raw } from "hono/html";
import type { Child } from "hono/jsx";

export interface LayoutProps {
  locale: Locale;
  title: string;
  description: string;
  canonical: string;
  /** Same page in each language, for hreflang. */
  alternates?: Partial<Record<Locale, string>>;
  jsonLd?: unknown;
  noindex?: boolean;
  children: Child;
}

export function Layout(p: LayoutProps) {
  return (
    <>
      {raw("<!doctype html>")}
      <html lang={p.locale} dir={dirFor(p.locale)}>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
          <title>{p.title}</title>
          <meta name="description" content={p.description} />
          <meta name="theme-color" content="#1f3f8f" />
          {p.noindex ? <meta name="robots" content="noindex" /> : null}
          <link rel="canonical" href={p.canonical} />
          {p.alternates
            ? SUPPORTED_LOCALES.map((l) =>
                p.alternates?.[l] ? (
                  <link rel="alternate" hreflang={l} href={p.alternates[l]} />
                ) : null,
              )
            : null}
          {p.alternates?.en ? (
            <link rel="alternate" hreflang="x-default" href={p.alternates.en} />
          ) : null}
          <meta property="og:title" content={p.title} />
          <meta property="og:description" content={p.description} />
          <meta property="og:locale" content={p.locale === "tr" ? "tr_TR" : "en_GB"} />
          <link rel="stylesheet" href="/app.css" />
          {p.jsonLd ? (
            <script type="application/ld+json">{raw(toScriptJson(p.jsonLd))}</script>
          ) : null}
        </head>
        <body class="min-h-dvh bg-paper text-ink antialiased">
          {p.children}
          <script src="/app.js" defer />
        </body>
      </html>
    </>
  );
}

export function LangSwitch(p: { locale: Locale; hrefFor: (l: Locale) => string }) {
  return (
    <nav
      aria-label={t(p.locale, "common.language")}
      class="flex rounded-full border border-line bg-white p-0.5 text-sm"
    >
      {SUPPORTED_LOCALES.map((l) => (
        <a
          href={p.hrefFor(l)}
          hreflang={l}
          lang={l}
          aria-current={l === p.locale ? "true" : undefined}
          class={`rounded-full px-3 py-1 font-medium ${l === p.locale ? "bg-cobalt-700 text-white" : "text-ink-soft"}`}
        >
          {l.toUpperCase()}
        </a>
      ))}
    </nav>
  );
}

export function Footer(p: { locale: Locale; isDemo: boolean; children?: Child }) {
  return (
    <footer class="mx-auto max-w-2xl px-4 pb-10 pt-6 text-center text-sm text-ink-soft">
      {p.children}
      {p.isDemo ? (
        <p class="mt-4 inline-block rounded-full bg-warn-soft px-3 py-1 text-xs font-medium text-warn">
          {t(p.locale, "common.sample")}:{" "}
          {p.locale === "tr"
            ? "bu işletme bir demo için uydurulmuştur"
            : "this business is invented for a demo"}
        </p>
      ) : null}
      <p class="mt-3">{t(p.locale, "common.poweredBy", { brand: BRAND.name })}</p>
    </footer>
  );
}

export const Icon = {
  whatsapp: () => (
    <svg aria-hidden="true" viewBox="0 0 24 24" class="size-5" fill="currentColor">
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.5-.3Z" />
    </svg>
  ),
  phone: () => (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      class="size-5"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
    >
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2Z" />
    </svg>
  ),
  pin: () => (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      class="size-5"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  star: () => (
    <svg aria-hidden="true" viewBox="0 0 24 24" class="size-4" fill="currentColor">
      <path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1Z" />
    </svg>
  ),
  check: () => (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      class="size-5"
      fill="none"
      stroke="currentColor"
      stroke-width="2.5"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  ),
  cross: () => (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      class="size-5"
      fill="none"
      stroke="currentColor"
      stroke-width="2.5"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  ),
  clock: () => (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      class="size-4"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  ),
  film: () => (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      class="size-6"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
    >
      <path d="m22 8-6 4 6 4V8Z" />
      <rect x="2" y="6" width="14" height="12" rx="2" />
    </svg>
  ),
};
