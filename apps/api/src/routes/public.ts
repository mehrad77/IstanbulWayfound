import { zValidator } from "@hono/zod-validator";
import { validators, whatsappUrl } from "@wayfound/core";
import { createDb, findBusinessBySlug, loadProfileBundle, schema as s } from "@wayfound/db";
import { isLocale, t } from "@wayfound/i18n";
import { Hono } from "hono";
import type { AppEnv } from "../env.ts";
import { getRates } from "../lib/fx.ts";
import { newId } from "../lib/util.ts";

export const publicApi = new Hono<AppEnv>()
  .get("/fx", async (c) => c.json(await getRates(c.env)))
  .get("/businesses/:slug", async (c) => {
    const db = createDb(c.env.DB);
    const lang = c.req.query("lang");
    const locale = isLocale(lang) ? lang : "en";
    const biz = await findBusinessBySlug(db, c.req.param("slug"));
    if (!biz) return c.json({ error: "Not found" }, 404);
    const preview = c.req.query("preview");
    const includeDrafts = preview ? (await c.env.KV.get(`preview:${preview}`)) === biz.id : false;
    const [bundle, fx] = await Promise.all([
      loadProfileBundle(db, biz.id, locale, { mediaBase: "/media", includeDrafts }),
      getRates(c.env),
    ]);
    return c.json({ bundle, fx });
  })
  .post("/events", zValidator("json", validators.eventInput), async (c) => {
    const e = c.req.valid("json");
    const db = createDb(c.env.DB);
    const biz = await findBusinessBySlug(db, e.businessSlug);
    if (!biz) return c.json({ ok: false }, 404);
    await db.insert(s.events).values({
      businessId: biz.id,
      type: e.type,
      lang: e.lang ?? null,
      currency: e.currency ?? null,
      staff: e.staff || null,
      path: e.path ?? null,
    });
    return c.json({ ok: true });
  })
  .post(
    "/businesses/:slug/packages/:pkg/inquiries",
    zValidator("json", validators.inquiryInput),
    async (c) => {
      const input = c.req.valid("json");
      const db = createDb(c.env.DB);
      const biz = await findBusinessBySlug(db, c.req.param("slug"));
      if (!biz) return c.json({ error: "Not found" }, 404);
      const bundle = await loadProfileBundle(db, biz.id, input.lang);
      const pkg = bundle?.packages.find((p) => p.slug === c.req.param("pkg"));
      if (!bundle || !pkg) return c.json({ error: "Not found" }, 404);
      const summary = t(input.lang, "clinic.inquirySummary", {
        clinic: biz.name,
        package: pkg.name,
        name: input.name,
        country: input.country,
        dates: input.dates,
        treatment: input.treatment,
      });
      const leadId = newId("lead");
      await db.insert(s.leads).values({
        id: leadId,
        kind: "inquiry",
        businessId: biz.id,
        name: input.name,
        country: input.country,
        lang: input.lang,
        payload: {
          package: pkg.slug,
          packageName: pkg.name,
          dates: input.dates,
          treatment: input.treatment,
          summary,
        },
      });
      await db.insert(s.events).values({
        businessId: biz.id,
        type: "inquiry",
        lang: input.lang,
        path: `/c/${biz.slug}/${pkg.slug}`,
      });
      return c.json({ leadId, whatsappUrl: whatsappUrl(biz.whatsapp, summary), summary });
    },
  )
  .post("/businesses/:slug/feedback", zValidator("json", validators.feedbackInput), async (c) => {
    const input = c.req.valid("json");
    const db = createDb(c.env.DB);
    const biz = await findBusinessBySlug(db, c.req.param("slug"));
    if (!biz) return c.json({ error: "Not found" }, 404);
    await db.insert(s.reviewFeedback).values({
      id: newId("fb"),
      businessId: biz.id,
      staff: input.staff || null,
      message: input.message,
      contact: input.contact || null,
      lang: input.lang,
    });
    return c.json({ ok: true });
  });

export const media = new Hono<AppEnv>().get("/*", async (c) => {
  const key = c.req.path.replace(/^\/api\/media\//, "");
  const obj = await c.env.MEDIA.get(key);
  if (!obj) return c.notFound();
  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set("cache-control", "public, max-age=31536000, immutable");
  return new Response(obj.body, { headers });
});
