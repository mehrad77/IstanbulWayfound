import { type Currency, isCurrency } from "@wayfound/core";
import { isLocale, type Locale, negotiateLocale } from "@wayfound/i18n";
import type { Context } from "hono";
import { getCookie, setCookie } from "hono/cookie";

/** Language: ?lang= beats the cookie, which beats the phone's language. */
export function resolveLocale(c: Context): Locale {
  const q = c.req.query("lang");
  if (isLocale(q)) {
    setCookie(c, "wf_lang", q, { path: "/", maxAge: 60 * 60 * 24 * 180, sameSite: "Lax" });
    return q;
  }
  const cookie = getCookie(c, "wf_lang");
  if (isLocale(cookie)) return cookie;
  return negotiateLocale(c.req.header("accept-language"));
}

const REGION_CURRENCY: Record<string, Currency> = {
  GB: "GBP",
  US: "USD",
  AE: "AED",
  SA: "USD",
  QA: "USD",
  KW: "USD",
};

/** Guess a sensible display currency from Accept-Language, e.g. en-GB → GBP, de → EUR. */
export function guessCurrency(acceptLanguage: string | undefined): Currency {
  const first = acceptLanguage?.split(",")[0]?.trim() ?? "";
  const [lang, region] = first.split(/[-_]/);
  if (region && REGION_CURRENCY[region.toUpperCase()])
    return REGION_CURRENCY[region.toUpperCase()]!;
  if (lang === "tr") return "TRY";
  if (
    ["de", "fr", "it", "es", "nl", "pt", "el", "fi", "et", "lv", "lt", "sk", "sl"].includes(
      lang ?? "",
    )
  )
    return "EUR";
  if (lang === "ar") return "AED";
  return "TRY";
}

export function resolveCurrency(c: Context): Currency {
  const q = c.req.query("cur");
  if (isCurrency(q)) {
    setCookie(c, "wf_cur", q, { path: "/", maxAge: 60 * 60 * 24 * 180, sameSite: "Lax" });
    return q;
  }
  const cookie = getCookie(c, "wf_cur");
  if (isCurrency(cookie)) return cookie;
  return guessCurrency(c.req.header("accept-language"));
}

/** Build a URL on the current path with some query params replaced. */
export function withQuery(c: Context, changes: Record<string, string | null>): string {
  const url = new URL(c.req.url);
  for (const [k, v] of Object.entries(changes)) {
    if (v === null) url.searchParams.delete(k);
    else url.searchParams.set(k, v);
  }
  return `${url.pathname}${url.search}`;
}
