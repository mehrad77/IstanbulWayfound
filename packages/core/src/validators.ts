import { z } from "zod";
import { REPLY_TONES } from "./ai.ts";
import {
  ALLERGENS,
  DIETARY,
  EVENT_TYPES,
  INCLUSIONS,
  LISTING_STATUSES,
  STAGES,
  STEP_OWNERS,
  VERTICALS,
} from "./types.ts";

const locale = z.enum(["en", "tr"]);
const localized = z.object({ en: z.string().max(4000), tr: z.string().max(4000) });
const optionalText = z.string().trim().max(200).optional().default("");

export const auditInput = z.object({
  businessName: z.string().trim().min(2).max(120),
  vertical: z.enum(VERTICALS),
  district: z.string().trim().min(2).max(80),
  website: z
    .string()
    .trim()
    .max(300)
    .transform((v) => (v && !/^https?:\/\//i.test(v) ? `https://${v}` : v))
    .pipe(z.union([z.literal(""), z.url({ protocol: /^https?$/ })])),
  languages: z.array(locale).min(1).max(2),
});
export type AuditInput = z.infer<typeof auditInput>;

export const unlockInput = z
  .object({
    name: optionalText,
    email: z
      .union([z.literal(""), z.email()])
      .optional()
      .default(""),
    whatsapp: z.string().trim().max(30).optional().default(""),
  })
  .refine((v) => v.email || v.whatsapp.replace(/\D/g, "").length >= 7, {
    message: "Email or WhatsApp number is required",
  });

export const inquiryInput = z.object({
  name: z.string().trim().min(1).max(120),
  country: z.string().trim().min(2).max(80),
  dates: z.string().trim().min(2).max(120),
  treatment: z.string().trim().min(2).max(120),
  lang: locale,
});

export const feedbackInput = z.object({
  message: z.string().trim().min(2).max(2000),
  contact: optionalText,
  staff: z.string().trim().max(40).optional().default(""),
  lang: locale,
});

export const eventInput = z.object({
  businessSlug: z.string().max(80),
  type: z.enum(EVENT_TYPES),
  lang: z.string().max(5).optional(),
  currency: z.string().max(3).optional(),
  staff: z.string().max(40).optional(),
  path: z.string().max(300).optional(),
});

export const magicLinkInput = z.object({ email: z.email() });
export const demoSignInInput = z.object({
  account: z.string().max(60),
  code: z.string().max(200).optional(),
});

export const itemInput = z.object({
  categoryId: z.string(),
  sku: z.string().max(40).nullable().optional(),
  name: localized,
  description: localized,
  priceKurus: z.number().int().min(0).max(1_000_000_000).nullable(),
  priceFrom: z.boolean().default(false),
  durationMin: z.number().int().min(0).max(100_000).nullable().optional(),
  soldOut: z.boolean().default(false),
  dietary: z.array(z.enum(DIETARY)).default([]),
  allergens: z.array(z.enum(ALLERGENS)).default([]),
  fabric: z.string().max(120).nullable().optional(),
  sizes: z.array(z.string().max(20)).default([]),
  moq: z.number().int().min(0).nullable().optional(),
});
export const itemPatch = itemInput.partial();

export const categoryInput = z.object({ name: localized });
export const reorderInput = z.object({ ids: z.array(z.string()).max(500) });

export const businessPatch = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  tagline: localized.optional(),
  description: localized.optional(),
  howToFindUs: localized.optional(),
  phone: z.string().max(30).optional(),
  whatsapp: z.string().max(30).optional(),
  email: z.email().optional(),
  website: z.string().max(300).nullable().optional(),
});

export const faqInput = z.object({
  question: localized,
  answer: localized,
  packageId: z.string().nullable().optional(),
});

export const packageStepInput = z.object({
  stage: z.enum(STAGES),
  owner: z.enum(STEP_OWNERS),
  dayLabel: localized,
  title: localized,
  detail: localized,
});

export const packageInput = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9-]+$/),
  name: localized,
  summary: localized,
  procedureName: localized,
  priceFactors: localized,
  daysInIstanbul: z.number().int().min(1).max(60),
  visits: z.number().int().min(1).max(30),
  priceFromKurus: z.number().int().min(0),
  languages: z.array(z.string().max(5)).max(10),
  inclusions: z.array(z.object({ key: z.enum(INCLUSIONS), included: z.boolean() })),
  steps: z.array(packageStepInput).max(40),
  faqs: z.array(z.object({ question: localized, answer: localized })).max(20),
  published: z.boolean(),
});

export const draftReplyInput = z.object({ tone: z.enum(REPLY_TONES) });
export const approveReplyInput = z.object({ text: z.string().trim().min(2).max(4000) });
export const listingPatch = z.object({
  status: z.enum(LISTING_STATUSES).optional(),
  url: z.string().max(300).nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
});
export const translateInput = z.object({ text: z.string().max(4000), from: locale, to: locale });
