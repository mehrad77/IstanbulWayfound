import { FALLBACK_RATES, type FxRates, ratesFromFrankfurter } from "@wayfound/core";
import type { Env } from "../env.ts";

const KEY = "fx:latest";
const URL = "https://api.frankfurter.dev/v1/latest?base=TRY&symbols=USD,EUR,GBP";

export async function refreshRates(env: Env): Promise<FxRates> {
  const res = await fetch(URL, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`FX fetch failed: ${res.status}`);
  const rates = ratesFromFrankfurter(await res.json());
  // Expires daily so a request refreshes the rates even without the cron trigger.
  await env.KV.put(KEY, JSON.stringify(rates), { expirationTtl: 60 * 60 * 24 });
  return rates;
}

/** Cached daily rates; fetches on a cold cache and falls back to dated constants if offline. */
export async function getRates(env: Env): Promise<FxRates> {
  const cached = await env.KV.get<FxRates>(KEY, "json");
  if (cached) return cached;
  try {
    return await refreshRates(env);
  } catch {
    return FALLBACK_RATES;
  }
}
