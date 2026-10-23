import {
  type Currency,
  type FxRates,
  type PackageInfo,
  type ProfileBundle,
  STAGES,
} from "@wayfound/core";
import { type Locale, type MessageKey, t } from "@wayfound/i18n";
import { Footer, Icon, LangSwitch } from "../layout.tsx";
import { languageName } from "../lib/format.ts";
import { waLink } from "../lib/whatsapp.ts";
import {
  ActionBar,
  BusinessHeader,
  CurrencySwitch,
  Faqs,
  HowToFind,
  Price,
  RateNote,
} from "./shared.tsx";

interface Common {
  bundle: ProfileBundle;
  fx: FxRates;
  locale: Locale;
  currency: Currency;
  hrefLang: (l: Locale) => string;
  hrefCurrency: (c: Currency) => string;
  waNumber: string;
}

function TopBar(p: Common) {
  return (
    <div class="sticky top-0 z-10 border-b border-line bg-paper/95 backdrop-blur">
      <div class="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-2">
        <LangSwitch locale={p.locale} hrefFor={p.hrefLang} />
        <CurrencySwitch locale={p.locale} currency={p.currency} hrefFor={p.hrefCurrency} />
      </div>
    </div>
  );
}

export function ClinicIndexPage(p: Common) {
  const { bundle, locale } = p;
  const tt = (k: MessageKey, v?: Record<string, string | number>) => t(locale, k, v);
  return (
    <>
      <TopBar {...p} />
      <BusinessHeader bundle={bundle} locale={locale} />
      <div class="mx-auto mt-4 max-w-2xl px-4">
        <ActionBar
          locale={locale}
          slug={bundle.business.slug}
          whatsapp={waLink(bundle, p.waNumber, "general", locale)}
          whatsappLabel={tt("common.whatsapp")}
        />
        <p class="mt-4 text-ink-soft">{bundle.business.description}</p>
      </div>
      <main class="mx-auto mt-6 max-w-2xl px-4">
        <h2 class="font-serif text-2xl font-semibold text-cobalt-900">{tt("clinic.packages")}</h2>
        <ul class="mt-3 grid gap-3">
          {bundle.packages.map((pkg) => (
            <li>
              <a
                href={`/c/${bundle.business.slug}/${pkg.slug}`}
                class="card block p-4 hover:border-cobalt-300"
              >
                <span class="flex items-start justify-between gap-3">
                  <span class="font-serif text-lg font-semibold text-ink">{pkg.name}</span>
                  <Price
                    kurus={pkg.priceFromKurus}
                    from
                    currency={p.currency}
                    fx={p.fx}
                    locale={locale}
                  />
                </span>
                <span class="mt-1 block text-sm text-ink-soft">{pkg.summary}</span>
                <span class="mt-2 flex flex-wrap gap-1.5">
                  <span class="badge">
                    {tt("clinic.daysInIstanbul", { n: pkg.daysInIstanbul })}
                  </span>
                  <span class="badge">{tt("clinic.visits", { n: pkg.visits })}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
        <RateNote locale={locale} currency={p.currency} fx={p.fx} />
        <p class="mt-4 text-sm">
          <a class="font-semibold text-cobalt-700" href={`/m/${bundle.business.slug}`}>
            {tt("menu.priceList")} →
          </a>
        </p>
      </main>
      <HowToFind bundle={bundle} locale={locale} />
      <Faqs faqs={bundle.faqs} title="FAQ" />
      <Footer locale={locale} isDemo={bundle.business.isDemo} />
    </>
  );
}

export function PackagePage(p: Common & { pkg: PackageInfo; error?: string }) {
  const { bundle, locale, pkg } = p;
  const b = bundle.business;
  const tt = (k: MessageKey, v?: Record<string, string | number>) => t(locale, k, v);
  return (
    <>
      <TopBar {...p} />
      <header class="mx-auto max-w-2xl px-4 pt-6">
        <a href={`/c/${b.slug}`} class="text-sm font-medium text-cobalt-700">
          ← {b.name}
        </a>
        <h1 class="mt-2 font-serif text-3xl font-semibold text-cobalt-900">{pkg.name}</h1>
        <p class="mt-2 text-ink-soft">{pkg.summary}</p>
      </header>

      <section class="mx-auto mt-5 max-w-2xl px-4" aria-labelledby="glance">
        <h2 id="glance" class="sr-only">
          {tt("clinic.atAGlance")}
        </h2>
        <div class="card grid grid-cols-2 gap-px overflow-hidden bg-line">
          <div class="bg-white p-4">
            <p class="text-xs font-semibold tracking-wide text-ink-soft uppercase">
              {tt("clinic.atAGlance")}
            </p>
            <p class="mt-1 font-semibold">
              {tt("clinic.daysInIstanbul", { n: pkg.daysInIstanbul })}
            </p>
            <p class="text-sm text-ink-soft">{tt("clinic.visits", { n: pkg.visits })}</p>
          </div>
          <div class="bg-white p-4">
            <p class="text-xs font-semibold tracking-wide text-ink-soft uppercase">
              {tt("common.from")}
            </p>
            <p class="mt-1 text-lg">
              <Price kurus={pkg.priceFromKurus} currency={p.currency} fx={p.fx} locale={locale} />
            </p>
            <RateNote locale={locale} currency={p.currency} fx={p.fx} />
          </div>
          <div class="col-span-2 bg-white p-4">
            <p class="text-xs font-semibold tracking-wide text-ink-soft uppercase">
              {tt("clinic.priceFactors")}
            </p>
            <p class="mt-1 text-sm text-ink">{pkg.priceFactors}</p>
          </div>
          <div class="col-span-2 bg-white p-4">
            <p class="text-xs font-semibold tracking-wide text-ink-soft uppercase">
              {tt("clinic.languagesSpoken")}
            </p>
            <p class="mt-1 flex flex-wrap gap-1.5">
              {pkg.languages.map((l) => (
                <span class="badge bg-cobalt-50 text-cobalt-700">{languageName(l, locale)}</span>
              ))}
            </p>
          </div>
        </div>
      </section>

      <section class="mx-auto mt-8 max-w-2xl px-4" aria-labelledby="roadmap">
        <h2 id="roadmap" class="font-serif text-xl font-semibold text-cobalt-900">
          {tt("clinic.roadmap")}
        </h2>
        <ol class="mt-4">
          {STAGES.map((stage, si) => {
            const steps = pkg.steps.filter((s) => s.stage === stage);
            if (!steps.length) return null;
            return (
              <li class="relative ps-8 pb-6" data-stage={stage}>
                <span class="absolute start-0 top-0 flex size-6 items-center justify-center rounded-full bg-cobalt-700 text-xs font-bold text-white">
                  {si + 1}
                </span>
                {si < STAGES.length - 1 ? (
                  <span
                    class="absolute start-3 top-7 bottom-0 w-px bg-cobalt-200"
                    aria-hidden="true"
                  />
                ) : null}
                <h3 class="font-semibold text-cobalt-900">
                  {tt(`clinic.stages.${stage}` as MessageKey)}
                </h3>
                <ul class="mt-2 grid gap-2">
                  {steps.map((s) => (
                    <li class="card p-3">
                      <p class="text-xs font-semibold text-terracotta-600">{s.dayLabel}</p>
                      <p class="font-semibold text-ink">{s.title}</p>
                      <p class="mt-0.5 text-sm text-ink-soft">{s.detail}</p>
                      <p class="mt-1.5 text-xs text-ink-soft">
                        <span class="badge">{tt(`clinic.who.${s.owner}` as MessageKey)}</span>
                      </p>
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ol>
      </section>

      <section class="mx-auto mt-2 max-w-2xl px-4" aria-labelledby="included">
        <h2 id="included" class="font-serif text-xl font-semibold text-cobalt-900">
          {tt("clinic.included")}
        </h2>
        <ul class="card mt-3 divide-y divide-line">
          {pkg.inclusions.map((inc) => (
            <li class="flex items-center gap-3 px-4 py-3">
              <span class={inc.included ? "text-ok" : "text-ink-soft"}>
                {inc.included ? <Icon.check /> : <Icon.cross />}
              </span>
              <span class={inc.included ? "text-ink" : "text-ink-soft line-through"}>
                {tt(`clinic.inclusions.${inc.key}` as MessageKey)}
              </span>
              {!inc.included ? (
                <span class="ms-auto text-xs text-ink-soft">{tt("clinic.notIncluded")}</span>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      {bundle.team.length ? (
        <section class="mx-auto mt-8 max-w-2xl px-4" aria-labelledby="team">
          <h2 id="team" class="font-serif text-xl font-semibold text-cobalt-900">
            {tt("clinic.team")}
          </h2>
          <ul class="mt-3 grid gap-2 sm:grid-cols-2">
            {bundle.team.map((m) => (
              <li class="card p-4">
                <p class="font-semibold text-ink">{m.name}</p>
                <p class="text-sm text-terracotta-600">{m.title}</p>
                <p class="mt-1 text-sm text-ink-soft">{m.credentials}</p>
                <p class="mt-2 flex flex-wrap gap-1">
                  {m.languages.map((l) => (
                    <span class="badge">{languageName(l, locale)}</span>
                  ))}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <Faqs faqs={pkg.faqs} title={tt("clinic.faq")} />

      <section id="inquiry" class="mx-auto mt-8 max-w-2xl px-4" aria-labelledby="inquiry-title">
        <div class="card border-terracotta-300 p-5">
          <h2 id="inquiry-title" class="font-serif text-xl font-semibold text-cobalt-900">
            {tt("clinic.inquiryTitle")}
          </h2>
          <p class="mt-1 text-sm text-ink-soft">{tt("clinic.inquiryLead")}</p>
          {p.error ? (
            <p class="mt-3 rounded-lg bg-bad-soft p-3 text-sm text-bad">{p.error}</p>
          ) : null}
          <form
            method="post"
            action={`/c/${b.slug}/${pkg.slug}/inquiry`}
            class="mt-4 grid gap-3"
            data-inquiry
          >
            <input type="hidden" name="lang" value={locale} />
            <label class="grid gap-1 text-sm font-medium">
              {tt("clinic.name")}
              <input name="name" required maxlength={120} autocomplete="name" class="field" />
            </label>
            <label class="grid gap-1 text-sm font-medium">
              {tt("clinic.country")}
              <input
                name="country"
                required
                maxlength={80}
                autocomplete="country-name"
                class="field"
              />
            </label>
            <label class="grid gap-1 text-sm font-medium">
              {tt("clinic.dates")}
              <input
                name="dates"
                required
                maxlength={120}
                placeholder={tt("clinic.datesPlaceholder")}
                class="field"
              />
            </label>
            <label class="grid gap-1 text-sm font-medium">
              {tt("clinic.treatment")}
              <input
                name="treatment"
                required
                maxlength={120}
                value={pkg.procedureName}
                class="field"
              />
            </label>
            <p class="text-xs text-ink-soft">{tt("clinic.privacyNote")}</p>
            <button type="submit" class="btn-primary">
              <Icon.whatsapp /> {tt("clinic.sendOnWhatsapp")}
            </button>
          </form>
        </div>
      </section>

      <HowToFind bundle={bundle} locale={locale} />
      <Footer locale={locale} isDemo={b.isDemo} />
    </>
  );
}
