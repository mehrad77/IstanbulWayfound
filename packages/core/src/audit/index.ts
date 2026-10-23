import type { Vertical } from "../types.ts";
import type { EngineResult } from "./engines.ts";
import { buildFixList, type Fix } from "./fixes.ts";
import {
  competitorTally,
  computeScore,
  type ScoreBreakdown,
  sourceTally,
  type Tally,
} from "./score.ts";
import { evaluateWebsite, type WebsiteCheck, type WebsiteSignals } from "./website.ts";

export * from "./engines.ts";
export * from "./fixes.ts";
export * from "./prompts.ts";
export * from "./sample.ts";
export * from "./score.ts";
export * from "./website.ts";

export interface AuditAnalysis extends ScoreBreakdown {
  checks: WebsiteCheck[];
  competitors: Tally[];
  sources: Tally[];
  fixes: Fix[];
  sample: boolean;
}

export function analyseAudit(input: {
  businessName: string;
  vertical: Vertical;
  signals: WebsiteSignals;
  results: EngineResult[];
}): AuditAnalysis {
  const checks = evaluateWebsite(input.signals);
  const breakdown = computeScore(input.results, checks);
  return {
    ...breakdown,
    checks,
    competitors: competitorTally(input.results, input.businessName),
    sources: sourceTally(input.results),
    fixes: buildFixList({
      vertical: input.vertical,
      checks,
      results: input.results,
      visibility: Math.round((breakdown.visibility / 70) * 100),
    }),
    sample: input.results.length === 0 || input.results.some((r) => r.source !== "live"),
  };
}
