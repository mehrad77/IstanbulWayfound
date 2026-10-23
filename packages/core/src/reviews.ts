import type { ReviewPlatform, Vertical } from "./types.ts";

export const PLATFORM_LABELS: Record<ReviewPlatform, string> = {
  google: "Google",
  tripadvisor: "Tripadvisor",
  realself: "RealSelf",
  whatclinic: "WhatClinic",
};

export function platformsFor(vertical: Vertical): ReviewPlatform[] {
  return vertical === "clinic"
    ? ["google", "tripadvisor", "realself", "whatclinic"]
    : ["google", "tripadvisor"];
}

/**
 * Every public review option the business has, in a fixed order.
 * Deliberately takes no rating or sentiment input: hiding public options from unhappy
 * visitors ("review gating") breaks Google's review policy.
 */
export function publicReviewButtons(
  vertical: Vertical,
  links: Partial<Record<ReviewPlatform, string>>,
): { platform: ReviewPlatform; label: string; url: string }[] {
  return platformsFor(vertical)
    .filter((p) => links[p])
    .map((p) => ({ platform: p, label: PLATFORM_LABELS[p], url: links[p]! }));
}
