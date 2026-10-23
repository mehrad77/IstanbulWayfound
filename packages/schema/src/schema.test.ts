import { bundleFromSeed, businessSeeds } from "@wayfound/db/seed";
import { describe, expect, it } from "vitest";
import {
  breadcrumbs,
  faqPage,
  graph,
  localBusiness,
  medicalProcedure,
  menu,
  offerCatalog,
  toScriptJson,
} from "./index.ts";

const base = "https://go.wayfound.example";

/** Required (or Google-recommended) properties per type that a crawler needs. */
const REQUIRED: Record<string, string[]> = {
  CafeOrCoffeeShop: ["name", "address", "geo", "telephone", "openingHoursSpecification", "url"],
  ClothingStore: ["name", "address", "geo", "telephone", "openingHoursSpecification", "url"],
  Dentist: ["name", "address", "geo", "telephone", "openingHoursSpecification", "url"],
  PostalAddress: ["streetAddress", "addressLocality", "addressCountry"],
  Menu: ["hasMenuSection"],
  MenuSection: ["name", "hasMenuItem"],
  MenuItem: ["name", "offers"],
  OfferCatalog: ["name", "itemListElement"],
  Offer: ["priceCurrency"],
  FAQPage: ["mainEntity"],
  Question: ["name", "acceptedAnswer"],
  Answer: ["text"],
  BreadcrumbList: ["itemListElement"],
  MedicalProcedure: ["name", "description"],
};

function walk(node: unknown, visit: (n: Record<string, unknown>) => void) {
  if (Array.isArray(node)) {
    for (const n of node) walk(n, visit);
  } else if (node && typeof node === "object") {
    visit(node as Record<string, unknown>);
    for (const v of Object.values(node)) walk(v, visit);
  }
}

function missingProps(data: unknown): string[] {
  const problems: string[] = [];
  walk(data, (n) => {
    const type = n["@type"];
    if (typeof type !== "string") return;
    for (const prop of REQUIRED[type] ?? []) {
      const v = n[prop];
      if (v === undefined || v === null || v === "" || (Array.isArray(v) && !v.length)) {
        problems.push(`${type}.${prop}`);
      }
    }
  });
  return problems;
}

describe("Gate 0: JSON-LD for every seeded demo business", () => {
  for (const seed of businessSeeds) {
    for (const locale of ["en", "tr"] as const) {
      it(`${seed.slug} (${locale}) renders a complete, parseable graph`, () => {
        const bundle = bundleFromSeed(seed, locale);
        const page = `${base}/m/${seed.slug}`;
        const urls = { base, page };
        const nodes = [
          localBusiness(bundle, urls),
          seed.vertical === "dining" ? menu(bundle, urls) : offerCatalog(bundle, urls),
          faqPage(bundle.faqs, page),
          breadcrumbs([
            { name: "Wayfound", url: base },
            { name: bundle.business.name, url: page },
          ]),
          ...bundle.packages.map((p) =>
            medicalProcedure(bundle, p, `${base}/c/${seed.slug}/${p.slug}`, base),
          ),
        ];
        const json = toScriptJson(graph(...nodes));
        const parsed = JSON.parse(json);
        expect(parsed["@context"]).toBe("https://schema.org");
        expect(missingProps(parsed)).toEqual([]);
        const biz = parsed["@graph"][0];
        expect(biz["@type"]).toBe(seed.schemaType);
        expect(biz.address.addressCountry).toBe("TR");
        expect(biz.aggregateRating.ratingValue).toBeGreaterThan(0);
        expect(json).not.toContain("</script");
      });
    }
  }

  it("prices are in TRY with two decimals", () => {
    const bundle = bundleFromSeed(businessSeeds[0]!, "en");
    const m = menu(bundle, { base, page: `${base}/m/cafe-lale` }) as unknown as {
      hasMenuSection: { hasMenuItem: { offers: { price: string; priceCurrency: string } }[] }[];
    };
    const offer = m.hasMenuSection[0]!.hasMenuItem[0]!.offers;
    expect(offer.priceCurrency).toBe("TRY");
    expect(offer.price).toMatch(/^\d+\.\d{2}$/);
  });
});
