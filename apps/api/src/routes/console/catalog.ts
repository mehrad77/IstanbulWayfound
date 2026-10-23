import { zValidator } from "@hono/zod-validator";
import { MockAiProvider, validators } from "@wayfound/core";
import { both, createDb, loadTranslations, schema as s, saveTranslations } from "@wayfound/db";
import { and, asc, eq, sql } from "drizzle-orm";
import { Hono } from "hono";
import type { AppEnv } from "../../env.ts";
import { assertBusinessAccess } from "../../lib/auth.ts";
import { newId, nowIso } from "../../lib/util.ts";

const ai = new MockAiProvider();

async function touchBusiness(db: ReturnType<typeof createDb>, businessId: string) {
  await db.update(s.businesses).set({ updatedAt: nowIso() }).where(eq(s.businesses.id, businessId));
}

/** Menu / catalog / price list editing. Every write is live on the public page immediately. */
export const catalog = new Hono<AppEnv>()
  .use("/:bid/*", async (c, next) => {
    assertBusinessAccess(c, c.req.param("bid"));
    await next();
  })
  .get("/:bid/catalog", async (c) => {
    const db = createDb(c.env.DB);
    const bid = c.req.param("bid");
    const [cats, its] = await Promise.all([
      db
        .select()
        .from(s.categories)
        .where(eq(s.categories.businessId, bid))
        .orderBy(asc(s.categories.position)),
      db.select().from(s.items).where(eq(s.items.businessId, bid)).orderBy(asc(s.items.position)),
    ]);
    const [tc, ti] = await Promise.all([
      loadTranslations(
        db,
        "category",
        cats.map((x) => x.id),
      ),
      loadTranslations(
        db,
        "item",
        its.map((x) => x.id),
      ),
    ]);
    return c.json({
      categories: cats.map((cat) => ({
        id: cat.id,
        position: cat.position,
        name: both(tc, cat.id, "name"),
        items: its
          .filter((i) => i.categoryId === cat.id)
          .map((i) => ({
            ...i,
            photoUrl: i.photoKey ? `/api/media/${i.photoKey}` : null,
            name: both(ti, i.id, "name"),
            description: both(ti, i.id, "description"),
          })),
      })),
    });
  })
  .post("/:bid/categories", zValidator("json", validators.categoryInput), async (c) => {
    const db = createDb(c.env.DB);
    const bid = c.req.param("bid");
    const id = newId("cat");
    const [{ max } = { max: 0 }] = await db
      .select({ max: sql<number>`coalesce(max(${s.categories.position}), -1)` })
      .from(s.categories)
      .where(eq(s.categories.businessId, bid));
    await db.insert(s.categories).values({ id, businessId: bid, position: Number(max) + 1 });
    await saveTranslations(db, "category", id, { name: c.req.valid("json").name });
    await touchBusiness(db, bid);
    return c.json({ id }, 201);
  })
  .patch("/:bid/categories/:cid", zValidator("json", validators.categoryInput), async (c) => {
    const db = createDb(c.env.DB);
    await saveTranslations(db, "category", c.req.param("cid"), { name: c.req.valid("json").name });
    await touchBusiness(db, c.req.param("bid"));
    return c.json({ ok: true });
  })
  .delete("/:bid/categories/:cid", async (c) => {
    const db = createDb(c.env.DB);
    await db
      .delete(s.categories)
      .where(
        and(
          eq(s.categories.id, c.req.param("cid")),
          eq(s.categories.businessId, c.req.param("bid")),
        ),
      );
    await touchBusiness(db, c.req.param("bid"));
    return c.json({ ok: true });
  })
  .post("/:bid/categories/reorder", zValidator("json", validators.reorderInput), async (c) => {
    const db = createDb(c.env.DB);
    const bid = c.req.param("bid");
    const { ids } = c.req.valid("json");
    await db.batch(
      ids.map((id, position) =>
        db
          .update(s.categories)
          .set({ position })
          .where(and(eq(s.categories.id, id), eq(s.categories.businessId, bid))),
      ) as never,
    );
    await touchBusiness(db, bid);
    return c.json({ ok: true });
  })
  .post("/:bid/items", zValidator("json", validators.itemInput), async (c) => {
    const db = createDb(c.env.DB);
    const bid = c.req.param("bid");
    const input = c.req.valid("json");
    const id = newId("it");
    const [{ max } = { max: 0 }] = await db
      .select({ max: sql<number>`coalesce(max(${s.items.position}), -1)` })
      .from(s.items)
      .where(eq(s.items.categoryId, input.categoryId));
    await db.insert(s.items).values({
      id,
      businessId: bid,
      categoryId: input.categoryId,
      position: Number(max) + 1,
      sku: input.sku ?? null,
      priceKurus: input.priceKurus,
      priceFrom: input.priceFrom,
      durationMin: input.durationMin ?? null,
      soldOut: input.soldOut,
      dietary: input.dietary,
      allergens: input.allergens,
      fabric: input.fabric ?? null,
      sizes: input.sizes,
      moq: input.moq ?? null,
    });
    await saveTranslations(db, "item", id, { name: input.name, description: input.description });
    await touchBusiness(db, bid);
    return c.json({ id }, 201);
  })
  .patch("/:bid/items/:iid", zValidator("json", validators.itemPatch), async (c) => {
    const db = createDb(c.env.DB);
    const bid = c.req.param("bid");
    const iid = c.req.param("iid");
    const { name, description, ...rest } = c.req.valid("json");
    const updatedAt = nowIso();
    await db
      .update(s.items)
      .set({ ...rest, updatedAt })
      .where(and(eq(s.items.id, iid), eq(s.items.businessId, bid)));
    await saveTranslations(db, "item", iid, { name, description });
    await touchBusiness(db, bid);
    return c.json({ ok: true, updatedAt });
  })
  .delete("/:bid/items/:iid", async (c) => {
    const db = createDb(c.env.DB);
    await db
      .delete(s.items)
      .where(and(eq(s.items.id, c.req.param("iid")), eq(s.items.businessId, c.req.param("bid"))));
    await touchBusiness(db, c.req.param("bid"));
    return c.json({ ok: true });
  })
  .post("/:bid/items/reorder", zValidator("json", validators.reorderInput), async (c) => {
    const db = createDb(c.env.DB);
    const bid = c.req.param("bid");
    const { ids } = c.req.valid("json");
    await db.batch(
      ids.map((id, position) =>
        db
          .update(s.items)
          .set({ position })
          .where(and(eq(s.items.id, id), eq(s.items.businessId, bid))),
      ) as never,
    );
    await touchBusiness(db, bid);
    return c.json({ ok: true });
  })
  .post("/:bid/items/:iid/photo", async (c) => {
    const db = createDb(c.env.DB);
    const bid = c.req.param("bid");
    const iid = c.req.param("iid");
    const body = await c.req.parseBody();
    const file = body.file;
    if (!(file instanceof File)) return c.json({ error: "No file" }, 400);
    if (!/^image\/(jpeg|png|webp|avif)$/.test(file.type))
      return c.json({ error: "Use JPEG, PNG, WebP or AVIF" }, 400);
    if (file.size > 5 * 1024 * 1024) return c.json({ error: "Max 5 MB" }, 400);
    const ext = file.type.split("/")[1];
    const key = `${bid}/items/${iid}-${Date.now()}.${ext}`;
    await c.env.MEDIA.put(key, await file.arrayBuffer(), {
      httpMetadata: { contentType: file.type },
    });
    await db
      .insert(s.media)
      .values({ id: newId("med"), businessId: bid, key, contentType: file.type, bytes: file.size });
    await db
      .update(s.items)
      .set({ photoKey: key, updatedAt: nowIso() })
      .where(and(eq(s.items.id, iid), eq(s.items.businessId, bid)));
    await touchBusiness(db, bid);
    return c.json({ photoUrl: `/api/media/${key}` });
  });

export const translate = new Hono<AppEnv>().post(
  "/",
  zValidator("json", validators.translateInput),
  async (c) => {
    const input = c.req.valid("json");
    return c.json(await ai.suggestTranslation(input));
  },
);
