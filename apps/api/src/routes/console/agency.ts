import { zValidator } from "@hono/zod-validator";
import { validators } from "@wayfound/core";
import { createDb, schema as s } from "@wayfound/db";
import { and, desc, eq, inArray, isNull, or, sql } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import type { AppEnv } from "../../env.ts";
import { assertBusinessAccess, requireAgency } from "../../lib/auth.ts";
import { nowIso } from "../../lib/util.ts";

/** Leads: agency sees all; owners see inquiries for their own businesses. */
export const leads = new Hono<AppEnv>()
  .get("/", async (c) => {
    const user = c.get("user");
    const db = createDb(c.env.DB);
    const where =
      user.role === "agency"
        ? undefined
        : user.businessIds.length
          ? inArray(s.leads.businessId, user.businessIds)
          : sql`0`;
    const rows = await db
      .select()
      .from(s.leads)
      .where(where)
      .orderBy(desc(s.leads.createdAt))
      .limit(200);
    return c.json({ leads: rows });
  })
  .patch(
    "/:id",
    zValidator("json", z.object({ status: z.enum(["new", "contacted", "won", "lost"]) })),
    async (c) => {
      const user = c.get("user");
      const db = createDb(c.env.DB);
      const lead = await db.query.leads.findFirst({ where: eq(s.leads.id, c.req.param("id")) });
      if (!lead) return c.json({ error: "Not found" }, 404);
      if (
        user.role !== "agency" &&
        (!lead.businessId || !user.businessIds.includes(lead.businessId))
      ) {
        return c.json({ error: "Not found" }, 404);
      }
      await db
        .update(s.leads)
        .set({ status: c.req.valid("json").status })
        .where(eq(s.leads.id, lead.id));
      return c.json({ ok: true });
    },
  );

export const templates = new Hono<AppEnv>().get("/", async (c) => {
  const db = createDb(c.env.DB);
  const vertical = c.req.query("vertical");
  const rows = await db
    .select()
    .from(s.templates)
    .where(
      vertical ? or(isNull(s.templates.vertical), eq(s.templates.vertical, vertical)) : undefined,
    )
    .orderBy(s.templates.position, s.templates.lang);
  return c.json({ templates: rows });
});

export const listings = new Hono<AppEnv>()
  .get("/:bid/listings", async (c) => {
    assertBusinessAccess(c, c.req.param("bid"));
    const rows = await createDb(c.env.DB)
      .select()
      .from(s.listings)
      .where(eq(s.listings.businessId, c.req.param("bid")));
    return c.json({ listings: rows });
  })
  .patch(
    "/:bid/listings/:lid",
    requireAgency,
    zValidator("json", validators.listingPatch),
    async (c) => {
      const db = createDb(c.env.DB);
      await db
        .update(s.listings)
        .set({ ...c.req.valid("json"), updatedAt: nowIso() })
        .where(
          and(eq(s.listings.id, c.req.param("lid")), eq(s.listings.businessId, c.req.param("bid"))),
        );
      return c.json({ ok: true });
    },
  );

export const agency = new Hono<AppEnv>()
  .use(requireAgency)
  .get("/overview", async (c) => {
    const db = createDb(c.env.DB);
    const since = new Date(Date.now() - 7 * 86_400_000).toISOString();
    const [bizRows, leadRows, auditRows, listingRows, reviewRows, scanRows] = await Promise.all([
      db.select().from(s.businesses),
      db
        .select({ status: s.leads.status, kind: s.leads.kind, n: sql<number>`count(*)` })
        .from(s.leads)
        .groupBy(s.leads.status, s.leads.kind),
      db
        .select({ n: sql<number>`count(*)`, avg: sql<number>`avg(${s.audits.score})` })
        .from(s.audits),
      db.select().from(s.listings),
      db
        .select({
          businessId: s.reviews.businessId,
          avg: sql<number>`avg(${s.reviews.rating})`,
          n: sql<number>`count(*)`,
          open: sql<number>`sum(case when ${s.reviews.status} != 'replied' then 1 else 0 end)`,
        })
        .from(s.reviews)
        .groupBy(s.reviews.businessId),
      db
        .select({ businessId: s.events.businessId, n: sql<number>`count(*)` })
        .from(s.events)
        .where(and(eq(s.events.type, "scan"), sql`${s.events.createdAt} >= ${since}`))
        .groupBy(s.events.businessId),
    ]);
    return c.json({
      businesses: bizRows.map((b) => {
        const rev = reviewRows.find((r) => r.businessId === b.id);
        const lst = listingRows.filter((l) => l.businessId === b.id);
        return {
          id: b.id,
          name: b.name,
          slug: b.slug,
          vertical: b.vertical,
          rating: rev ? Number(rev.avg) : null,
          reviews: rev ? Number(rev.n) : 0,
          openReviews: rev ? Number(rev.open) : 0,
          scans7d: Number(scanRows.find((r) => r.businessId === b.id)?.n ?? 0),
          listingsLive: lst.filter((l) => l.status === "live").length,
          listingsTotal: lst.length,
        };
      }),
      leads: leadRows.map((r) => ({ status: r.status, kind: r.kind, n: Number(r.n) })),
      audits: {
        count: Number(auditRows[0]?.n ?? 0),
        averageScore: auditRows[0]?.avg ? Math.round(Number(auditRows[0].avg)) : null,
      },
    });
  })
  .get("/audits", async (c) => {
    const rows = await createDb(c.env.DB)
      .select({
        id: s.audits.id,
        businessName: s.audits.businessName,
        vertical: s.audits.vertical,
        district: s.audits.district,
        website: s.audits.website,
        score: s.audits.score,
        leadId: s.audits.leadId,
        matched: s.audits.matchedBusinessId,
        createdAt: s.audits.createdAt,
      })
      .from(s.audits)
      .orderBy(desc(s.audits.createdAt))
      .limit(200);
    return c.json({ audits: rows });
  });
