import {
  type Currency,
  DISPLAY_CURRENCIES,
  type FxRates,
  formatPrice,
  type ProfileBundle,
} from "@wayfound/core";
import { type Locale, t } from "@wayfound/i18n";
import { Icon } from "../layout.tsx";
import { formatDate, todaysHours } from "../lib/format.ts";
import type { WaLink } from "../lib/whatsapp.ts";

export function Price(p: {
  kurus: number;
  from?: boolean;
  currency: Currency;
  fx: FxRates;
  locale: Locale;
}) {
  const price = formatPrice(p.kurus, p.currency, p.fx, p.locale);
  return (
    <span class="whitespace-nowrap font-semibold tabular-nums text-ink" data-price>
      {p.from ? (
        <span class="me-1 text-xs font-normal text-ink-soft">{t(p.locale, "common.from")}</span>
      ) : null}
      {price.approx ? <span title={t(p.locale, "common.approx")}>≈ </span> : null}
      {price.text}
    </span>
  );
}

export function CurrencySwitch(p: {
  locale: Locale;
  currency: Currency;
  hrefFor: (c: Currency) => string;
}) {
  return (
    <nav aria-label={t(p.locale, "common.currency")} class="flex gap-1 text-[13px]">
      {DISPLAY_CURRENCIES.map((c) => (
        <a
          href={p.hrefFor(c)}
          aria-current={c === p.currency ? "true" : undefined}
          class={`rounded-full border px-2 py-1 font-medium ${c === p.currency ? "border-cobalt-700 bg-cobalt-700 text-white" : "border-line bg-white text-ink-soft"}`}
        >
          {c}
        </a>
      ))}
    </nav>
  );
}

export function RateNote(p: { locale: Locale; currency: Currency; fx: FxRates }) {
  if (p.currency === "TRY") return null;
  return (
    <p class="text-xs text-ink-soft" data-rate-note>
      ≈ {t(p.locale, "common.approx")} ·{" "}
      {t(p.locale, "common.rateDate", { date: formatDate(`${p.fx.date}T12:00:00Z`, p.locale) })}
    </p>
  );
}

export function BusinessHeader(p: { bundle: ProfileBundle; locale: Locale }) {
  const { business: b, location } = p.bundle;
  const hours = todaysHours(location.hours);
  return (
    <header class="mx-auto max-w-2xl px-4 pt-6">
      <p class="text-sm font-medium tracking-wide text-terracotta-600 uppercase">
        {location.district}, {location.city}
      </p>
      <h1 class="mt-1 font-serif text-3xl font-semibold text-cobalt-900 sm:text-4xl">{b.name}</h1>
      <p class="mt-2 text-ink-soft">{b.tagline}</p>
      <div class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-soft">
        {b.rating ? (
          <span class="inline-flex items-center gap-1">
            <span class="text-terracotta-500">
              <Icon.star />
            </span>
            <span class="font-semibold text-ink">{b.rating.value.toFixed(1)}</span>
            <span>({b.rating.count})</span>
          </span>
        ) : null}
        <span class="inline-flex items-center gap-1">
          <Icon.clock />
          {hours ? t(p.locale, "menu.open", { hours }) : t(p.locale, "menu.closed")}
        </span>
      </div>
    </header>
  );
}

export function ActionBar(p: {
  locale: Locale;
  slug: string;
  whatsapp: WaLink;
  whatsappLabel: string;
}) {
  return (
    <div class="grid grid-cols-[1fr_auto_auto] gap-2">
      <a href={p.whatsapp.href} ping={p.whatsapp.ping} class="btn-primary" data-whatsapp>
        <Icon.whatsapp />
        {p.whatsappLabel}
      </a>
      <a href={`/go/call/${p.slug}`} class="btn-secondary" aria-label={t(p.locale, "common.call")}>
        <Icon.phone />
      </a>
      <a
        href={`/go/map/${p.slug}`}
        class="btn-secondary"
        aria-label={t(p.locale, "common.directions")}
      >
        <Icon.pin />
      </a>
    </div>
  );
}

export function HowToFind(p: { bundle: ProfileBundle; locale: Locale }) {
  const b = p.bundle.business;
  return (
    <section id="find-us" class="mx-auto mt-8 max-w-2xl px-4">
      <h2 class="font-serif text-xl font-semibold text-cobalt-900">
        {t(p.locale, "common.howToFindUs")}
      </h2>
      <div class="card mt-3 overflow-hidden">
        {b.wayfindingVideoUrl ? (
          // biome-ignore lint/a11y/useMediaCaption: visual-only wayfinding clip; the same directions are written out below
          <video
            src={b.wayfindingVideoUrl}
            controls
            playsinline
            preload="none"
            class="aspect-video w-full bg-ink"
          />
        ) : (
          <div class="flex aspect-[16/7] items-center justify-center gap-2 bg-cobalt-50 text-sm text-cobalt-700">
            <Icon.film />
            {t(p.locale, "common.howToFindUsVideo")}
          </div>
        )}
        <div class="p-4">
          <p class="text-ink">{b.howToFindUs}</p>
          <p class="mt-2 text-sm text-ink-soft">
            {p.bundle.location.street}, {p.bundle.location.district}, {p.bundle.location.city}
          </p>
          <a
            href={`/go/map/${b.slug}`}
            class="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-cobalt-700"
          >
            <Icon.pin /> {t(p.locale, "common.directions")}
          </a>
        </div>
      </div>
    </section>
  );
}

export function Faqs(p: {
  faqs: { id: string; question: string; answer: string }[];
  title: string;
}) {
  if (!p.faqs.length) return null;
  return (
    <section id="faq" class="mx-auto mt-8 max-w-2xl px-4">
      <h2 class="font-serif text-xl font-semibold text-cobalt-900">{p.title}</h2>
      <div class="mt-3 divide-y divide-line card">
        {p.faqs.map((f) => (
          <details class="group p-4">
            <summary class="cursor-pointer list-none font-semibold text-ink marker:hidden">
              <span class="flex items-start justify-between gap-4">
                {f.question}
                <span
                  class="text-cobalt-700 transition-transform group-open:rotate-45"
                  aria-hidden="true"
                >
                  +
                </span>
              </span>
            </summary>
            <p class="mt-2 text-ink-soft">{f.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
