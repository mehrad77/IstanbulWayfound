import type { Locale } from "@wayfound/i18n";

export type { Locale };

export const VERTICALS = ["dining", "retail", "clinic"] as const;
export type Vertical = (typeof VERTICALS)[number];

/** A string stored once per language. */
export type Localized<T = string> = Record<Locale, T>;

export const DIETARY = ["halal", "vegetarian", "vegan", "glutenFree"] as const;
export type Dietary = (typeof DIETARY)[number];

/** The 14 allergens EU/Turkish food labelling rules name. */
export const ALLERGENS = [
  "celery",
  "gluten",
  "crustaceans",
  "eggs",
  "fish",
  "lupin",
  "milk",
  "molluscs",
  "mustard",
  "nuts",
  "peanuts",
  "sesame",
  "soy",
  "sulphites",
] as const;
export type Allergen = (typeof ALLERGENS)[number];

export const INCLUSIONS = [
  "consultation",
  "procedure",
  "hotel",
  "transfers",
  "interpreter",
  "aftercareKit",
] as const;
export type InclusionKey = (typeof INCLUSIONS)[number];

export const STAGES = ["before", "arrival", "treatment", "aftercare"] as const;
export type Stage = (typeof STAGES)[number];

export const STEP_OWNERS = ["patient", "clinic", "coordinator"] as const;
export type StepOwner = (typeof STEP_OWNERS)[number];

export const REVIEW_PLATFORMS = ["google", "tripadvisor", "realself", "whatclinic"] as const;
export type ReviewPlatform = (typeof REVIEW_PLATFORMS)[number];

export const LISTING_PLATFORMS = ["google", "apple", "bing", "yandex", "amap"] as const;
export type ListingPlatform = (typeof LISTING_PLATFORMS)[number];
export const LISTING_STATUSES = ["missing", "in_progress", "claimed", "live"] as const;
export type ListingStatus = (typeof LISTING_STATUSES)[number];

export const EVENT_TYPES = [
  "scan",
  "view",
  "whatsapp_click",
  "call_click",
  "directions_click",
  "review_click",
  "inquiry",
] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export type Weekday = "Mo" | "Tu" | "We" | "Th" | "Fr" | "Sa" | "Su";
export interface OpeningHours {
  days: Weekday[];
  opens: string; // "09:00"
  closes: string; // "22:00"
}
