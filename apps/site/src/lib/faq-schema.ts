import { faqPage } from "@wayfound/schema";
import type { Faq } from "./content-types.ts";
import type { SiteLocale } from "./env.ts";

export function faqNode(faqs: Faq[], lang: SiteLocale, url: string) {
  return faqPage(
    faqs.map((f, i) => ({ id: String(i), question: f.q[lang], answer: f.a[lang] })),
    url,
  );
}
