import { describe, expect, it } from "vitest";
import {
  analyseAudit,
  buildPromptSet,
  checkReplyRules,
  convertKurus,
  emptySignals,
  FALLBACK_RATES,
  formatPrice,
  generateResults,
  isSampleReport,
  MockAiProvider,
  publicReviewButtons,
  REPLY_TONES,
  ratesFromFrankfurter,
  whatsappUrl,
} from "./index.ts";

describe("currency", () => {
  it("derives AED from USD with the peg", () => {
    const r = ratesFromFrankfurter({
      base: "TRY",
      date: "2026-10-23",
      rates: { USD: 0.02, EUR: 0.018, GBP: 0.015 },
    });
    expect(r.rates.AED).toBeCloseTo(0.07345, 5);
    expect(r.source).toBe("frankfurter");
  });
  it("converts kuruş and marks foreign prices approximate", () => {
    expect(convertKurus(10_000, "TRY", FALLBACK_RATES)).toBe(100);
    const p = formatPrice(10_000, "EUR", FALLBACK_RATES, "en");
    expect(p.approx).toBe(true);
    expect(p.text).toContain("€");
    expect(formatPrice(10_000, "TRY", FALLBACK_RATES, "tr").approx).toBe(false);
  });
});

describe("whatsapp", () => {
  it("builds a wa.me link with digits only and an encoded message", () => {
    expect(whatsappUrl("+90 000 000 00 01", "Hi, table for 2?")).toBe(
      "https://wa.me/900000000001?text=Hi%2C%20table%20for%202%3F",
    );
  });
});

describe("audit", () => {
  it("builds 12–15 prompts and fills the district", () => {
    const one = buildPromptSet("clinic", "Osmanbey", ["en"]);
    expect(one).toHaveLength(12);
    expect(one[0]!.text).toContain("Osmanbey");
    const two = buildPromptSet("dining", "Şişli", ["tr", "en"]);
    expect(two).toHaveLength(15);
    expect(new Set(two.map((p) => `${p.templateId}-${p.lang}`)).size).toBe(15);
  });

  it("Turkish prompts read correctly for any district (no hard-coded suffix)", () => {
    for (const district of ["Beşiktaş", "Üsküdar", "Sultanahmet", "Nişantaşı", "Şişli"]) {
      for (const vertical of ["dining", "retail", "clinic"] as const) {
        for (const p of buildPromptSet(vertical, district, ["tr"])) {
          expect(p.text, p.text).not.toMatch(new RegExp(`${district}'`));
        }
      }
    }
  });

  it("is deterministic and always labelled as a sample", () => {
    const prompts = buildPromptSet("dining", "Şişli", ["en"]);
    const a = generateResults({
      prompts,
      businessName: "X",
      vertical: "dining",
      seed: "x",
      source: "sample",
    });
    const b = generateResults({
      prompts,
      businessName: "X",
      vertical: "dining",
      seed: "x",
      source: "sample",
    });
    expect(a).toEqual(b);
    expect(isSampleReport(a)).toBe(true);
    expect(isSampleReport(a.map((r) => ({ ...r, source: "live" as const })))).toBe(false);
  });

  it("scores and maps gaps to services", () => {
    const prompts = buildPromptSet("clinic", "Şişli", ["en"]);
    const results = generateResults({
      prompts,
      businessName: "Y",
      vertical: "clinic",
      seed: "y",
      source: "sample",
    });
    const analysis = analyseAudit({
      businessName: "Y",
      vertical: "clinic",
      signals: emptySignals("https://y.example", "x"),
      results,
    });
    expect(analysis.score).toBeGreaterThanOrEqual(0);
    expect(analysis.score).toBeLessThanOrEqual(100);
    expect(analysis.website).toBe(0);
    expect(analysis.sample).toBe(true);
    const keys = analysis.fixes.map((f) => f.key);
    expect(keys).toContain("schema");
    expect(keys).toContain("faq");
    expect(keys).toContain("multilingual");
  });

  it("uses a fixture matrix when given one", () => {
    const prompts = buildPromptSet("dining", "Şişli", ["en"]);
    const results = generateResults({
      prompts,
      businessName: "Café Lale",
      vertical: "dining",
      seed: "lale",
      source: "seeded",
      matrix: { d01: "LMAA" },
    });
    const d01 = results.filter((r) => r.templateId === "d01").map((r) => r.outcome);
    expect(d01).toEqual(["linked", "mentioned", "absent", "absent"]);
    expect(results.find((r) => r.outcome !== "absent")!.recommended[0]).toBe("Café Lale");
  });
});

describe("reply rules and mock drafts", () => {
  const ai = new MockAiProvider();
  const business = {
    name: "Defne Dental Clinic",
    vertical: "clinic" as const,
    email: "care@defnedental.example",
    whatsapp: "+90 000 000 00 03",
  };

  it("every mock draft passes the rules, in both languages and all tones", async () => {
    for (const lang of ["en", "tr"] as const) {
      for (const tone of REPLY_TONES) {
        for (const rating of [1, 5]) {
          const text = await ai.draftReply({
            review: { author: "Paul Davies", rating, lang, text: "..." },
            business,
            tone,
          });
          expect(checkReplyRules(text, business), `${lang}/${tone}/${rating}: ${text}`).toEqual([]);
        }
      }
    }
  });

  it("flags treatment mentions, arguing and missing contact", () => {
    const v = checkReplyRules("Your implant treatment went fine, you are wrong.", business);
    expect(v).toEqual(["mentionsTreatment", "argues", "noDirectContact"]);
  });
});

describe("review funnel", () => {
  it("never filters public review options", () => {
    const links = { google: "g", tripadvisor: "t", realself: "r", whatclinic: "w" };
    expect(publicReviewButtons("clinic", links).map((b) => b.platform)).toEqual([
      "google",
      "tripadvisor",
      "realself",
      "whatclinic",
    ]);
    expect(publicReviewButtons("dining", links).map((b) => b.platform)).toEqual([
      "google",
      "tripadvisor",
    ]);
  });
});
