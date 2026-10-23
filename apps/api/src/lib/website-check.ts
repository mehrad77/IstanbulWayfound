import { emptySignals, type WebsiteSignals } from "@wayfound/core";
import type { Env } from "../env.ts";

const TIMEOUT_MS = 8000;
const MAX_REDIRECTS = 3;
const MAX_BYTES = 2 * 1024 * 1024;

const PRIVATE_HOST =
  /^(localhost|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|0\.|\[?::1\]?$|\[?f[cd][0-9a-f]{2}:)/i;

export function isAllowedUrl(raw: string, env: Env): URL | null {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  if (url.username || url.password) return null;
  if (
    env.ALLOW_PRIVATE_FETCH !== "true" &&
    (PRIVATE_HOST.test(url.hostname) || url.hostname.endsWith(".local"))
  ) {
    return null;
  }
  return url;
}

async function readCapped(res: Response): Promise<string> {
  const reader = res.body?.getReader();
  if (!reader) return "";
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (total < MAX_BYTES) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    total += value.byteLength;
  }
  await reader.cancel().catch(() => {});
  const buf = new Uint8Array(Math.min(total, MAX_BYTES));
  let offset = 0;
  for (const c of chunks) {
    const slice = c.subarray(0, Math.max(0, buf.length - offset));
    buf.set(slice, offset);
    offset += slice.length;
  }
  return new TextDecoder().decode(buf);
}

function collectTypes(node: unknown, signals: WebsiteSignals) {
  if (Array.isArray(node)) {
    for (const n of node) collectTypes(n, signals);
    return;
  }
  if (!node || typeof node !== "object") return;
  const obj = node as Record<string, unknown>;
  const type = obj["@type"];
  for (const t of Array.isArray(type) ? type : [type]) {
    if (typeof t === "string") signals.jsonLdTypes.push(t);
  }
  if (obj.address) signals.hasAddress = true;
  if (obj.openingHoursSpecification || obj.openingHours) signals.hasHours = true;
  if (obj.aggregateRating) signals.hasRating = true;
  if (type === "FAQPage") signals.hasFaq = true;
  for (const v of Object.values(obj)) collectTypes(v, signals);
}

/**
 * The audit's real website check. Fetches the page (http/https only, 8 s timeout,
 * at most 3 redirects, 2 MB cap) and reads what a crawler would: JSON-LD, hreflang,
 * FAQ markup and WhatsApp links. "Speed" is response time and page weight, not Lighthouse.
 */
export async function checkWebsite(raw: string, env: Env): Promise<WebsiteSignals> {
  const first = isAllowedUrl(raw, env);
  if (!first) return emptySignals(raw, "URL not allowed");

  let url = first;
  let res: Response | null = null;
  const started = Date.now();
  try {
    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
      res = await fetch(url.toString(), {
        redirect: "manual",
        signal: AbortSignal.timeout(TIMEOUT_MS),
        headers: {
          "user-agent": "WayfoundAudit/0.1 (+https://wayfound.example/audit)",
          accept: "text/html",
        },
      });
      const location = res.headers.get("location");
      if (res.status >= 300 && res.status < 400 && location) {
        const next = isAllowedUrl(new URL(location, url).toString(), env);
        if (!next) return emptySignals(raw, "Redirect target not allowed");
        url = next;
        res = null;
        continue;
      }
      break;
    }
  } catch (err) {
    return emptySignals(
      raw,
      err instanceof Error && err.name === "TimeoutError"
        ? "Timed out"
        : "Could not reach the site",
    );
  }
  if (!res) return emptySignals(raw, "Too many redirects");

  const responseMs = Date.now() - started;
  const html = await readCapped(res);
  const signals: WebsiteSignals = {
    ...emptySignals(raw, ""),
    error: null,
    finalUrl: url.toString(),
    reachable: res.ok,
    status: res.status,
    https: url.protocol === "https:",
    responseMs,
    bytes: new TextEncoder().encode(html).byteLength,
  };

  const jsonLdBlocks: string[] = [];
  let current = "";
  let faqHeading = false;
  let detailsCount = 0;
  const rewriter = new HTMLRewriter()
    .on('script[type="application/ld+json"]', {
      element(el) {
        current = "";
        el.onEndTag(() => {
          jsonLdBlocks.push(current);
        });
      },
      text(chunk) {
        current += chunk.text;
      },
    })
    .on("link[hreflang]", {
      element(el) {
        const lang = el.getAttribute("hreflang");
        if (lang && lang !== "x-default") signals.hreflangs.push(lang);
      },
    })
    .on("a[href]", {
      element(el) {
        const href = el.getAttribute("href") ?? "";
        if (/wa\.me\/|api\.whatsapp\.com|^whatsapp:/i.test(href)) signals.hasWhatsapp = true;
      },
    })
    .on("h1, h2, h3", {
      text(chunk) {
        if (/faq|frequently asked|sıkça sorulan|sik sorulan/i.test(chunk.text)) faqHeading = true;
      },
    })
    .on("details", {
      element() {
        detailsCount++;
      },
    });
  await rewriter.transform(new Response(html, { headers: { "content-type": "text/html" } })).text();

  for (const block of jsonLdBlocks) {
    try {
      collectTypes(JSON.parse(block), signals);
    } catch {
      // Invalid JSON-LD counts as missing.
    }
  }
  if (faqHeading || detailsCount >= 3) signals.hasFaq = true;
  signals.jsonLdTypes = [...new Set(signals.jsonLdTypes)];
  signals.hreflangs = [...new Set(signals.hreflangs)];
  return signals;
}
