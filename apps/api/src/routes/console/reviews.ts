import { zValidator } from "@hono/zod-validator";
import { checkReplyRules, MockAiProvider, validators } from "@wayfound/core";
import { createDb, schema as s } from "@wayfound/db";
import { and, desc, eq, gte } from "drizzle-orm";
import { Hono } from "hono";
import type { AppEnv } from "../../env.ts";
import { assertBusinessAccess } from "../../lib/auth.ts";
import { newId, nowIso } from "../../lib/util.ts";

const ai = new MockAiProvider();

function median(values: number[]): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2;
}

export const reviews = new Hono<AppEnv>()
  .use("/:bid/*", async (c, next) => {
    assertBusinessAccess(c, c.req.param("bid"));
    await next();
  })
  .get("/:bid/reviews", async (c) => {
    const db = createDb(c.env.DB);
    const bid = c.req.param("bid");
    const rows = await db
      .select()
      .from(s.reviews)
      .where(eq(s.reviews.businessId, bid))
      .orderBy(desc(s.reviews.postedAt));
    const drafts = rows.length
      ? await db.select().from(s.replyDrafts).orderBy(desc(s.replyDrafts.createdAt))
      : [];
    const latestDraft = new Map<string, (typeof drafts)[number]>();
    for (const d of drafts) if (!latestDraft.has(d.reviewId)) latestDraft.set(d.reviewId, d);

    const since = new Date(Date.now() - 28 * 86_400_000).toISOString();
    const recent = rows.filter((r) => r.postedAt >= since);
    const replied = rows.filter((r) => r.status === "replied" && r.repliedAt);
    const replyHours = replied.map(
      (r) => (Date.parse(r.repliedAt!) - Date.parse(r.postedAt)) / 3_600_000,
    );
    return c.json({
      reviews: rows.map((r) => ({ ...r, draft: latestDraft.get(r.id) ?? null })),
      metrics: {
        average: rows.length ? rows.reduce((a, r) => a + r.rating, 0) / rows.length : null,
        count: rows.length,
        perWeek: recent.length / 4,
        replyRate: rows.length ? replied.length / rows.length : 0,
        medianReplyHours: median(replyHours),
      },
    });
  })
  .post("/:bid/reviews/:rid/draft", zValidator("json", validators.draftReplyInput), async (c) => {
    const db = createDb(c.env.DB);
    const bid = c.req.param("bid");
    const review = await db.query.reviews.findFirst({
      where: and(eq(s.reviews.id, c.req.param("rid")), eq(s.reviews.businessId, bid)),
    });
    const biz = await db.query.businesses.findFirst({ where: eq(s.businesses.id, bid) });
    if (!review || !biz) return c.json({ error: "Not found" }, 404);
    const { tone } = c.req.valid("json");
    const lang = review.lang === "tr" ? "tr" : "en";
    const text = await ai.draftReply({
      review: { author: review.author, rating: review.rating, lang, text: review.text },
      business: {
        name: biz.name,
        vertical: biz.vertical,
        email: biz.email,
        whatsapp: biz.whatsapp,
      },
      tone,
    });
    const violations = checkReplyRules(text, {
      vertical: biz.vertical,
      email: biz.email,
      whatsapp: biz.whatsapp,
    });
    const draft = {
      id: newId("drf"),
      reviewId: review.id,
      tone,
      text,
      provider: ai.name,
      violations,
      createdAt: nowIso(),
    };
    await db.insert(s.replyDrafts).values(draft);
    if (review.status === "new")
      await db.update(s.reviews).set({ status: "drafted" }).where(eq(s.reviews.id, review.id));
    return c.json({ draft, replyLang: lang, fallbackLang: lang !== review.lang });
  })
  .post("/:bid/reviews/:rid/check", zValidator("json", validators.approveReplyInput), async (c) => {
    const db = createDb(c.env.DB);
    const biz = await db.query.businesses.findFirst({
      where: eq(s.businesses.id, c.req.param("bid")),
    });
    if (!biz) return c.json({ error: "Not found" }, 404);
    return c.json({ violations: checkReplyRules(c.req.valid("json").text, biz) });
  })
  .post("/:bid/reviews/:rid/reply", zValidator("json", validators.approveReplyInput), async (c) => {
    const db = createDb(c.env.DB);
    const bid = c.req.param("bid");
    const biz = await db.query.businesses.findFirst({ where: eq(s.businesses.id, bid) });
    if (!biz) return c.json({ error: "Not found" }, 404);
    const { text } = c.req.valid("json");
    const violations = checkReplyRules(text, biz);
    if (violations.length) return c.json({ error: "Reply breaks the rules", violations }, 422);
    await db
      .update(s.reviews)
      .set({ status: "replied", replyText: text, repliedAt: nowIso() })
      .where(and(eq(s.reviews.id, c.req.param("rid")), eq(s.reviews.businessId, bid)));
    return c.json({ ok: true });
  })
  .get("/:bid/reviews-since", async (c) => {
    const db = createDb(c.env.DB);
    const since = c.req.query("since") ?? new Date(0).toISOString();
    const rows = await db
      .select()
      .from(s.reviews)
      .where(and(eq(s.reviews.businessId, c.req.param("bid")), gte(s.reviews.postedAt, since)));
    return c.json({ count: rows.length });
  });
