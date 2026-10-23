import { intlLocale, type Locale } from "@wayfound/i18n";

export const DISPLAY_CURRENCIES = ["TRY", "USD", "EUR", "GBP", "AED"] as const;
export type Currency = (typeof DISPLAY_CURRENCIES)[number];
export type ForeignCurrency = Exclude<Currency, "TRY">;

/** The UAE dirham is pegged to the US dollar. ECB (and so Frankfurter) doesn't publish AED. */
export const AED_PER_USD = 3.6725;

export interface FxRates {
  base: "TRY";
  /** Date the rates were published, YYYY-MM-DD. */
  date: string;
  /** Units of the foreign currency per 1 TRY. */
  rates: Record<ForeignCurrency, number>;
  source: "frankfurter" | "fallback";
}

/** Used only until the first daily fetch succeeds; the page always shows the rate date. */
export const FALLBACK_RATES: FxRates = {
  base: "TRY",
  date: "2026-10-23",
  rates: { USD: 0.02011, EUR: 0.01796, GBP: 0.01504, AED: 0.02011 * AED_PER_USD },
  source: "fallback",
};

export function isCurrency(value: unknown): value is Currency {
  return typeof value === "string" && (DISPLAY_CURRENCIES as readonly string[]).includes(value);
}

/** Parse a Frankfurter `latest?base=TRY&symbols=USD,EUR,GBP` response. */
export function ratesFromFrankfurter(json: unknown): FxRates {
  const data = json as { base?: string; date?: string; rates?: Record<string, number> };
  const r = data.rates ?? {};
  if (data.base !== "TRY" || !data.date || !r.USD || !r.EUR || !r.GBP) {
    throw new Error("Unexpected FX response");
  }
  return {
    base: "TRY",
    date: data.date,
    rates: { USD: r.USD, EUR: r.EUR, GBP: r.GBP, AED: r.USD * AED_PER_USD },
    source: "frankfurter",
  };
}

export function convertKurus(kurus: number, currency: Currency, rates: FxRates): number {
  const lira = kurus / 100;
  return currency === "TRY" ? lira : lira * rates.rates[currency];
}

export function formatMoney(amount: number, currency: Currency, locale: Locale): string {
  const fractionDigits = currency === "TRY" ? 0 : amount < 20 ? 2 : 0;
  return new Intl.NumberFormat(intlLocale(locale), {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amount);
}

/** Format a TRY price for display. Foreign currencies are always approximate. */
export function formatPrice(
  kurus: number,
  currency: Currency,
  rates: FxRates,
  locale: Locale,
): { text: string; approx: boolean } {
  return {
    text: formatMoney(convertKurus(kurus, currency, rates), currency, locale),
    approx: currency !== "TRY",
  };
}
