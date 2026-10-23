import { zValidator } from "@hono/zod-validator";
import { validators } from "@wayfound/core";
import { both, createDb, loadTranslations, schema as s, saveTranslations } from "@wayfound/db";
import { and, asc, desc, eq, gte, inArray, isNull, sql } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import type { AppEnv } from "../../env.ts";
import { assertBusinessAccess } from "../../lib/auth.ts";
import { newId, nowIso } from "../../lib/util.ts";

export const business = new Hono<AppEnv>()
  .get("/", async (c) => {
    const user = c.get("user");
    const db = createDb(c.env.DB);
    if (!user.businessIds.length) return c.json({ businesses: [] });
    const rows = await db
      .select()
      .from(s.businesses)
      .where(inArray(s.businesses.id, user.businessIds))
      .orderBy(asc(s.businesses.name));
    return c.json({
      businesses: rows.map((b) => ({
        id: b.id,
        slug: b.slug,
        name: b.name,
        vertical: b.vertical,
        isDemo: b.isDemo,
        updatedAt: b.updatedAt,
      })),
    });
  })
  .use("/:bid/*", async (c, next) => {
    assertBusinessAccess(c, c.req.param("bid"));
    await next();
  })
  .use("/:bid", async (c, next) => {
    assertBusinessAccess(c, c.req.param("bid"));
    await next();
  })
  .get("/:bid", async (c) => {
    const db = createDb(c.env.DB);
    const bid = c.req.param("bid");
    const biz = await db.query.businesses.findFirst({ where: eq(s.businesses.id, bid) });
    if (!biz) return c.json({ error: "Not found" }, 404);
    const location = await db.query.locations.findFirst({ where: eq(s.locations.businessId, bid) });
    const tr = await loadTranslations(db, "business", [bid]);
    return c.json({
      business: {
        ...biz,
        tagline: both(tr, bid, "tagline"),
        description: both(tr, bid, "description"),
        howToFindUs: both(tr, bid, "howToFindUs"),
      },
      location,
    });
  })
  .patch("/:bid", zValidator("json", validators.businessPatch), async (c) => {
    const db = createDb(c.env.DB);
    const bid = c.req.param("bid");
    const { tagline, description, howToFindUs, ...rest } = c.req.valid("json");
    await db
      .update(s.businesses)
      .set({ ...rest, updatedAt: nowIso() })
      .where(eq(s.businesses.id, bid));
    await saveTranslations(db, "business", bid, { tagline, description, howToFindUs });
    return c.json({ ok: true });
  })
  .get("/:bid/faqs", async (c) => {
    const db = createDb(c.env.DB);
    const bid = c.req.param("bid");
    const rows = await db
      .select()
      .from(s.faqs)
      .where(and(eq(s.faqs.businessId, bid), isNull(s.faqs.packageId)))
      .orderBy(asc(s.faqs.position));
    const tr = await loadTranslations(
      db,
      "faq",
      rows.map((r) => r.id),
    );
    return c.json({
      faqs: rows.map((r) => ({
        id: r.id,
        question: both(tr, r.id, "question"),
        answer: both(tr, r.id, "answer"),
      })),
    });
  })
  .put(
    "/:bid/faqs",
    zValidator(
      "json",
      z.object({
        faqs: z.array(validators.faqInput.extend({ id: z.string().optional() })).max(30),
      }),
    ),
    async (c) => {
      const db = createDb(c.env.DB);
      const bid = c.req.param("bid");
      const { faqs } = c.req.valid("json");
      await db.delete(s.faqs).where(and(eq(s.faqs.businessId, bid), isNull(s.faqs.packageId)));
      for (const [position, f] of faqs.entries()) {
        const id = f.id ?? newId("faq");
        await db.insert(s.faqs).values({ id, businessId: bid, packageId: null, position });
        await saveTranslations(db, "faq", id, { question: f.question, answer: f.answer });
      }
      await db.update(s.businesses).set({ updatedAt: nowIso() }).where(eq(s.businesses.id, bid));
      return c.json({ ok: true });
    },
  )
  .get("/:bid/stats", async (c) => {
    const db = createDb(c.env.DB);
    const bid = c.req.param("bid");
    const days = Math.min(90, Math.max(1, Number(c.req.query("days") ?? 30)));
    const since = new Date(Date.now() - days * 86_400_000).toISOString();
    const where = and(eq(s.events.businessId, bid), gte(s.events.createdAt, since));
    const [byType, byLang, byCurrency, byDay, byStaff] = await Promise.all([
      db
        .select({ key: s.events.type, n: sql<number>`count(*)` })
        .from(s.events)
        .where(where)
        .groupBy(s.events.type),
      db
        .select({ key: s.events.lang, n: sql<number>`count(*)` })
        .from(s.events)
        .where(and(where, eq(s.events.type, "scan")))
        .groupBy(s.events.lang),
      db
        .select({ key: s.events.currency, n: sql<number>`count(*)` })
        .from(s.events)
        .where(and(where, eq(s.events.type, "scan")))
        .groupBy(s.events.currency),
      db
        .select({
          key: sql<string>`substr(${s.events.createdAt}, 1, 10)`,
          n: sql<number>`count(*)`,
        })
        .from(s.events)
        .where(and(where, eq(s.events.type, "scan")))
        .groupBy(sql`substr(${s.events.createdAt}, 1, 10)`)
        .orderBy(sql`substr(${s.events.createdAt}, 1, 10)`),
      db
        .select({ key: s.events.staff, n: sql<number>`count(*)` })
        .from(s.events)
        .where(and(where, eq(s.events.type, "review_click")))
        .groupBy(s.events.staff),
    ]);
    const counts = Object.fromEntries(byType.map((r) => [r.key, Number(r.n)]));
    return c.json({
      days,
      totals: {
        scans: counts.scan ?? 0,
        whatsappClicks: counts.whatsapp_click ?? 0,
        reviewClicks: counts.review_click ?? 0,
        inquiries: counts.inquiry ?? 0,
        calls: counts.call_click ?? 0,
        directions: counts.directions_click ?? 0,
      },
      languages: byLang.map((r) => ({ key: r.key ?? "unknown", n: Number(r.n) })),
      currencies: byCurrency.map((r) => ({ key: r.key ?? "TRY", n: Number(r.n) })),
      daily: byDay.map((r) => ({ day: r.key, n: Number(r.n) })),
      staff: byStaff.map((r) => ({ key: r.key ?? "none", n: Number(r.n) })),
    });
  })
  .get("/:bid/feedback", async (c) => {
    const db = createDb(c.env.DB);
    const rows = await db
      .select()
      .from(s.reviewFeedback)
      .where(eq(s.reviewFeedback.businessId, c.req.param("bid")))
      .orderBy(desc(s.reviewFeedback.createdAt))
      .limit(100);
    return c.json({ feedback: rows });
  });
