import type {
  Allergen,
  Dietary,
  InclusionKey,
  Locale,
  OpeningHours,
  ReviewPlatform,
  Stage,
  StepOwner,
  Vertical,
} from "./types.ts";

/**
 * A Business Profile resolved into one language. Every public page, JSON-LD graph
 * and report reads from this shape, whether it came from D1 or straight from seed data.
 */
export interface ProfileBundle {
  locale: Locale;
  business: BusinessInfo;
  location: LocationInfo;
  categories: CategoryInfo[];
  faqs: FaqInfo[];
  team: TeamMemberInfo[];
  packages: PackageInfo[];
}

export interface BusinessInfo {
  id: string;
  slug: string;
  vertical: Vertical;
  /** Schema.org type, e.g. CafeOrCoffeeShop, ClothingStore, Dentist. */
  schemaType: string;
  name: string;
  tagline: string;
  description: string;
  howToFindUs: string;
  phone: string;
  whatsapp: string;
  email: string;
  website: string | null;
  /** Languages staff speak (ISO 639-1). */
  languages: string[];
  priceRange: string | null;
  rating: { value: number; count: number } | null;
  reviewLinks: Partial<Record<ReviewPlatform, string>>;
  wayfindingVideoUrl: string | null;
  logoUrl: string | null;
  isDemo: boolean;
  updatedAt: string;
}

export interface LocationInfo {
  street: string;
  district: string;
  city: string;
  postalCode: string;
  country: string;
  lat: number;
  lng: number;
  hours: OpeningHours[];
}

export interface CategoryInfo {
  id: string;
  name: string;
  position: number;
  items: ItemInfo[];
}

export interface ItemInfo {
  id: string;
  categoryId: string;
  sku: string | null;
  name: string;
  description: string;
  priceKurus: number | null;
  priceFrom: boolean;
  durationMin: number | null;
  soldOut: boolean;
  photoUrl: string | null;
  dietary: Dietary[];
  allergens: Allergen[];
  fabric: string | null;
  sizes: string[];
  moq: number | null;
  position: number;
  updatedAt: string;
}

export interface FaqInfo {
  id: string;
  question: string;
  answer: string;
}

export interface TeamMemberInfo {
  id: string;
  name: string;
  title: string;
  credentials: string;
  languages: string[];
}

export interface PackageStepInfo {
  id: string;
  stage: Stage;
  owner: StepOwner;
  dayLabel: string;
  title: string;
  detail: string;
  position: number;
}

export interface PackageInfo {
  id: string;
  slug: string;
  name: string;
  summary: string;
  procedureName: string;
  daysInIstanbul: number;
  visits: number;
  priceFromKurus: number;
  priceFactors: string;
  languages: string[];
  inclusions: { key: InclusionKey; included: boolean }[];
  steps: PackageStepInfo[];
  faqs: FaqInfo[];
  published: boolean;
  position: number;
}

export function allItems(bundle: ProfileBundle): ItemInfo[] {
  return bundle.categories.flatMap((c) => c.items);
}

export function mapsUrl(location: LocationInfo, name: string): string {
  const q = encodeURIComponent(
    `${name}, ${location.street}, ${location.district}, ${location.city}`,
  );
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}
