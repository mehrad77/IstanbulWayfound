import type { Localized, Vertical } from "@wayfound/core";

export interface User {
  id: string;
  email: string;
  name: string;
  role: "owner" | "agency";
  businessIds: string[];
}

export interface BusinessSummary {
  id: string;
  slug: string;
  name: string;
  vertical: Vertical;
  isDemo: boolean;
  updatedAt: string;
}

export interface EditableItem {
  id: string;
  categoryId: string;
  position: number;
  sku: string | null;
  priceKurus: number | null;
  priceFrom: boolean;
  durationMin: number | null;
  soldOut: boolean;
  photoUrl: string | null;
  dietary: string[];
  allergens: string[];
  fabric: string | null;
  sizes: string[];
  moq: number | null;
  updatedAt: string;
  name: Localized;
  description: Localized;
}

export interface EditableCategory {
  id: string;
  position: number;
  name: Localized;
  items: EditableItem[];
}

export interface Lead {
  id: string;
  kind: "audit" | "inquiry" | "contact";
  businessId: string | null;
  name: string | null;
  email: string | null;
  whatsapp: string | null;
  country: string | null;
  lang: string | null;
  payload: Record<string, unknown>;
  status: "new" | "contacted" | "won" | "lost";
  createdAt: string;
}

export interface Review {
  id: string;
  platform: string;
  author: string;
  rating: number;
  lang: string;
  text: string;
  topics: string[];
  postedAt: string;
  status: "new" | "drafted" | "replied";
  replyText: string | null;
  repliedAt: string | null;
  draft: { id: string; tone: string; text: string; provider: string; violations: string[] } | null;
}

export interface EditablePackage {
  id: string;
  slug: string;
  published: boolean;
  daysInIstanbul: number;
  visits: number;
  priceFromKurus: number;
  languages: string[];
  inclusions: { key: string; included: boolean }[];
  updatedAt: string;
  name: Localized;
  summary: Localized;
  procedureName: Localized;
  priceFactors: Localized;
  steps: {
    id?: string;
    stage: string;
    owner: string;
    dayLabel: Localized;
    title: Localized;
    detail: Localized;
  }[];
  faqs: { id?: string; question: Localized; answer: Localized }[];
}
