import { zValidator } from "@hono/zod-validator";
import {
  type AuditAnalysis,
  analyseAudit,
  buildPromptSet,
  type EngineResult,
  emptySignals,
  generateResults,
  validators,
  type WebsiteSignals,
} from "@wayfound/core";
import { createDb, schema as s } from "@wayfound/db";
import { asc, eq } from "drizzle-orm";
import { Hono } from "hono";
import type { AppEnv } from "../env.ts";
import { newId, normalizeName } from "../lib/util.ts";
import { checkWebsite } from "../lib/website-check.ts";

const TEASER_PROMPTS = 4;

interface StoredAudit {
  id: string;
  businessName: string;
  vertical: string;
  district: string;
  website: string | null;
  languages: string[];
  score: number;
  visibility: number;
  websiteScore: number;
  signals: Record<string, unknown>;
  analysis: Record<string, unknown>;
  leadId: string | null;
  createdAt: string;
}

/** Shape the report; before the lead form is filled it shows a teaser only. */
function report(audit: StoredAudit, results: EngineResult[]) {
  const analysis = audit.analysis as unknown as AuditAnalysis;
  const unlocked = Boolean(audit.leadId);
  const templateIds = [...new Set(results.map((r) => `${r.templateId}:${r.lang}`))];
  const visibleIds = unlocked ? templateIds : templateIds.slice(0, TEASER_PROMPTS);
  const grid = visibleIds.map((key) => {
    const cells = results.filter((r) => `${r.templateId}:${r.lang}` === key);
    return {
      prompt: cells[0]!.prompt,
      lang: cells[0]!.lang,
      cells: cells.map((r) => ({
        engine: r.engine,
        outcome: r.outcome,
        recommended: r.recommended,
        cited: r.cited,
      })),
    };
  });
  return {
    id: audit.id,
    input: {
      businessName: audit.businessName,
      vertical: audit.vertical,
      district: audit.district,
      website: audit.website,
      languages: audit.languages,
    },
    createdAt: audit.createdAt,
    unlocked,
    // Driven by each result's `source`, never by styling: anything not `live` is a sample.
    sample: results.length === 0 || results.some((r) => r.source !== "live"),
    sources: [...new Set(results.map((r) => r.source))],
    score: audit.score,
    visibility: audit.visibility,
    website: audit.websiteScore,
    checks: analysis.checks,
    signals: audit.signals as unknown as WebsiteSignals,
    competitors: unlocked ? analysis.competitors : analysis.competitors.slice(0, 3),
    citedSources: unlocked ? analysis.sources : analysis.sources.slice(0, 3),
    fixes: unlocked ? analysis.fixes : analysis.fixes.slice(0, 2),
    totals: {
      prompts: templateIds.length,
      fixes: analysis.fixes.length,
      competitors: analysis.competitors.length,
    },
    grid,
  };
}

async function loadReport(db: ReturnType<typeof createDb>, id: string) {
  const audit = await db.query.audits.findFirst({ where: eq(s.audits.id, id) });
  if (!audit) return null;
  const rows = await db
    .select()
    .from(s.auditResults)
    .where(eq(s.auditResults.auditId, id))
    .orderBy(asc(s.auditResults.id));
  const results: EngineResult[] = rows.map((r) => ({
    templateId: r.templateId,
    prompt: r.prompt,
    lang: r.lang as "en" | "tr",
    engine: r.engine as EngineResult["engine"],
    outcome: r.outcome,
    source: r.source,
    recommended: r.recommended,
    cited: r.cited,
  }));
  return report(audit as StoredAudit, results);
}

export type AuditReport = NonNullable<Awaited<ReturnType<typeof loadReport>>>;

export const audit = new Hono<AppEnv>()
  .post("/", zValidator("json", validators.auditInput), async (c) => {
    const input = c.req.valid("json");
    const db = createDb(c.env.DB);

    // Demo businesses get their seeded answer sets; anything else gets a labelled sample.
    const demos = await db.select().from(s.businesses).where(eq(s.businesses.isDemo, true));
    const wanted = normalizeName(input.businessName);
    const match = demos.find((b) => {
      const name = normalizeName(b.name);
      return (
        name === wanted ||
        wanted.includes(name) ||
        name.includes(wanted) ||
        normalizeName(b.slug) === wanted
      );
    });
    const fixture = match
      ? await db.query.auditFixtures.findFirst({ where: eq(s.auditFixtures.businessId, match.id) })
      : undefined;

    const website = input.website || (match ? `${c.env.PUBLIC_ORIGIN}/m/${match.slug}` : "");
    const signals = website
      ? await checkWebsite(website, c.env)
      : emptySignals("", "No website given");

    const prompts = buildPromptSet(input.vertical, input.district, input.languages);
    const businessName = match?.name ?? input.businessName;
    const results = generateResults({
      prompts,
      businessName,
      vertical: input.vertical,
      seed: `${wanted}|${input.vertical}|${normalizeName(input.district)}`,
      source: fixture ? "seeded" : "sample",
      matrix: fixture?.matrix,
      competitors: fixture?.competitors,
      sources: fixture?.sources,
    });
    const analysis = analyseAudit({ businessName, vertical: input.vertical, signals, results });

    const id = newId("aud");
    await db.insert(s.audits).values({
      id,
      businessName: input.businessName,
      vertical: input.vertical,
      district: input.district,
      website: website || null,
      languages: input.languages,
      matchedBusinessId: match?.id ?? null,
      score: analysis.score,
      visibility: analysis.visibility,
      websiteScore: analysis.website,
      signals: signals as unknown as Record<string, unknown>,
      analysis: analysis as unknown as Record<string, unknown>,
    });
    // D1 limits bound parameters per statement, so insert results in small batches.
    const rows = results.map((r) => ({ auditId: id, ...r }));
    for (let i = 0; i < rows.length; i += 8) {
      await db.insert(s.auditResults).values(rows.slice(i, i + 8));
    }
    return c.json(await loadReport(db, id), 201);
  })
  .get("/:id", async (c) => {
    const result = await loadReport(createDb(c.env.DB), c.req.param("id"));
    return result ? c.json(result) : c.json({ error: "Not found" }, 404);
  })
  .post("/:id/unlock", zValidator("json", validators.unlockInput), async (c) => {
    const db = createDb(c.env.DB);
    const id = c.req.param("id");
    const existing = await db.query.audits.findFirst({ where: eq(s.audits.id, id) });
    if (!existing) return c.json({ error: "Not found" }, 404);
    if (!existing.leadId) {
      const input = c.req.valid("json");
      const leadId = newId("lead");
      await db.insert(s.leads).values({
        id: leadId,
        kind: "audit",
        name: input.name || null,
        email: input.email || null,
        whatsapp: input.whatsapp || null,
        lang: c.req.query("lang") ?? null,
        payload: {
          auditId: id,
          businessName: existing.businessName,
          vertical: existing.vertical,
          district: existing.district,
          website: existing.website,
          score: existing.score,
        },
      });
      await db.update(s.audits).set({ leadId }).where(eq(s.audits.id, id));
    }
    return c.json(await loadReport(db, id));
  });
