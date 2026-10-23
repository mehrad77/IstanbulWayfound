import { hashString, prng } from "@wayfound/core";
import { businessSeeds } from "./index.ts";
import { agencyUser, templateSeeds } from "./templates.ts";
import type { BusinessSeed } from "./types.ts";

type Value = string | number | boolean | null | undefined | object;

function lit(v: Value): string {
  if (v === null || v === undefined) return "NULL";
  if (typeof v === "boolean") return v ? "1" : "0";
  if (typeof v === "number") return Number.isFinite(v) ? String(v) : "NULL";
  if (typeof v === "object") return lit(JSON.stringify(v));
  return `'${v.replaceAll("'", "''")}'`;
}

function insert(table: string, row: Record<string, Value>): string {
  const cols = Object.keys(row);
  return `INSERT INTO ${table} (${cols.join(", ")}) VALUES (${cols.map((c) => lit(row[c])).join(", ")});`;
}

/** Children first, so foreign keys never block the wipe. */
export const RESET_ORDER = [
  "events",
  "audit_results",
  "audits",
  "leads",
  "reply_drafts",
  "reviews",
  "review_feedback",
  "listings",
  "translations",
  "package_steps",
  "faqs",
  "packages",
  "items",
  "categories",
  "team_members",
  "media",
  "locations",
  "audit_fixtures",
  "memberships",
  "sessions",
  "magic_links",
  "users",
  "templates",
  "businesses",
];

function tr(
  out: string[],
  entity: string,
  entityId: string,
  field: string,
  value: { en: string; tr: string },
) {
  for (const lang of ["en", "tr"] as const) {
    out.push(
      insert("translations", {
        entity,
        entity_id: entityId,
        field,
        lang,
        value: value[lang],
        reviewed: true,
      }),
    );
  }
}

function businessSql(b: BusinessSeed, now: Date, out: string[]) {
  const iso = now.toISOString();
  out.push(
    insert("businesses", {
      id: b.id,
      slug: b.slug,
      vertical: b.vertical,
      schema_type: b.schemaType,
      name: b.name,
      phone: b.phone,
      whatsapp: b.whatsapp,
      email: b.email,
      website: b.website,
      languages: b.languages,
      price_range: b.priceRange,
      rating_value: b.rating?.value,
      rating_count: b.rating?.count,
      review_links: b.reviewLinks,
      is_demo: true,
      created_at: iso,
      updated_at: iso,
    }),
  );
  tr(out, "business", b.id, "tagline", b.text.tagline);
  tr(out, "business", b.id, "description", b.text.description);
  tr(out, "business", b.id, "howToFindUs", b.text.howToFindUs);

  out.push(
    insert("locations", {
      id: `loc_${b.id}`,
      business_id: b.id,
      street: b.location.street,
      district: b.location.district,
      city: "İstanbul",
      postal_code: b.location.postalCode,
      country: "TR",
      lat: b.location.lat,
      lng: b.location.lng,
      hours: b.location.hours,
      is_primary: true,
    }),
  );

  b.categories.forEach((c, ci) => {
    out.push(insert("categories", { id: c.id, business_id: b.id, position: ci }));
    tr(out, "category", c.id, "name", c.name);
    c.items.forEach((i, ii) => {
      out.push(
        insert("items", {
          id: i.id,
          business_id: b.id,
          category_id: c.id,
          position: ii,
          sku: i.sku ?? null,
          price_kurus: i.priceKurus,
          price_from: i.priceFrom ?? false,
          duration_min: i.durationMin ?? null,
          sold_out: i.soldOut ?? false,
          dietary: i.dietary ?? [],
          allergens: i.allergens ?? [],
          fabric: i.fabric ?? null,
          sizes: i.sizes ?? [],
          moq: i.moq ?? null,
          updated_at: iso,
        }),
      );
      tr(out, "item", i.id, "name", i.name);
      tr(out, "item", i.id, "description", i.description);
    });
  });

  b.faqs.forEach((f, fi) => {
    out.push(insert("faqs", { id: f.id, business_id: b.id, package_id: null, position: fi }));
    tr(out, "faq", f.id, "question", f.question);
    tr(out, "faq", f.id, "answer", f.answer);
  });

  b.team.forEach((t, ti) => {
    out.push(
      insert("team_members", {
        id: t.id,
        business_id: b.id,
        name: t.name,
        languages: t.languages,
        position: ti,
      }),
    );
    tr(out, "team_member", t.id, "title", t.title);
    tr(out, "team_member", t.id, "credentials", t.credentials);
  });

  b.packages.forEach((p, pi) => {
    out.push(
      insert("packages", {
        id: p.id,
        business_id: b.id,
        slug: p.slug,
        position: pi,
        days_in_istanbul: p.daysInIstanbul,
        visits: p.visits,
        price_from_kurus: p.priceFromKurus,
        languages: p.languages,
        inclusions: p.inclusions,
        published: true,
        updated_at: iso,
      }),
    );
    tr(out, "package", p.id, "name", p.name);
    tr(out, "package", p.id, "summary", p.summary);
    tr(out, "package", p.id, "procedureName", p.procedureName);
    tr(out, "package", p.id, "priceFactors", p.priceFactors);
    p.steps.forEach((s, si) => {
      const id = `${p.id}_s${si + 1}`;
      out.push(
        insert("package_steps", {
          id,
          package_id: p.id,
          stage: s.stage,
          owner: s.owner,
          position: si,
        }),
      );
      tr(out, "package_step", id, "dayLabel", s.dayLabel);
      tr(out, "package_step", id, "title", s.title);
      tr(out, "package_step", id, "detail", s.detail);
    });
    p.faqs.forEach((f, fi) => {
      out.push(insert("faqs", { id: f.id, business_id: b.id, package_id: p.id, position: fi }));
      tr(out, "faq", f.id, "question", f.question);
      tr(out, "faq", f.id, "answer", f.answer);
    });
  });

  b.reviews.forEach((r, ri) => {
    const posted = new Date(now.getTime() - r.daysAgo * 86_400_000 - ri * 3_600_000);
    out.push(
      insert("reviews", {
        id: `rev_${b.id}_${String(ri + 1).padStart(2, "0")}`,
        business_id: b.id,
        platform: r.platform,
        author: r.author,
        rating: r.rating,
        lang: r.lang,
        text: r.text,
        topics: r.topics,
        posted_at: posted.toISOString(),
        status: r.replied ? "replied" : "new",
        reply_text: r.replied ?? null,
        replied_at: r.replied
          ? new Date(posted.getTime() + (6 + ri) * 3_600_000).toISOString()
          : null,
      }),
    );
  });

  for (const l of b.listings) {
    out.push(
      insert("listings", {
        id: `lst_${b.id}_${l.platform}`,
        business_id: b.id,
        platform: l.platform,
        status: l.status,
        notes: l.notes ?? null,
        updated_at: iso,
      }),
    );
  }

  out.push(
    insert("audit_fixtures", {
      business_id: b.id,
      matrix: b.auditFixture.matrix,
      competitors: b.auditFixture.competitors,
      sources: b.auditFixture.sources,
    }),
  );

  out.push(
    insert("users", {
      id: b.owner.id,
      email: b.owner.email,
      name: b.owner.name,
      role: "owner",
      demo_account: b.owner.demoAccount,
    }),
  );
  out.push(insert("memberships", { user_id: b.owner.id, business_id: b.id }));

  // Seeded demo traffic so the stats screens aren't empty on a fresh reset.
  const rand = prng(hashString(b.id));
  const langs = b.vertical === "retail" ? ["en", "en", "tr", "tr", "en"] : ["en", "en", "en", "tr"];
  const currencies = ["TRY", "EUR", "USD", "GBP", "EUR", "AED", "USD"];
  for (let d = 0; d < 30; d++) {
    const scans = 4 + Math.floor(rand() * 9);
    for (let s = 0; s < scans; s++) {
      const at = new Date(
        now.getTime() - d * 86_400_000 - Math.floor(rand() * 43_200_000),
      ).toISOString();
      const lang = langs[Math.floor(rand() * langs.length)]!;
      const currency = currencies[Math.floor(rand() * currencies.length)]!;
      out.push(
        insert("events", { business_id: b.id, type: "scan", lang, currency, created_at: at }),
      );
      if (rand() < 0.22)
        out.push(
          insert("events", {
            business_id: b.id,
            type: "whatsapp_click",
            lang,
            currency,
            created_at: at,
          }),
        );
      if (rand() < 0.08)
        out.push(
          insert("events", {
            business_id: b.id,
            type: "review_click",
            lang,
            staff: rand() < 0.5 ? "S1" : "S2",
            created_at: at,
          }),
        );
    }
  }
}

/** Full demo dataset as SQL: wipes every table, then inserts the three demo businesses. */
export function seedSql(now = new Date()): string {
  const out: string[] = ["-- Generated by @wayfound/db seed:sql. Do not edit by hand."];
  for (const table of RESET_ORDER) out.push(`DELETE FROM ${table};`);
  for (const b of businessSeeds) businessSql(b, now, out);
  out.push(
    insert("users", {
      id: agencyUser.id,
      email: agencyUser.email,
      name: agencyUser.name,
      role: "agency",
      demo_account: agencyUser.demoAccount,
    }),
  );
  templateSeeds.forEach((t, ti) => {
    for (const lang of ["en", "tr"] as const) {
      out.push(
        insert("templates", {
          id: `tpl_${t.key}_${lang}`,
          key: t.key,
          category: t.category,
          vertical: t.vertical,
          lang,
          title: t[lang].title,
          body: t[lang].body,
          position: ti,
        }),
      );
    }
  });
  return `${out.join("\n")}\n`;
}
