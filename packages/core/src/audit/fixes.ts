import type { Localized, Vertical } from "../types.ts";
import type { EngineResult } from "./engines.ts";
import type { CheckKey, WebsiteCheck } from "./website.ts";

export type Pillar = 1 | 2 | 3 | 4 | 5;

export const PILLARS: Record<Pillar, { slug: string; name: Localized }> = {
  1: {
    slug: "geo",
    name: { en: "GEO and AI search visibility", tr: "GEO ve yapay zekâ arama görünürlüğü" },
  },
  2: {
    slug: "discovery",
    name: { en: "Maps and global discovery", tr: "Haritalar ve küresel keşif" },
  },
  3: {
    slug: "funnels",
    name: {
      en: "Multilingual menus, catalogs and funnels",
      tr: "Çok dilli menüler, kataloglar ve dönüşüm akışları",
    },
  },
  4: { slug: "visual", name: { en: "Visual production", tr: "Görsel prodüksiyon" } },
  5: { slug: "reputation", name: { en: "Reviews and reputation", tr: "Yorumlar ve itibar" } },
};

export interface Fix {
  key: string;
  pillar: Pillar;
  priority: "high" | "medium" | "low";
  title: Localized;
  why: Localized;
}

interface Context {
  vertical: Vertical;
  checks: readonly WebsiteCheck[];
  results: readonly EngineResult[];
  visibility: number;
}

const failed = (ctx: Context, key: CheckKey) => ctx.checks.some((c) => c.key === key && !c.ok);
const citedShare = (ctx: Context, domain: string) => {
  if (!ctx.results.length) return 0;
  return (
    ctx.results.filter((r) => r.cited.some((c) => c.includes(domain))).length / ctx.results.length
  );
};
const absentShare = (ctx: Context) =>
  ctx.results.length
    ? ctx.results.filter((r) => r.outcome === "absent").length / ctx.results.length
    : 1;

const RULES: { applies: (ctx: Context) => boolean; fix: Fix }[] = [
  {
    applies: (c) => failed(c, "localBusiness") || failed(c, "address") || failed(c, "hours"),
    fix: {
      key: "schema",
      pillar: 1,
      priority: "high",
      title: {
        en: "Publish a complete business schema graph",
        tr: "Eksiksiz bir işletme şeması yayınlayın",
      },
      why: {
        en: "AI engines read structured data to confirm what you are, where you are and when you're open. Without it they lean on third-party sites.",
        tr: "Yapay zekâ motorları ne olduğunuzu, nerede olduğunuzu ve ne zaman açık olduğunuzu yapılandırılmış veriden doğrular. Bu veri yoksa üçüncü taraf sitelere güvenirler.",
      },
    },
  },
  {
    applies: (c) => failed(c, "faq"),
    fix: {
      key: "faq",
      pillar: 1,
      priority: "high",
      title: {
        en: "Add short Q&A answers visitors actually ask",
        tr: "Ziyaretçilerin gerçekten sorduğu kısa soru-cevaplar ekleyin",
      },
      why: {
        en: "Answer engines quote 40–60 word answers. A marked-up FAQ gives them something of yours to quote.",
        tr: "Yanıt motorları 40–60 kelimelik cevapları alıntılar. İşaretlenmiş bir SSS bölümü onlara sizden alıntılanacak bir şey verir.",
      },
    },
  },
  {
    applies: (c) =>
      absentShare(c) > 0.5 && (citedShare(c, "reddit") > 0.15 || citedShare(c, "blog") > 0.1),
    fix: {
      key: "citations",
      pillar: 1,
      priority: "medium",
      title: {
        en: "Get mentioned where the engines look",
        tr: "Motorların baktığı yerlerde adınız geçsin",
      },
      why: {
        en: "Engines cite forums, blogs and guides for these questions. Entity authority and citation seeding puts your name in those sources.",
        tr: "Motorlar bu sorular için forumları, blogları ve rehberleri kaynak gösteriyor. Varlık otoritesi ve atıf çalışması adınızı bu kaynaklara taşır.",
      },
    },
  },
  {
    applies: (c) => absentShare(c) > 0.4 && citedShare(c, "maps") > 0.2,
    fix: {
      key: "maps",
      pillar: 2,
      priority: "high",
      title: {
        en: "Claim and complete every map listing",
        tr: "Tüm harita kayıtlarını sahiplenin ve tamamlayın",
      },
      why: {
        en: "Answers lean on map data. Google, Apple, Bing, Yandex and Amap listings each feed different engines and visitors.",
        tr: "Yanıtlar harita verisine dayanıyor. Google, Apple, Bing, Yandex ve Amap kayıtlarının her biri farklı motorları ve ziyaretçileri besler.",
      },
    },
  },
  {
    applies: (c) =>
      absentShare(c) > 0.4 &&
      (citedShare(c, "tripadvisor") > 0.15 || citedShare(c, "whatclinic") > 0.1),
    fix: {
      key: "directories",
      pillar: 2,
      priority: "medium",
      title: {
        en: "Get listed on the directories engines trust",
        tr: "Motorların güvendiği rehberlerde yer alın",
      },
      why: {
        en: "Tripadvisor and niche directories show up as sources in these answers. A complete, active profile there gets you into the shortlist.",
        tr: "Tripadvisor ve sektörel rehberler bu yanıtlarda kaynak olarak görünüyor. Oradaki eksiksiz ve aktif bir profil sizi kısa listeye sokar.",
      },
    },
  },
  {
    applies: (c) => failed(c, "hreflang"),
    fix: {
      key: "multilingual",
      pillar: 3,
      priority: "high",
      title: {
        en: "Publish your menu, catalog or prices in visitors' languages",
        tr: "Menünüzü, kataloğunuzu veya fiyatlarınızı ziyaretçilerin dillerinde yayınlayın",
      },
      why: {
        en: "Engines answer in the visitor's language and prefer pages written in it. One language means you're invisible in the others.",
        tr: "Motorlar ziyaretçinin dilinde yanıt verir ve o dilde yazılmış sayfaları tercih eder. Tek dil, diğer dillerde görünmez olmak demektir.",
      },
    },
  },
  {
    applies: (c) => failed(c, "whatsapp"),
    fix: {
      key: "whatsapp",
      pillar: 3,
      priority: "medium",
      title: {
        en: "Add a pre-filled WhatsApp button",
        tr: "Önceden doldurulmuş bir WhatsApp butonu ekleyin",
      },
      why: {
        en: "International visitors message rather than call. A ready-written message in their language removes the hardest step.",
        tr: "Uluslararası ziyaretçiler aramak yerine mesaj atar. Kendi dillerinde hazır yazılmış bir mesaj en zor adımı ortadan kaldırır.",
      },
    },
  },
  {
    applies: (c) => c.vertical === "clinic" && c.visibility < 45,
    fix: {
      key: "clinicPortal",
      pillar: 3,
      priority: "medium",
      title: {
        en: "Turn each treatment into a clear package page",
        tr: "Her tedaviyi açık bir paket sayfasına dönüştürün",
      },
      why: {
        en: "Patients abroad compare day-by-day plans and from-prices. A package page with a roadmap and FAQ is what engines and patients quote.",
        tr: "Yurt dışındaki hastalar gün gün planları ve başlangıç fiyatlarını karşılaştırır. Yol haritası ve SSS içeren bir paket sayfası, motorların ve hastaların alıntıladığı şeydir.",
      },
    },
  },
  {
    applies: (c) => failed(c, "rating") || absentShare(c) > 0.6,
    fix: {
      key: "reviews",
      pillar: 5,
      priority: "medium",
      title: {
        en: "Ask every happy visitor for a review, at the right moment",
        tr: "Her memnun ziyaretçiden doğru anda yorum isteyin",
      },
      why: {
        en: "Ratings and recent reviews decide who gets recommended. An NFC or QR stand at the till or chair turns visits into reviews.",
        tr: "Kimin önerileceğini puanlar ve güncel yorumlar belirler. Kasada veya koltuk yanında bir NFC ya da QR standı ziyaretleri yoruma dönüştürür.",
      },
    },
  },
  {
    applies: (c) => c.vertical !== "retail" || absentShare(c) > 0.5,
    fix: {
      key: "wayfinding",
      pillar: 4,
      priority: "low",
      title: {
        en: "Show visitors how to find you",
        tr: "Ziyaretçilere sizi nasıl bulacaklarını gösterin",
      },
      why: {
        en: "A short wayfinding video and real photos cut no-shows and give engines fresh, first-party media to link to.",
        tr: "Kısa bir yol tarifi videosu ve gerçek fotoğraflar gelmeyenleri azaltır ve motorlara bağlantı verebilecekleri güncel, size ait medya sunar.",
      },
    },
  },
  {
    applies: (c) => failed(c, "speed") || failed(c, "reachable"),
    fix: {
      key: "speed",
      pillar: 1,
      priority: "low",
      title: {
        en: "Make the site fast on roaming mobile data",
        tr: "Siteyi dolaşımdaki mobil veride hızlı hâle getirin",
      },
      why: {
        en: "Visitors open your page on slow roaming connections, and crawlers give up on slow pages too.",
        tr: "Ziyaretçiler sayfanızı yavaş dolaşım bağlantılarında açar; tarayıcı botlar da yavaş sayfalardan vazgeçer.",
      },
    },
  },
];

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 } as const;

/** Map every gap to the agency service that closes it. */
export function buildFixList(ctx: Context): Fix[] {
  return RULES.filter((r) => r.applies(ctx))
    .map((r) => r.fix)
    .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] || a.pillar - b.pillar);
}
