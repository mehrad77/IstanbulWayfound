export const LOCALES = {
  en: { label: "English", nativeLabel: "English", dir: "ltr", intl: "en-GB" },
  tr: { label: "Turkish", nativeLabel: "Türkçe", dir: "ltr", intl: "tr-TR" },
  // Ready to switch on later; content rows are added per language, not columns.
  // ar: { label: "Arabic", nativeLabel: "العربية", dir: "rtl", intl: "ar" },
  // ru: { label: "Russian", nativeLabel: "Русский", dir: "ltr", intl: "ru-RU" },
} as const;

export type Locale = keyof typeof LOCALES;
export const SUPPORTED_LOCALES = Object.keys(LOCALES) as Locale[];
export const DEFAULT_LOCALE: Locale = "en";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && value in LOCALES;
}

export function dirFor(locale: Locale): "ltr" | "rtl" {
  return LOCALES[locale].dir;
}

export function intlLocale(locale: Locale): string {
  return LOCALES[locale].intl;
}

/** Pick the best supported locale from an Accept-Language header. */
export function negotiateLocale(
  acceptLanguage: string | null | undefined,
  supported: readonly Locale[] = SUPPORTED_LOCALES,
  fallback: Locale = DEFAULT_LOCALE,
): Locale {
  if (!acceptLanguage) return fallback;
  const ranked = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag = "", ...params] = part.trim().split(";");
      const q = params.find((p) => p.trim().startsWith("q="));
      return { tag: tag.toLowerCase(), q: q ? Number(q.trim().slice(2)) || 0 : 1 };
    })
    .filter((entry) => entry.tag)
    .sort((a, b) => b.q - a.q);
  for (const { tag } of ranked) {
    const base = tag.split("-")[0];
    const hit = supported.find((l) => l === tag || l === base);
    if (hit) return hit;
  }
  return fallback;
}
