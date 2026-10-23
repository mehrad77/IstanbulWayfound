import type {
  Allergen,
  Dietary,
  InclusionKey,
  Locale,
  ProfileBundle,
  Stage,
  StepOwner,
  Vertical,
  Weekday,
} from "@wayfound/core";
import { and, asc, eq, inArray } from "drizzle-orm";
import type { Db } from "./index.ts";
import * as s from "./schema.ts";

/** entity -> entityId -> field -> lang -> value */
export type TranslationMap = Map<string, Record<string, Record<string, string>>>;

export async function loadTranslations(
  db: Db,
  entity: string,
  ids: string[],
): Promise<TranslationMap> {
  const map: TranslationMap = new Map();
  if (!ids.length) return map;
  // D1 caps bound parameters per query; chunk to stay well under it.
  for (let i = 0; i < ids.length; i += 80) {
    const rows = await db
      .select()
      .from(s.translations)
      .where(
        and(
          eq(s.translations.entity, entity),
          inArray(s.translations.entityId, ids.slice(i, i + 80)),
        ),
      );
    for (const r of rows) {
      const fields = map.get(r.entityId) ?? {};
      fields[r.field] ??= {};
      fields[r.field]![r.lang] = r.value;
      map.set(r.entityId, fields);
    }
  }
  return map;
}

/** Pick a field in the requested language, falling back to English, then Turkish. */
export function pick(map: TranslationMap, id: string, field: string, locale: Locale): string {
  const f = map.get(id)?.[field];
  return f?.[locale] ?? f?.en ?? f?.tr ?? "";
}

export function both(map: TranslationMap, id: string, field: string): { en: string; tr: string } {
  const f = map.get(id)?.[field];
  return { en: f?.en ?? "", tr: f?.tr ?? "" };
}

export async function findBusinessBySlug(db: Db, slug: string) {
  return db.query.businesses.findFirst({ where: eq(s.businesses.slug, slug) });
}

export interface LoadOptions {
  /** Include unpublished packages (console preview). */
  includeDrafts?: boolean;
  mediaBase?: string;
}

/** Load a Business Profile from D1, resolved into one language. */
export async function loadProfileBundle(
  db: Db,
  businessId: string,
  locale: Locale,
  opts: LoadOptions = {},
): Promise<ProfileBundle | null> {
  const biz = await db.query.businesses.findFirst({ where: eq(s.businesses.id, businessId) });
  if (!biz) return null;
  const [location, cats, its, faqRows, team, pkgs] = await Promise.all([
    db.query.locations.findFirst({
      where: and(eq(s.locations.businessId, biz.id), eq(s.locations.isPrimary, true)),
    }),
    db
      .select()
      .from(s.categories)
      .where(eq(s.categories.businessId, biz.id))
      .orderBy(asc(s.categories.position)),
    db.select().from(s.items).where(eq(s.items.businessId, biz.id)).orderBy(asc(s.items.position)),
    db.select().from(s.faqs).where(eq(s.faqs.businessId, biz.id)).orderBy(asc(s.faqs.position)),
    db
      .select()
      .from(s.teamMembers)
      .where(eq(s.teamMembers.businessId, biz.id))
      .orderBy(asc(s.teamMembers.position)),
    db
      .select()
      .from(s.packages)
      .where(eq(s.packages.businessId, biz.id))
      .orderBy(asc(s.packages.position)),
  ]);
  const visiblePkgs = opts.includeDrafts ? pkgs : pkgs.filter((p) => p.published);
  const steps = visiblePkgs.length
    ? await db
        .select()
        .from(s.packageSteps)
        .where(
          inArray(
            s.packageSteps.packageId,
            visiblePkgs.map((p) => p.id),
          ),
        )
        .orderBy(asc(s.packageSteps.position))
    : [];

  const [tBiz, tCat, tItem, tFaq, tTeam, tPkg, tStep] = await Promise.all([
    loadTranslations(db, "business", [biz.id]),
    loadTranslations(
      db,
      "category",
      cats.map((c) => c.id),
    ),
    loadTranslations(
      db,
      "item",
      its.map((i) => i.id),
    ),
    loadTranslations(
      db,
      "faq",
      faqRows.map((f) => f.id),
    ),
    loadTranslations(
      db,
      "team_member",
      team.map((t) => t.id),
    ),
    loadTranslations(
      db,
      "package",
      visiblePkgs.map((p) => p.id),
    ),
    loadTranslations(
      db,
      "package_step",
      steps.map((st) => st.id),
    ),
  ]);

  const media = (key: string | null) => (key && opts.mediaBase ? `${opts.mediaBase}/${key}` : null);
  const latest = [biz.updatedAt, ...its.map((i) => i.updatedAt), ...pkgs.map((p) => p.updatedAt)]
    .sort()
    .at(-1)!;

  return {
    locale,
    business: {
      id: biz.id,
      slug: biz.slug,
      vertical: biz.vertical as Vertical,
      schemaType: biz.schemaType,
      name: biz.name,
      tagline: pick(tBiz, biz.id, "tagline", locale),
      description: pick(tBiz, biz.id, "description", locale),
      howToFindUs: pick(tBiz, biz.id, "howToFindUs", locale),
      phone: biz.phone,
      whatsapp: biz.whatsapp,
      email: biz.email,
      website: biz.website,
      languages: biz.languages,
      priceRange: biz.priceRange,
      rating:
        biz.ratingValue && biz.ratingCount
          ? { value: biz.ratingValue, count: biz.ratingCount }
          : null,
      reviewLinks: biz.reviewLinks,
      wayfindingVideoUrl: biz.wayfindingVideoUrl,
      logoUrl: media(biz.logoKey),
      isDemo: biz.isDemo,
      updatedAt: latest,
    },
    location: location
      ? {
          street: location.street,
          district: location.district,
          city: location.city,
          postalCode: location.postalCode,
          country: location.country,
          lat: location.lat,
          lng: location.lng,
          hours: location.hours.map((h) => ({ ...h, days: h.days as Weekday[] })),
        }
      : {
          street: "",
          district: "",
          city: "İstanbul",
          postalCode: "",
          country: "TR",
          lat: 41.0082,
          lng: 28.9784,
          hours: [],
        },
    categories: cats.map((c) => ({
      id: c.id,
      name: pick(tCat, c.id, "name", locale),
      position: c.position,
      items: its
        .filter((i) => i.categoryId === c.id)
        .map((i) => ({
          id: i.id,
          categoryId: i.categoryId,
          sku: i.sku,
          name: pick(tItem, i.id, "name", locale),
          description: pick(tItem, i.id, "description", locale),
          priceKurus: i.priceKurus,
          priceFrom: i.priceFrom,
          durationMin: i.durationMin,
          soldOut: i.soldOut,
          photoUrl: media(i.photoKey),
          dietary: i.dietary as Dietary[],
          allergens: i.allergens as Allergen[],
          fabric: i.fabric,
          sizes: i.sizes,
          moq: i.moq,
          position: i.position,
          updatedAt: i.updatedAt,
        })),
    })),
    faqs: faqRows
      .filter((f) => !f.packageId)
      .map((f) => ({
        id: f.id,
        question: pick(tFaq, f.id, "question", locale),
        answer: pick(tFaq, f.id, "answer", locale),
      })),
    team: team.map((t) => ({
      id: t.id,
      name: t.name,
      title: pick(tTeam, t.id, "title", locale),
      credentials: pick(tTeam, t.id, "credentials", locale),
      languages: t.languages,
    })),
    packages: visiblePkgs.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: pick(tPkg, p.id, "name", locale),
      summary: pick(tPkg, p.id, "summary", locale),
      procedureName: pick(tPkg, p.id, "procedureName", locale),
      priceFactors: pick(tPkg, p.id, "priceFactors", locale),
      daysInIstanbul: p.daysInIstanbul,
      visits: p.visits,
      priceFromKurus: p.priceFromKurus,
      languages: p.languages,
      inclusions: p.inclusions as { key: InclusionKey; included: boolean }[],
      steps: steps
        .filter((st) => st.packageId === p.id)
        .map((st) => ({
          id: st.id,
          stage: st.stage as Stage,
          owner: st.owner as StepOwner,
          dayLabel: pick(tStep, st.id, "dayLabel", locale),
          title: pick(tStep, st.id, "title", locale),
          detail: pick(tStep, st.id, "detail", locale),
          position: st.position,
        })),
      faqs: faqRows
        .filter((f) => f.packageId === p.id)
        .map((f) => ({
          id: f.id,
          question: pick(tFaq, f.id, "question", locale),
          answer: pick(tFaq, f.id, "answer", locale),
        })),
      published: p.published,
      position: p.position,
    })),
  };
}

/** Write (upsert) one translated field in both languages. */
export async function saveTranslations(
  db: Db,
  entity: string,
  entityId: string,
  fields: Record<string, { en: string; tr: string } | undefined>,
) {
  const rows = Object.entries(fields).flatMap(([field, value]) =>
    value
      ? (["en", "tr"] as const).map((lang) => ({
          entity,
          entityId,
          field,
          lang,
          value: value[lang],
          reviewed: true,
        }))
      : [],
  );
  for (const row of rows) {
    await db
      .insert(s.translations)
      .values(row)
      .onConflictDoUpdate({
        target: [
          s.translations.entity,
          s.translations.entityId,
          s.translations.field,
          s.translations.lang,
        ],
        set: { value: row.value, reviewed: row.reviewed },
      });
  }
}
