import { sql } from "drizzle-orm";
import {
  index,
  integer,
  primaryKey,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

const now = sql`(strftime('%Y-%m-%dT%H:%M:%fZ','now'))`;
const createdAt = () => text("created_at").notNull().default(now);
const updatedAt = () => text("updated_at").notNull().default(now);
const json = <T>(name: string) => text(name, { mode: "json" }).$type<T>();

/**
 * Text that a visitor reads lives in `translations`, one row per field and language.
 * Columns here hold only language-neutral facts.
 */
export const businesses = sqliteTable("businesses", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  vertical: text("vertical", { enum: ["dining", "retail", "clinic"] }).notNull(),
  schemaType: text("schema_type").notNull(),
  name: text("name").notNull(),
  phone: text("phone").notNull().default(""),
  whatsapp: text("whatsapp").notNull().default(""),
  email: text("email").notNull().default(""),
  website: text("website"),
  languages: json<string[]>("languages").notNull().default(sql`'[]'`),
  priceRange: text("price_range"),
  ratingValue: real("rating_value"),
  ratingCount: integer("rating_count"),
  reviewLinks: json<Record<string, string>>("review_links").notNull().default(sql`'{}'`),
  wayfindingVideoUrl: text("wayfinding_video_url"),
  logoKey: text("logo_key"),
  isDemo: integer("is_demo", { mode: "boolean" }).notNull().default(false),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const locations = sqliteTable("locations", {
  id: text("id").primaryKey(),
  businessId: text("business_id")
    .notNull()
    .references(() => businesses.id, { onDelete: "cascade" }),
  street: text("street").notNull(),
  district: text("district").notNull(),
  city: text("city").notNull().default("İstanbul"),
  postalCode: text("postal_code").notNull().default(""),
  country: text("country").notNull().default("TR"),
  lat: real("lat").notNull(),
  lng: real("lng").notNull(),
  hours: json<{ days: string[]; opens: string; closes: string }[]>("hours")
    .notNull()
    .default(sql`'[]'`),
  isPrimary: integer("is_primary", { mode: "boolean" }).notNull().default(true),
});

export const categories = sqliteTable(
  "categories",
  {
    id: text("id").primaryKey(),
    businessId: text("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    position: integer("position").notNull().default(0),
  },
  (t) => [index("categories_business_idx").on(t.businessId)],
);

export const items = sqliteTable(
  "items",
  {
    id: text("id").primaryKey(),
    businessId: text("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    categoryId: text("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
    position: integer("position").notNull().default(0),
    sku: text("sku"),
    priceKurus: integer("price_kurus"),
    priceFrom: integer("price_from", { mode: "boolean" }).notNull().default(false),
    durationMin: integer("duration_min"),
    soldOut: integer("sold_out", { mode: "boolean" }).notNull().default(false),
    photoKey: text("photo_key"),
    dietary: json<string[]>("dietary").notNull().default(sql`'[]'`),
    allergens: json<string[]>("allergens").notNull().default(sql`'[]'`),
    fabric: text("fabric"),
    sizes: json<string[]>("sizes").notNull().default(sql`'[]'`),
    moq: integer("moq"),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("items_business_idx").on(t.businessId),
    index("items_category_idx").on(t.categoryId),
  ],
);

export const packages = sqliteTable(
  "packages",
  {
    id: text("id").primaryKey(),
    businessId: text("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    position: integer("position").notNull().default(0),
    daysInIstanbul: integer("days_in_istanbul").notNull(),
    visits: integer("visits").notNull(),
    priceFromKurus: integer("price_from_kurus").notNull(),
    languages: json<string[]>("languages").notNull().default(sql`'[]'`),
    inclusions: json<{ key: string; included: boolean }[]>("inclusions")
      .notNull()
      .default(sql`'[]'`),
    published: integer("published", { mode: "boolean" }).notNull().default(false),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("packages_business_slug_idx").on(t.businessId, t.slug)],
);

export const packageSteps = sqliteTable(
  "package_steps",
  {
    id: text("id").primaryKey(),
    packageId: text("package_id")
      .notNull()
      .references(() => packages.id, { onDelete: "cascade" }),
    stage: text("stage", { enum: ["before", "arrival", "treatment", "aftercare"] }).notNull(),
    owner: text("owner", { enum: ["patient", "clinic", "coordinator"] }).notNull(),
    position: integer("position").notNull().default(0),
  },
  (t) => [index("package_steps_package_idx").on(t.packageId)],
);

export const faqs = sqliteTable(
  "faqs",
  {
    id: text("id").primaryKey(),
    businessId: text("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    packageId: text("package_id").references(() => packages.id, { onDelete: "cascade" }),
    position: integer("position").notNull().default(0),
  },
  (t) => [index("faqs_business_idx").on(t.businessId)],
);

export const teamMembers = sqliteTable("team_members", {
  id: text("id").primaryKey(),
  businessId: text("business_id")
    .notNull()
    .references(() => businesses.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  languages: json<string[]>("languages").notNull().default(sql`'[]'`),
  position: integer("position").notNull().default(0),
});

export const media = sqliteTable("media", {
  id: text("id").primaryKey(),
  businessId: text("business_id")
    .notNull()
    .references(() => businesses.id, { onDelete: "cascade" }),
  key: text("key").notNull().unique(),
  kind: text("kind").notNull().default("photo"),
  contentType: text("content_type").notNull(),
  bytes: integer("bytes").notNull().default(0),
  createdAt: createdAt(),
});

/** One row per (entity, field, language). Adding a language adds rows, not columns. */
export const translations = sqliteTable(
  "translations",
  {
    entity: text("entity").notNull(),
    entityId: text("entity_id").notNull(),
    field: text("field").notNull(),
    lang: text("lang").notNull(),
    value: text("value").notNull(),
    reviewed: integer("reviewed", { mode: "boolean" }).notNull().default(true),
  },
  (t) => [
    primaryKey({ columns: [t.entity, t.entityId, t.field, t.lang] }),
    index("translations_entity_idx").on(t.entity, t.entityId),
  ],
);

export const reviews = sqliteTable(
  "reviews",
  {
    id: text("id").primaryKey(),
    businessId: text("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    platform: text("platform").notNull(),
    author: text("author").notNull(),
    rating: integer("rating").notNull(),
    lang: text("lang").notNull(),
    text: text("text").notNull(),
    topics: json<string[]>("topics").notNull().default(sql`'[]'`),
    postedAt: text("posted_at").notNull(),
    status: text("status", { enum: ["new", "drafted", "replied"] })
      .notNull()
      .default("new"),
    replyText: text("reply_text"),
    repliedAt: text("replied_at"),
  },
  (t) => [index("reviews_business_idx").on(t.businessId, t.postedAt)],
);

export const replyDrafts = sqliteTable("reply_drafts", {
  id: text("id").primaryKey(),
  reviewId: text("review_id")
    .notNull()
    .references(() => reviews.id, { onDelete: "cascade" }),
  tone: text("tone").notNull(),
  text: text("text").notNull(),
  provider: text("provider").notNull(),
  violations: json<string[]>("violations").notNull().default(sql`'[]'`),
  createdAt: createdAt(),
});

export const reviewFeedback = sqliteTable("review_feedback", {
  id: text("id").primaryKey(),
  businessId: text("business_id")
    .notNull()
    .references(() => businesses.id, { onDelete: "cascade" }),
  staff: text("staff"),
  message: text("message").notNull(),
  contact: text("contact"),
  lang: text("lang").notNull(),
  createdAt: createdAt(),
});

export const templates = sqliteTable("templates", {
  id: text("id").primaryKey(),
  key: text("key").notNull(),
  category: text("category").notNull(),
  vertical: text("vertical"),
  lang: text("lang").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  position: integer("position").notNull().default(0),
});

export const listings = sqliteTable(
  "listings",
  {
    id: text("id").primaryKey(),
    businessId: text("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    platform: text("platform").notNull(),
    status: text("status", { enum: ["missing", "in_progress", "claimed", "live"] })
      .notNull()
      .default("missing"),
    url: text("url"),
    notes: text("notes"),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("listings_business_platform_idx").on(t.businessId, t.platform)],
);

export const leads = sqliteTable("leads", {
  id: text("id").primaryKey(),
  kind: text("kind", { enum: ["audit", "inquiry", "contact"] }).notNull(),
  businessId: text("business_id").references(() => businesses.id, { onDelete: "set null" }),
  name: text("name"),
  email: text("email"),
  whatsapp: text("whatsapp"),
  country: text("country"),
  lang: text("lang"),
  payload: json<Record<string, unknown>>("payload").notNull().default(sql`'{}'`),
  status: text("status", { enum: ["new", "contacted", "won", "lost"] })
    .notNull()
    .default("new"),
  createdAt: createdAt(),
});

export const audits = sqliteTable("audits", {
  id: text("id").primaryKey(),
  businessName: text("business_name").notNull(),
  vertical: text("vertical").notNull(),
  district: text("district").notNull(),
  website: text("website"),
  languages: json<string[]>("languages").notNull(),
  matchedBusinessId: text("matched_business_id").references(() => businesses.id, {
    onDelete: "set null",
  }),
  score: integer("score").notNull(),
  visibility: integer("visibility").notNull(),
  websiteScore: integer("website_score").notNull(),
  signals: json<Record<string, unknown>>("signals").notNull(),
  analysis: json<Record<string, unknown>>("analysis").notNull(),
  leadId: text("lead_id").references(() => leads.id, { onDelete: "set null" }),
  createdAt: createdAt(),
});

export const auditResults = sqliteTable(
  "audit_results",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    auditId: text("audit_id")
      .notNull()
      .references(() => audits.id, { onDelete: "cascade" }),
    templateId: text("template_id").notNull(),
    prompt: text("prompt").notNull(),
    lang: text("lang").notNull(),
    engine: text("engine").notNull(),
    outcome: text("outcome", { enum: ["linked", "mentioned", "absent"] }).notNull(),
    /** `seeded` and `sample` are never shown without the "Sample report" label. */
    source: text("source", { enum: ["seeded", "sample", "live"] }).notNull(),
    recommended: json<string[]>("recommended").notNull(),
    cited: json<string[]>("cited").notNull(),
  },
  (t) => [index("audit_results_audit_idx").on(t.auditId)],
);

/** Fixed engine answers for the demo businesses, keyed by prompt template id. */
export const auditFixtures = sqliteTable("audit_fixtures", {
  businessId: text("business_id")
    .primaryKey()
    .references(() => businesses.id, { onDelete: "cascade" }),
  matrix: json<Record<string, string>>("matrix").notNull(),
  competitors: json<string[]>("competitors").notNull(),
  sources: json<string[]>("sources").notNull(),
});

export const events = sqliteTable(
  "events",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    businessId: text("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    lang: text("lang"),
    currency: text("currency"),
    staff: text("staff"),
    path: text("path"),
    createdAt: createdAt(),
  },
  (t) => [index("events_business_idx").on(t.businessId, t.type, t.createdAt)],
);

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: text("role", { enum: ["owner", "agency"] }).notNull(),
  demoAccount: text("demo_account").unique(),
  createdAt: createdAt(),
});

export const memberships = sqliteTable(
  "memberships",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    businessId: text("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.userId, t.businessId] })],
);

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: text("expires_at").notNull(),
  createdAt: createdAt(),
});

export const magicLinks = sqliteTable("magic_links", {
  tokenHash: text("token_hash").primaryKey(),
  email: text("email").notNull(),
  expiresAt: text("expires_at").notNull(),
  usedAt: text("used_at"),
});
