export const API_URL: string = import.meta.env.PUBLIC_API_URL ?? "http://localhost:8790";
export const PUBLIC_ORIGIN: string =
  import.meta.env.PUBLIC_PUBLIC_ORIGIN ?? "http://localhost:8791";
export const CONSOLE_ORIGIN: string =
  import.meta.env.PUBLIC_CONSOLE_ORIGIN ?? "http://localhost:5173";

export const LOCALES = ["en", "tr"] as const;
export type SiteLocale = (typeof LOCALES)[number];

export function localePaths() {
  return LOCALES.map((lang) => ({ params: { lang } }));
}

/** Resolve "PUBLIC/m/x" placeholders in content to the visitor-pages host. */
export function resolveHref(href: string, lang: SiteLocale): string {
  if (href.startsWith("PUBLIC/")) return `${PUBLIC_ORIGIN}/${href.slice(7)}?lang=${lang}`;
  if (href.startsWith("/")) return `/${lang}${href}`;
  return href;
}
