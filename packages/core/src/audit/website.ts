import type { Localized } from "../types.ts";

/** What the website check extracted from a page. Produced by the API's HTMLRewriter pass. */
export interface WebsiteSignals {
  url: string;
  finalUrl: string | null;
  reachable: boolean;
  status: number | null;
  https: boolean;
  responseMs: number | null;
  bytes: number | null;
  jsonLdTypes: string[];
  hasAddress: boolean;
  hasHours: boolean;
  hasRating: boolean;
  hreflangs: string[];
  hasFaq: boolean;
  hasWhatsapp: boolean;
  error: string | null;
}

export const LOCAL_BUSINESS_TYPES = [
  "LocalBusiness",
  "Restaurant",
  "CafeOrCoffeeShop",
  "FoodEstablishment",
  "Store",
  "ClothingStore",
  "WholesaleStore",
  "Dentist",
  "MedicalClinic",
  "MedicalBusiness",
  "Physician",
  "HealthAndBeautyBusiness",
];

export type CheckKey =
  | "reachable"
  | "localBusiness"
  | "address"
  | "hours"
  | "rating"
  | "hreflang"
  | "faq"
  | "whatsapp"
  | "speed";

export interface WebsiteCheck {
  key: CheckKey;
  ok: boolean;
  points: number;
  max: number;
  label: Localized;
}

const CHECKS: {
  key: CheckKey;
  max: number;
  label: Localized;
  test: (s: WebsiteSignals) => boolean;
}[] = [
  {
    key: "reachable",
    max: 4,
    label: { en: "Site loads over HTTPS", tr: "Site HTTPS ile açılıyor" },
    test: (s) => s.reachable && s.https,
  },
  {
    key: "localBusiness",
    max: 6,
    label: { en: "Business schema (JSON-LD)", tr: "İşletme şeması (JSON-LD)" },
    test: (s) => s.jsonLdTypes.some((t) => LOCAL_BUSINESS_TYPES.includes(t)),
  },
  {
    key: "address",
    max: 3,
    label: { en: "Address in schema", tr: "Şemada adres" },
    test: (s) => s.hasAddress,
  },
  {
    key: "hours",
    max: 3,
    label: { en: "Opening hours in schema", tr: "Şemada çalışma saatleri" },
    test: (s) => s.hasHours,
  },
  {
    key: "rating",
    max: 3,
    label: { en: "Rating in schema", tr: "Şemada puan" },
    test: (s) => s.hasRating,
  },
  {
    key: "hreflang",
    max: 4,
    label: {
      en: "Pages in more than one language (hreflang)",
      tr: "Birden fazla dilde sayfa (hreflang)",
    },
    test: (s) => new Set(s.hreflangs.map((h) => h.toLowerCase().split("-")[0])).size >= 2,
  },
  {
    key: "faq",
    max: 4,
    label: { en: "FAQ block that AI can quote", tr: "Yapay zekânın alıntılayabileceği SSS bölümü" },
    test: (s) => s.hasFaq,
  },
  {
    key: "whatsapp",
    max: 2,
    label: { en: "WhatsApp link", tr: "WhatsApp bağlantısı" },
    test: (s) => s.hasWhatsapp,
  },
  {
    key: "speed",
    max: 1,
    label: { en: "Fast first response and light page", tr: "Hızlı ilk yanıt ve hafif sayfa" },
    test: (s) => s.responseMs !== null && s.responseMs < 1500 && (s.bytes ?? 0) < 600_000,
  },
];

export const WEBSITE_MAX = CHECKS.reduce((sum, c) => sum + c.max, 0);

export function evaluateWebsite(signals: WebsiteSignals): WebsiteCheck[] {
  return CHECKS.map((c) => {
    const ok = c.test(signals);
    return { key: c.key, ok, points: ok ? c.max : 0, max: c.max, label: c.label };
  });
}

export function emptySignals(url: string, error: string): WebsiteSignals {
  return {
    url,
    finalUrl: null,
    reachable: false,
    status: null,
    https: url.startsWith("https://"),
    responseMs: null,
    bytes: null,
    jsonLdTypes: [],
    hasAddress: false,
    hasHours: false,
    hasRating: false,
    hreflangs: [],
    hasFaq: false,
    hasWhatsapp: false,
    error,
  };
}
