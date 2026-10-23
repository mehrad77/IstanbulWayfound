import type { Localized, Pillar, Vertical } from "@wayfound/core";

export interface Faq {
  q: Localized;
  a: Localized;
}

export interface Module {
  name: Localized;
  delivered: Localized;
  mode: "remote" | "vendor" | "onsite";
  demo?: { label: Localized; href: string };
}

export interface ServicePage {
  pillar: Pillar;
  slug: string;
  title: Localized;
  lead: Localized;
  description: Localized;
  modules: Module[];
  faqs: Faq[];
}

export interface IndustryPage {
  vertical: Vertical;
  slug: string;
  title: Localized;
  lead: Localized;
  pains: Localized[];
  demoSlug: string;
  demoName: string;
  demoLinks: { label: Localized; path: string }[];
  faqs: Faq[];
}
