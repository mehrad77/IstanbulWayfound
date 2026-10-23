import type { Localized, PackageInfo, ProfileBundle } from "@wayfound/core";
import { BRAND, PILLARS, type Pillar } from "@wayfound/core";
import type {
  BreadcrumbList,
  FAQPage,
  ListItem,
  MedicalProcedure,
  Menu,
  MenuSection,
  OfferCatalog,
  OpeningHoursSpecification,
  Organization,
  Service,
  Thing,
  WithContext,
} from "schema-dts";

type Node = Exclude<Thing, string> & Record<string, unknown>;
export interface Graph {
  "@context": "https://schema.org";
  "@graph": Node[];
}

const DAY: Record<string, string> = {
  Mo: "Monday",
  Tu: "Tuesday",
  We: "Wednesday",
  Th: "Thursday",
  Fr: "Friday",
  Sa: "Saturday",
  Su: "Sunday",
};

export function graph(...nodes: (Node | Node[] | null | undefined)[]): Graph {
  return { "@context": "https://schema.org", "@graph": nodes.flat().filter(Boolean) as Node[] };
}

/** Serialise for a <script type="application/ld+json"> tag, safe against `</script>`. */
export function toScriptJson(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

const lira = (kurus: number) => (kurus / 100).toFixed(2);

export interface PageUrls {
  /** Absolute URL of the business's public page, e.g. https://go.example/m/cafe-lale */
  page: string;
  /** Absolute base for the public host, for building ids. */
  base: string;
}

export function businessId(urls: PageUrls, slug: string) {
  return `${urls.base}/#business-${slug}`;
}

/** The LocalBusiness node (CafeOrCoffeeShop, ClothingStore, Dentist, …) for a profile. */
export function localBusiness(bundle: ProfileBundle, urls: PageUrls): Node {
  const { business: b, location: l } = bundle;
  const hours: OpeningHoursSpecification[] = l.hours.map((h) => ({
    "@type": "OpeningHoursSpecification",
    dayOfWeek: h.days.map((d) => `https://schema.org/${DAY[d]}`) as never,
    opens: h.opens,
    closes: h.closes,
  }));
  const sameAs = Object.values(b.reviewLinks).filter(Boolean);
  const node: Node = {
    "@type": b.schemaType as "LocalBusiness",
    "@id": businessId(urls, b.slug),
    name: b.name,
    description: b.description,
    url: b.website ?? urls.page,
    telephone: b.phone,
    email: b.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: l.street,
      addressLocality: l.district,
      addressRegion: l.city,
      postalCode: l.postalCode,
      addressCountry: l.country,
    },
    geo: { "@type": "GeoCoordinates", latitude: l.lat, longitude: l.lng },
    openingHoursSpecification: hours,
    knowsLanguage: b.languages,
    currenciesAccepted: "TRY",
    inLanguage: bundle.locale,
    ...(b.priceRange ? { priceRange: b.priceRange } : {}),
    ...(b.rating
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: b.rating.value,
            reviewCount: b.rating.count,
            bestRating: 5,
          },
        }
      : {}),
    ...(sameAs.length ? { sameAs } : {}),
    ...(b.vertical === "dining"
      ? { servesCuisine: ["Turkish", "Café"], acceptsReservations: true }
      : {}),
  };
  return node;
}

/** Menu with sections and items, priced in TRY. */
export function menu(bundle: ProfileBundle, urls: PageUrls): Node {
  const sections: MenuSection[] = bundle.categories.map((c) => ({
    "@type": "MenuSection",
    name: c.name,
    hasMenuItem: c.items.map((i) => ({
      "@type": "MenuItem",
      name: i.name,
      description: i.description,
      ...(i.priceKurus !== null
        ? {
            offers: {
              "@type": "Offer",
              price: lira(i.priceKurus),
              priceCurrency: "TRY",
              availability: i.soldOut ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
            },
          }
        : {}),
      ...(i.dietary.length
        ? {
            suitableForDiet: i.dietary.map((d) =>
              d === "halal"
                ? "https://schema.org/HalalDiet"
                : d === "vegan"
                  ? "https://schema.org/VeganDiet"
                  : d === "vegetarian"
                    ? "https://schema.org/VegetarianDiet"
                    : "https://schema.org/GlutenFreeDiet",
            ) as never,
          }
        : {}),
    })),
  }));
  const node: Menu = {
    "@type": "Menu",
    "@id": `${urls.page}#menu`,
    name: `${bundle.business.name} menu`,
    inLanguage: bundle.locale,
    hasMenuSection: sections,
  };
  return {
    ...(node as Node),
    mainEntityOfPage: urls.page,
    isPartOf: { "@id": businessId(urls, bundle.business.slug) },
  };
}

/** Product catalog (showroom) or price list (clinic) as an OfferCatalog. */
export function offerCatalog(bundle: ProfileBundle, urls: PageUrls): Node {
  const node: OfferCatalog = {
    "@type": "OfferCatalog",
    "@id": `${urls.page}#catalog`,
    name: bundle.business.name,
    itemListElement: bundle.categories.map((c) => ({
      "@type": "OfferCatalog",
      name: c.name,
      itemListElement: c.items.map((i) => ({
        "@type": "Offer",
        ...(i.priceKurus !== null ? { price: lira(i.priceKurus), priceCurrency: "TRY" } : {}),
        availability: i.soldOut ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
        itemOffered:
          bundle.business.vertical === "clinic"
            ? { "@type": "Service", name: i.name, description: i.description }
            : {
                "@type": "Product",
                name: i.name,
                description: i.description,
                ...(i.sku ? { sku: i.sku } : {}),
                ...(i.fabric ? { material: i.fabric } : {}),
                ...(i.sizes.length ? { size: i.sizes.join(", ") } : {}),
              },
        ...(i.moq ? { eligibleQuantity: { "@type": "QuantitativeValue", minValue: i.moq } } : {}),
      })),
    })) as never,
  };
  return { ...(node as Node), offeredBy: { "@id": businessId(urls, bundle.business.slug) } };
}

export function faqPage(faqs: { question: string; answer: string }[], url: string): Node | null {
  if (!faqs.length) return null;
  const node: FAQPage = {
    "@type": "FAQPage",
    "@id": `${url}#faq`,
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
  return node as Node;
}

export function breadcrumbs(items: { name: string; url: string }[]): Node {
  const node: BreadcrumbList = {
    "@type": "BreadcrumbList",
    itemListElement: items.map(
      (item, i): ListItem => ({
        "@type": "ListItem",
        position: i + 1,
        name: item.name,
        item: item.url,
      }),
    ),
  };
  return node as Node;
}

export function medicalProcedure(
  bundle: ProfileBundle,
  pkg: PackageInfo,
  url: string,
  base: string,
): Node {
  const node: MedicalProcedure = {
    "@type": "MedicalProcedure",
    "@id": `${url}#procedure`,
    name: pkg.procedureName,
    description: pkg.summary,
    howPerformed: pkg.steps
      .filter((s) => s.stage === "treatment")
      .map((s) => s.title)
      .join(". "),
    followup: pkg.steps
      .filter((s) => s.stage === "aftercare")
      .map((s) => s.title)
      .join(". "),
  };
  return {
    ...(node as Node),
    url,
    offers: {
      "@type": "Offer",
      price: lira(pkg.priceFromKurus),
      priceCurrency: "TRY",
      description: pkg.priceFactors,
      offeredBy: { "@id": businessId({ base, page: url }, bundle.business.slug) },
    },
  };
}

// ---------------------------------------------------------------------------
// Agency (marketing site) nodes.

export function agencyOrganization(siteUrl: string, locale: "en" | "tr"): Node[] {
  const org: Organization = {
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: BRAND.name,
    url: siteUrl,
    email: BRAND.email,
    description: BRAND.tagline[locale],
    areaServed: { "@type": "City", name: "Istanbul" },
    knowsLanguage: ["en", "tr"],
  };
  const service: Node = {
    "@type": "ProfessionalService",
    "@id": `${siteUrl}/#service`,
    name: BRAND.name,
    url: siteUrl,
    parentOrganization: { "@id": `${siteUrl}/#organization` },
    address: { "@type": "PostalAddress", addressLocality: "Istanbul", addressCountry: "TR" },
    telephone: BRAND.whatsapp,
    priceRange: "Contact us",
    areaServed: { "@type": "City", name: "Istanbul" },
  };
  return [org as Node, service];
}

export function agencyService(
  siteUrl: string,
  pageUrl: string,
  pillar: Pillar,
  description: Localized,
  locale: "en" | "tr",
): Node {
  const node: Service = {
    "@type": "Service",
    "@id": `${pageUrl}#service`,
    name: PILLARS[pillar].name[locale],
    description: description[locale],
    provider: { "@id": `${siteUrl}/#organization` },
    areaServed: { "@type": "City", name: "Istanbul" },
    url: pageUrl,
  };
  return node as Node;
}

export type { WithContext };
