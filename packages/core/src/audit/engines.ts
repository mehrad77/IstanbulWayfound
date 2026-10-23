export const ENGINES = ["chatgpt", "perplexity", "gemini", "aio"] as const;
export type Engine = (typeof ENGINES)[number];

export const OUTCOMES = ["linked", "mentioned", "absent"] as const;
export type Outcome = (typeof OUTCOMES)[number];

/** Where an engine answer came from. Anything other than `live` must be labelled as a sample. */
export const RESULT_SOURCES = ["seeded", "sample", "live"] as const;
export type ResultSource = (typeof RESULT_SOURCES)[number];

export interface EngineResult {
  templateId: string;
  prompt: string;
  lang: "en" | "tr";
  engine: Engine;
  outcome: Outcome;
  source: ResultSource;
  /** Businesses the engine recommended for this prompt. */
  recommended: string[];
  /** Domains the answer cited. */
  cited: string[];
}

export function isSampleReport(results: readonly Pick<EngineResult, "source">[]): boolean {
  return results.length === 0 || results.some((r) => r.source !== "live");
}
