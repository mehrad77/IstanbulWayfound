import type { EngineResult, Outcome } from "./engines.ts";
import { WEBSITE_MAX, type WebsiteCheck } from "./website.ts";

const OUTCOME_WEIGHT: Record<Outcome, number> = { linked: 1, mentioned: 0.6, absent: 0 };
export const VISIBILITY_MAX = 70;

export interface ScoreBreakdown {
  score: number;
  visibility: number;
  website: number;
}

/** 0–100: 70 points from engine answers, 30 from the website check. */
export function computeScore(
  results: readonly EngineResult[],
  checks: readonly WebsiteCheck[],
): ScoreBreakdown {
  const avg = results.length
    ? results.reduce((sum, r) => sum + OUTCOME_WEIGHT[r.outcome], 0) / results.length
    : 0;
  const visibility = Math.round(avg * VISIBILITY_MAX);
  const websitePoints = checks.reduce((sum, c) => sum + c.points, 0);
  const website = Math.round((websitePoints / WEBSITE_MAX) * (100 - VISIBILITY_MAX));
  return { score: Math.min(100, visibility + website), visibility, website };
}

export interface Tally {
  name: string;
  count: number;
}

function tally(values: string[], limit: number): Tally[] {
  const counts = new Map<string, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, limit);
}

/** Who the engines recommend instead of the business, and how often. */
export function competitorTally(results: readonly EngineResult[], businessName: string): Tally[] {
  const self = businessName.trim().toLowerCase();
  return tally(
    results.flatMap((r) => r.recommended).filter((n) => n.trim().toLowerCase() !== self),
    6,
  );
}

export function sourceTally(results: readonly EngineResult[]): Tally[] {
  return tally(
    results.flatMap((r) => r.cited),
    6,
  );
}

export function outcomeCounts(results: readonly EngineResult[]): Record<Outcome, number> {
  const counts: Record<Outcome, number> = { linked: 0, mentioned: 0, absent: 0 };
  for (const r of results) counts[r.outcome]++;
  return counts;
}
