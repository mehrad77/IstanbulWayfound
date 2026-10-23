import type {
  Allergen,
  Dietary,
  InclusionKey,
  ListingPlatform,
  ListingStatus,
  Localized,
  OpeningHours,
  ReviewPlatform,
  Stage,
  StepOwner,
  Vertical,
} from "@wayfound/core";

export interface ItemSeed {
  id: string;
  sku?: string;
  name: Localized;
  description: Localized;
  priceKurus: number | null;
  priceFrom?: boolean;
  durationMin?: number;
  soldOut?: boolean;
  dietary?: Dietary[];
  allergens?: Allergen[];
  fabric?: string;
  sizes?: string[];
  moq?: number;
}

export interface CategorySeed {
  id: string;
  name: Localized;
  items: ItemSeed[];
}

export interface FaqSeed {
  id: string;
  question: Localized;
  answer: Localized;
}

export interface StepSeed {
  stage: Stage;
  owner: StepOwner;
  dayLabel: Localized;
  title: Localized;
  detail: Localized;
}

export interface PackageSeed {
  id: string;
  slug: string;
  name: Localized;
  summary: Localized;
  procedureName: Localized;
  priceFactors: Localized;
  daysInIstanbul: number;
  visits: number;
  priceFromKurus: number;
  languages: string[];
  inclusions: { key: InclusionKey; included: boolean }[];
  steps: StepSeed[];
  faqs: FaqSeed[];
}

export interface ReviewSeed {
  platform: ReviewPlatform;
  author: string;
  rating: number;
  lang: string;
  text: string;
  topics: string[];
  daysAgo: number;
  replied?: string;
}

export interface BusinessSeed {
  id: string;
  slug: string;
  vertical: Vertical;
  schemaType: string;
  name: string;
  phone: string;
  whatsapp: string;
  email: string;
  website: string | null;
  languages: string[];
  priceRange: string | null;
  rating: { value: number; count: number } | null;
  reviewLinks: Partial<Record<ReviewPlatform, string>>;
  text: { tagline: Localized; description: Localized; howToFindUs: Localized };
  location: {
    street: string;
    district: string;
    postalCode: string;
    lat: number;
    lng: number;
    hours: OpeningHours[];
  };
  categories: CategorySeed[];
  faqs: FaqSeed[];
  team: {
    id: string;
    name: string;
    title: Localized;
    credentials: Localized;
    languages: string[];
  }[];
  packages: PackageSeed[];
  reviews: ReviewSeed[];
  listings: { platform: ListingPlatform; status: ListingStatus; notes?: string }[];
  auditFixture: { matrix: Record<string, string>; competitors: string[]; sources: string[] };
  owner: { id: string; email: string; name: string; demoAccount: string };
}

/** Compact item helper: name and description per language. */
export function item(
  id: string,
  priceLira: number | null,
  en: [string, string],
  tr: [string, string],
  extra: Omit<ItemSeed, "id" | "name" | "description" | "priceKurus"> = {},
): ItemSeed {
  return {
    id,
    name: { en: en[0], tr: tr[0] },
    description: { en: en[1], tr: tr[1] },
    priceKurus: priceLira === null ? null : Math.round(priceLira * 100),
    ...extra,
  };
}

export const L = (en: string, tr: string): Localized => ({ en, tr });
