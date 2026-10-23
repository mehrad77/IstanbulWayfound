import {
  ALLERGENS,
  type Allergen,
  allItems,
  type Currency,
  DIETARY,
  type Dietary,
  type FxRates,
  type ItemInfo,
  type ProfileBundle,
} from "@wayfound/core";
import { type Locale, type MessageKey, t } from "@wayfound/i18n";
import { Footer, LangSwitch } from "../layout.tsx";
import { formatDate } from "../lib/format.ts";
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

export interface MenuFilters {
  diet: Dietary[];
  avoid: Allergen[];
}

export function parseFilters(url: URL): MenuFilters {
  const list = (k: string) => (url.searchParams.get(k) ?? "").split(",").filter(Boolean);
  return {
    diet: list("diet").filter((d): d is Dietary => (DIETARY as readonly string[]).includes(d)),
    avoid: list("avoid").filter((a): a is Allergen => (ALLERGENS as readonly string[]).includes(a)),
  };
}

export function matches(item: ItemInfo, f: MenuFilters): boolean {
  return (
    f.diet.every((d) => item.dietary.includes(d)) &&
    !f.avoid.some((a) => item.allergens.includes(a))
  );
}

function ItemRow(p: {
  item: ItemInfo;
  bundle: ProfileBundle;
  locale: Locale;
  currency: Currency;
  fx: FxRates;
  waNumber: string;
}) {
  const { item, locale } = p;
  const vertical = p.bundle.business.vertical;
  const tt = (k: MessageKey, v?: Record<string, string | number>) => t(locale, k, v);
  return (
    <li
      id={`item-${item.id}`}
      class={`flex gap-3 py-4 ${item.soldOut ? "opacity-60" : ""}`}
      data-item
      data-diet={item.dietary.join(" ")}
      data-allergens={item.allergens.join(" ")}
    >
      {item.photoUrl ? (
        <img
          src={item.photoUrl}
          alt=""
          loading="lazy"
          decoding="async"
          class="size-20 shrink-0 rounded-xl object-cover"
          width="80"
          height="80"
        />
      ) : null}
      <div class="min-w-0 flex-1">
        <div class="flex items-start justify-between gap-3">
          <h3 class="font-semibold text-ink">
            {item.name}
            {item.sku ? (
              <span class="ms-2 text-xs font-normal text-ink-soft">
                {tt("retail.sku", { sku: item.sku })}
              </span>
            ) : null}
          </h3>
          {item.priceKurus !== null ? (
            <Price
              kurus={item.priceKurus}
              from={item.priceFrom}
              currency={p.currency}
              fx={p.fx}
              locale={locale}
            />
          ) : null}
        </div>
        <p class="mt-0.5 text-sm text-ink-soft">{item.description}</p>
        <div class="mt-2 flex flex-wrap items-center gap-1.5">
          {item.soldOut ? (
            <span class="badge bg-bad-soft text-bad">{tt("common.soldOut")}</span>
          ) : null}
          {item.dietary.map((d) => (
            <span class="badge bg-ok-soft text-ok">{tt(`dietary.${d}` as MessageKey)}</span>
          ))}
          {item.durationMin ? (
            <span class="badge">{tt("common.minutes", { n: item.durationMin })}</span>
          ) : null}
          {item.fabric ? (
            <span class="badge">
              {tt("retail.fabric")}: {item.fabric}
            </span>
          ) : null}
          {item.sizes.length ? (
            <span class="badge">
              {tt("retail.sizes")}: {item.sizes.join(" · ")}
            </span>
          ) : null}
          {item.moq ? (
            <span class="badge bg-cobalt-50 text-cobalt-700">
              {tt("retail.moq", { n: item.moq })}
            </span>
          ) : null}
        </div>
        {item.allergens.length ? (
          <p class="mt-1.5 text-xs text-ink-soft">
            {tt("allergens.title")}:{" "}
            {item.allergens.map((a) => tt(`allergens.${a}` as MessageKey)).join(", ")}
          </p>
        ) : null}
        {vertical !== "dining" && !item.soldOut ? (
          <a
            {...waLink(
              p.bundle,
              p.waNumber,
              vertical === "retail" ? "quote" : "treatment",
              locale,
              item.id,
            )}
            class="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-terracotta-600"
          >
            {vertical === "retail" ? tt("menu.requestQuote") : tt("menu.askOnWhatsapp")} →
          </a>
        ) : null}
      </div>
    </li>
  );
}

function FilterChips(p: { locale: Locale; filters: MenuFilters; baseHref: string }) {
  const tt = (k: MessageKey) => t(p.locale, k);
  const active = p.filters.diet.length + p.filters.avoid.length;
  return (
    <form method="get" action={p.baseHref} class="mt-3" data-filters>
      <details open={active > 0 ? true : undefined} class="card">
        <summary class="flex cursor-pointer list-none items-center justify-between px-4 py-3 font-semibold">
          <span>
            {tt("common.filters")}
            {active ? (
              <span class="ms-2 rounded-full bg-cobalt-700 px-2 py-0.5 text-xs text-white">
                {active}
              </span>
            ) : null}
          </span>
          <span class="text-sm font-normal text-cobalt-700">▾</span>
        </summary>
        <div class="border-t border-line px-4 py-3">
          <fieldset>
            <legend class="sr-only">{tt("common.filters")}</legend>
            <div class="flex flex-wrap gap-2">
              {DIETARY.map((d) => (
                <label class="cursor-pointer">
                  <input
                    type="checkbox"
                    name="diet"
                    value={d}
                    checked={p.filters.diet.includes(d)}
                    class="peer sr-only"
                  />
                  <span class="chip peer-checked:chip-on peer-focus-visible:ring-2">
                    {tt(`dietary.${d}` as MessageKey)}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset class="mt-3">
            <legend class="text-sm font-semibold text-ink">{tt("allergens.avoid")}</legend>
            <div class="mt-2 flex flex-wrap gap-2">
              {ALLERGENS.map((a) => (
                <label class="cursor-pointer">
                  <input
                    type="checkbox"
                    name="avoid"
                    value={a}
                    checked={p.filters.avoid.includes(a)}
                    class="peer sr-only"
                  />
                  <span class="chip peer-checked:chip-on peer-focus-visible:ring-2">
                    {tt(`allergens.${a}` as MessageKey)}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <div class="mt-3 flex gap-2">
            <button type="submit" class="btn-secondary py-2 text-sm" data-filter-submit>
              {tt("common.filters")} ✓
            </button>
            {active ? (
              <a href={p.baseHref} class="btn py-2 text-sm text-cobalt-700">
                {tt("common.clearFilters")}
              </a>
            ) : null}
          </div>
        </div>
      </details>
    </form>
  );
}

export function MenuPage(p: {
  bundle: ProfileBundle;
  fx: FxRates;
  locale: Locale;
  currency: Currency;
  filters: MenuFilters;
  hrefLang: (l: Locale) => string;
  hrefCurrency: (c: Currency) => string;
  waNumber: string;
}) {
  const { bundle, locale } = p;
  const b = bundle.business;
  const tt = (k: MessageKey, v?: Record<string, string | number>) => t(locale, k, v);
  const vertical = b.vertical;
  const title =
    vertical === "dining"
      ? tt("menu.title")
      : vertical === "retail"
        ? tt("menu.catalog")
        : tt("menu.priceList");
  const shown = bundle.categories
    .map((c) => ({
      ...c,
      items: vertical === "dining" ? c.items.filter((i) => matches(i, p.filters)) : c.items,
    }))
    .filter((c) => c.items.length);
  const waMessage = vertical === "dining" ? "table" : "general";
  const lastUpdated = [b.updatedAt, ...allItems(bundle).map((i) => i.updatedAt)].sort().at(-1)!;

  return (
    <>
      <div class="sticky top-0 z-10 border-b border-line bg-paper/95 backdrop-blur">
        <div class="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-2">
          <LangSwitch locale={locale} hrefFor={p.hrefLang} />
          <CurrencySwitch locale={locale} currency={p.currency} hrefFor={p.hrefCurrency} />
        </div>
      </div>

      <BusinessHeader bundle={bundle} locale={locale} />

      <div class="mx-auto mt-4 max-w-2xl px-4">
        <ActionBar
          locale={locale}
          slug={b.slug}
          whatsapp={waLink(bundle, p.waNumber, waMessage, locale)}
          whatsappLabel={tt("common.whatsapp")}
        />
      </div>

      {vertical === "clinic" && bundle.packages.length ? (
        <section class="mx-auto mt-6 max-w-2xl px-4">
          <h2 class="font-serif text-xl font-semibold text-cobalt-900">{tt("clinic.packages")}</h2>
          <ul class="mt-3 grid gap-2">
            {bundle.packages.map((pkg) => (
              <li>
                <a
                  href={`/c/${b.slug}/${pkg.slug}?lang=${locale}`}
                  class="card flex items-center justify-between gap-3 p-4 hover:border-cobalt-300"
                >
                  <span>
                    <span class="block font-semibold text-ink">{pkg.name}</span>
                    <span class="text-sm text-ink-soft">
                      {tt("clinic.daysInIstanbul", { n: pkg.daysInIstanbul })}
                    </span>
                  </span>
                  <Price
                    kurus={pkg.priceFromKurus}
                    from
                    currency={p.currency}
                    fx={p.fx}
                    locale={locale}
                  />
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <main class="mx-auto mt-6 max-w-2xl px-4">
        <div class="flex items-baseline justify-between gap-3">
          <h2 class="font-serif text-2xl font-semibold text-cobalt-900">{title}</h2>
          <p class="text-xs text-ink-soft" data-last-updated={lastUpdated}>
            {tt("common.lastUpdated", { date: formatDate(lastUpdated, locale) })}
          </p>
        </div>
        <RateNote locale={locale} currency={p.currency} fx={p.fx} />

        {vertical === "dining" ? (
          <FilterChips locale={locale} filters={p.filters} baseHref={`/m/${b.slug}`} />
        ) : null}

        <nav aria-label={title} class="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1">
          {shown.map((c) => (
            <a href={`#cat-${c.id}`} class="chip">
              {c.name}
            </a>
          ))}
        </nav>

        {shown.length ? (
          shown.map((c) => (
            <section id={`cat-${c.id}`} class="mt-6 scroll-mt-16">
              <h3 class="text-sm font-semibold tracking-wide text-terracotta-600 uppercase">
                {c.name}
              </h3>
              <ul class="divide-y divide-line">
                {c.items.map((item) => (
                  <ItemRow
                    item={item}
                    bundle={bundle}
                    locale={locale}
                    currency={p.currency}
                    fx={p.fx}
                    waNumber={p.waNumber}
                  />
                ))}
              </ul>
            </section>
          ))
        ) : (
          <p class="card mt-6 p-6 text-center text-ink-soft">{tt("common.noMatches")}</p>
        )}
      </main>

      <HowToFind bundle={bundle} locale={locale} />
      <Faqs faqs={bundle.faqs} title="FAQ" />

      <Footer locale={locale} isDemo={b.isDemo}>
        <a href={`/r/${b.slug}?lang=${locale}`} class="btn-secondary w-full" data-review-footer>
          ★ {tt("menu.reviewFooter")}
        </a>
      </Footer>
    </>
  );
}
