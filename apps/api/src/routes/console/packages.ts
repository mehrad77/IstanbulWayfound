import { zValidator } from "@hono/zod-validator";
import { validators } from "@wayfound/core";
import { both, createDb, loadTranslations, schema as s, saveTranslations } from "@wayfound/db";
import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { Hono } from "hono";
import type { z } from "zod";
import type { AppEnv } from "../../env.ts";
import { assertBusinessAccess } from "../../lib/auth.ts";
import { newId, nowIso, randomToken } from "../../lib/util.ts";

type PackageInput = z.infer<typeof validators.packageInput>;

async function loadEditable(db: ReturnType<typeof createDb>, bid: string, pid: string) {
  const pkg = await db.query.packages.findFirst({
    where: and(eq(s.packages.id, pid), eq(s.packages.businessId, bid)),
  });
  if (!pkg) return null;
  const [steps, faqs] = await Promise.all([
    db
      .select()
      .from(s.packageSteps)
      .where(eq(s.packageSteps.packageId, pid))
      .orderBy(asc(s.packageSteps.position)),
    db.select().from(s.faqs).where(eq(s.faqs.packageId, pid)).orderBy(asc(s.faqs.position)),
  ]);
  const [tp, ts, tf] = await Promise.all([
    loadTranslations(db, "package", [pid]),
    loadTranslations(
      db,
      "package_step",
      steps.map((x) => x.id),
    ),
    loadTranslations(
      db,
      "faq",
      faqs.map((x) => x.id),
    ),
  ]);
  return {
    id: pkg.id,
    slug: pkg.slug,
    published: pkg.published,
    daysInIstanbul: pkg.daysInIstanbul,
    visits: pkg.visits,
    priceFromKurus: pkg.priceFromKurus,
    languages: pkg.languages,
    inclusions: pkg.inclusions,
    updatedAt: pkg.updatedAt,
    name: both(tp, pid, "name"),
    summary: both(tp, pid, "summary"),
    procedureName: both(tp, pid, "procedureName"),
    priceFactors: both(tp, pid, "priceFactors"),
    steps: steps.map((st) => ({
      id: st.id,
      stage: st.stage,
      owner: st.owner,
      dayLabel: both(ts, st.id, "dayLabel"),
      title: both(ts, st.id, "title"),
      detail: both(ts, st.id, "detail"),
    })),
    faqs: faqs.map((f) => ({
      id: f.id,
      question: both(tf, f.id, "question"),
      answer: both(tf, f.id, "answer"),
    })),
  };
}

async function writePackage(
  db: ReturnType<typeof createDb>,
  bid: string,
  pid: string,
  input: PackageInput,
) {
  const updatedAt = nowIso();
  await db
    .update(s.packages)
    .set({
      slug: input.slug,
      daysInIstanbul: input.daysInIstanbul,
      visits: input.visits,
      priceFromKurus: input.priceFromKurus,
      languages: input.languages,
      inclusions: input.inclusions,
      published: input.published,
      updatedAt,
    })
    .where(and(eq(s.packages.id, pid), eq(s.packages.businessId, bid)));
  await saveTranslations(db, "package", pid, {
    name: input.name,
    summary: input.summary,
    procedureName: input.procedureName,
    priceFactors: input.priceFactors,
  });
  // Steps and FAQs are replaced wholesale: simpler than diffing, and the builder always sends the full list.
  const oldSteps = await db
    .select({ id: s.packageSteps.id })
    .from(s.packageSteps)
    .where(eq(s.packageSteps.packageId, pid));
  const oldFaqs = await db.select({ id: s.faqs.id }).from(s.faqs).where(eq(s.faqs.packageId, pid));
  const oldIds = [...oldSteps, ...oldFaqs].map((r) => r.id);
  if (oldIds.length)
    await db.delete(s.translations).where(inArray(s.translations.entityId, oldIds));
  await db.delete(s.packageSteps).where(eq(s.packageSteps.packageId, pid));
  await db.delete(s.faqs).where(eq(s.faqs.packageId, pid));
  for (const [position, step] of input.steps.entries()) {
    const id = newId("step");
    await db
      .insert(s.packageSteps)
      .values({ id, packageId: pid, stage: step.stage, owner: step.owner, position });
    await saveTranslations(db, "package_step", id, {
      dayLabel: step.dayLabel,
      title: step.title,
      detail: step.detail,
    });
  }
  for (const [position, f] of input.faqs.entries()) {
    const id = newId("faq");
    await db.insert(s.faqs).values({ id, businessId: bid, packageId: pid, position });
    await saveTranslations(db, "faq", id, { question: f.question, answer: f.answer });
  }
  await db.update(s.businesses).set({ updatedAt }).where(eq(s.businesses.id, bid));
}

export const packages = new Hono<AppEnv>()
  .use("/:bid/*", async (c, next) => {
    assertBusinessAccess(c, c.req.param("bid"));
    await next();
  })
  .get("/:bid/packages", async (c) => {
    const db = createDb(c.env.DB);
    const bid = c.req.param("bid");
    const rows = await db
      .select()
      .from(s.packages)
      .where(eq(s.packages.businessId, bid))
      .orderBy(asc(s.packages.position));
    const tr = await loadTranslations(
      db,
      "package",
      rows.map((r) => r.id),
    );
    return c.json({
      packages: rows.map((p) => ({
        id: p.id,
        slug: p.slug,
        published: p.published,
        name: both(tr, p.id, "name"),
        daysInIstanbul: p.daysInIstanbul,
        priceFromKurus: p.priceFromKurus,
        updatedAt: p.updatedAt,
      })),
    });
  })
  .post("/:bid/packages", zValidator("json", validators.packageInput), async (c) => {
    const db = createDb(c.env.DB);
    const bid = c.req.param("bid");
    const input = c.req.valid("json");
    const clash = await db.query.packages.findFirst({
      where: and(eq(s.packages.businessId, bid), eq(s.packages.slug, input.slug)),
    });
    if (clash) return c.json({ error: "A package with this URL already exists" }, 409);
    const id = newId("pkg");
    const [{ max } = { max: 0 }] = await db
      .select({ max: sql<number>`coalesce(max(${s.packages.position}), -1)` })
      .from(s.packages)
      .where(eq(s.packages.businessId, bid));
    await db.insert(s.packages).values({
      id,
      businessId: bid,
      slug: input.slug,
      position: Number(max) + 1,
      daysInIstanbul: input.daysInIstanbul,
      visits: input.visits,
      priceFromKurus: input.priceFromKurus,
    });
    await writePackage(db, bid, id, input);
    return c.json({ id }, 201);
  })
  .get("/:bid/packages/:pid", async (c) => {
    const pkg = await loadEditable(createDb(c.env.DB), c.req.param("bid"), c.req.param("pid"));
    return pkg ? c.json({ package: pkg }) : c.json({ error: "Not found" }, 404);
  })
  .put("/:bid/packages/:pid", zValidator("json", validators.packageInput), async (c) => {
    const db = createDb(c.env.DB);
    const bid = c.req.param("bid");
    const pid = c.req.param("pid");
    const input = c.req.valid("json");
    const clash = await db.query.packages.findFirst({
      where: and(eq(s.packages.businessId, bid), eq(s.packages.slug, input.slug)),
    });
    if (clash && clash.id !== pid)
      return c.json({ error: "A package with this URL already exists" }, 409);
    await writePackage(db, bid, pid, input);
    return c.json({ package: await loadEditable(db, bid, pid) });
  })
  // Short-lived token so the builder can preview a draft on the public host without publishing it.
  .post("/:bid/preview-token", async (c) => {
    const token = randomToken(18);
    await c.env.KV.put(`preview:${token}`, c.req.param("bid"), { expirationTtl: 600 });
    return c.json({ token });
  })
  .delete("/:bid/packages/:pid", async (c) => {
    const db = createDb(c.env.DB);
    await db
      .delete(s.packages)
      .where(
        and(eq(s.packages.id, c.req.param("pid")), eq(s.packages.businessId, c.req.param("bid"))),
      );
    return c.json({ ok: true });
  });
