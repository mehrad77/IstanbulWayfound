import type { FxRates, ProfileBundle } from "@wayfound/core";
import type { Locale } from "@wayfound/i18n";
import type { Env } from "../env.ts";

/** Calls the API Worker over the service binding: no public network hop. */
export async function api<T>(
  env: Env,
  path: string,
  init?: RequestInit,
): Promise<{ status: number; data: T }> {
  const res = await env.API.fetch(new Request(`https://api.internal/api${path}`, init));
  return { status: res.status, data: (await res.json()) as T };
}

export async function loadBusiness(env: Env, slug: string, locale: Locale, preview?: string) {
  const { status, data } = await api<{ bundle: ProfileBundle; fx: FxRates }>(
    env,
    `/public/businesses/${encodeURIComponent(slug)}?lang=${locale}${preview ? `&preview=${encodeURIComponent(preview)}` : ""}`,
  );
  return status === 200 ? data : null;
}

export function track(
  env: Env,
  ctx: { waitUntil(promise: Promise<unknown>): void },
  event: {
    businessSlug: string;
    type: string;
    lang?: string;
    currency?: string;
    staff?: string;
    path?: string;
  },
) {
  ctx.waitUntil(
    api(env, "/public/events", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(event),
    }).catch(() => {}),
  );
}
