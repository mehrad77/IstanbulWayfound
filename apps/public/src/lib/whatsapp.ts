import { allItems, type ProfileBundle, whatsappUrl } from "@wayfound/core";
import { type Locale, t } from "@wayfound/i18n";

export type WaKind = "table" | "general" | "quote" | "treatment";

/** The pre-filled message, written in the visitor's language. */
export function waText(bundle: ProfileBundle, kind: WaKind, lang: Locale, itemId?: string): string {
  const name = bundle.business.name;
  const item = itemId ? allItems(bundle).find((i) => i.id === itemId) : undefined;
  if (kind === "table") return t(lang, "menu.whatsappTable", { name });
  if (kind === "quote" && item)
    return t(lang, "menu.whatsappQuote", { name, sku: item.sku ?? item.id, item: item.name });
  if (kind === "treatment" && item)
    return t(lang, "menu.whatsappTreatment", { name, item: item.name });
  return t(lang, "menu.whatsappGeneral", { name });
}

export interface WaLink {
  href: string;
  ping: string;
}

/**
 * A direct wa.me link (what crawlers and the audit look for) plus a `ping` URL that
 * records the click without a redirect hop.
 */
export function waLink(
  bundle: ProfileBundle,
  number: string,
  kind: WaKind,
  lang: Locale,
  itemId?: string,
): WaLink {
  return {
    href: whatsappUrl(number, waText(bundle, kind, lang, itemId)),
    ping: `/go/ping/${bundle.business.slug}?type=whatsapp_click&lang=${lang}`,
  };
}
