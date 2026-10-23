import type { Vertical } from "../types.ts";
import { ENGINES, type EngineResult, type Outcome, type ResultSource } from "./engines.ts";
import type { AuditPrompt } from "./prompts.ts";

/** FNV-1a, for a stable seed from the audit input. */
export function hashString(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** mulberry32: small deterministic PRNG so the same input always gives the same sample. */
export function prng(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Invented names for sample reports only. Never shown without the "Sample report" label. */
export const SAMPLE_COMPETITORS: Record<Vertical, string[]> = {
  dining: [
    "Nar Bahçe Café",
    "Kahve Durağı",
    "Lokanta Defne",
    "Simitçi Ayla",
    "Mavi Kapı Kahvaltı",
    "Fırın 1923",
    "Teras Meze",
  ],
  retail: [
    "Ipekyol Wholesale House",
    "Atlas Tekstil Showroom",
    "Modaevi Toptan",
    "Keten & Co.",
    "Boğaz Moda",
    "Lale Butik",
  ],
  clinic: [
    "Bosphorus Smile Studio",
    "DentaPlus Şişli",
    "Marmara Dental Center",
    "Lumen Diş Kliniği",
    "Galata Oral Health",
    "Beyaz Dental Istanbul",
  ],
};

export const SAMPLE_SOURCES: Record<Vertical, string[]> = {
  dining: [
    "tripadvisor.com",
    "maps.google.com",
    "reddit.com",
    "timeout.com",
    "travel blogs",
    "instagram.com",
  ],
  retail: [
    "maps.google.com",
    "instagram.com",
    "reddit.com",
    "alibaba.com",
    "trade blogs",
    "tripadvisor.com",
  ],
  clinic: [
    "whatclinic.com",
    "maps.google.com",
    "reddit.com",
    "realself.com",
    "trustpilot.com",
    "health blogs",
  ],
};

const LETTER: Record<string, Outcome> = { L: "linked", M: "mentioned", A: "absent" };

export interface GenerateOptions {
  prompts: AuditPrompt[];
  businessName: string;
  vertical: Vertical;
  seed: string;
  source: Extract<ResultSource, "seeded" | "sample">;
  /**
   * Optional fixed outcomes per template id, one letter per engine in ENGINES order
   * (L = linked, M = mentioned, A = absent). Used for the seeded demo businesses.
   */
  matrix?: Record<string, string>;
  competitors?: string[];
  sources?: string[];
}

export function generateResults(opts: GenerateOptions): EngineResult[] {
  const rand = prng(hashString(opts.seed));
  const competitors = opts.competitors ?? SAMPLE_COMPETITORS[opts.vertical];
  const sources = opts.sources ?? SAMPLE_SOURCES[opts.vertical];
  const pick = <T>(list: T[], n: number): T[] => {
    const copy = [...list];
    const out: T[] = [];
    while (out.length < n && copy.length)
      out.push(copy.splice(Math.floor(rand() * copy.length), 1)[0]!);
    return out;
  };

  const results: EngineResult[] = [];
  for (const prompt of opts.prompts) {
    const row = opts.matrix?.[prompt.templateId];
    ENGINES.forEach((engine, i) => {
      let outcome: Outcome;
      const letter = row?.[i];
      if (letter && LETTER[letter]) {
        outcome = LETTER[letter];
      } else {
        const r = rand();
        outcome = r < 0.07 ? "linked" : r < 0.22 ? "mentioned" : "absent";
      }
      const others = pick(competitors, 2 + Math.floor(rand() * 2));
      results.push({
        templateId: prompt.templateId,
        prompt: prompt.text,
        lang: prompt.lang,
        engine,
        outcome,
        source: opts.source,
        recommended: outcome === "absent" ? others : [opts.businessName, ...others.slice(0, 2)],
        cited: pick(sources, 1 + Math.floor(rand() * 2)),
      });
    });
  }
  return results;
}
