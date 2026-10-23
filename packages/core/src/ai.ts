import type { Locale, Vertical } from "./types.ts";

export const REPLY_TONES = ["warm", "factual", "apologetic"] as const;
export type ReplyTone = (typeof REPLY_TONES)[number];

export interface DraftReplyInput {
  review: { author: string; rating: number; lang: Locale; text: string };
  business: { name: string; vertical: Vertical; email: string; whatsapp: string };
  tone: ReplyTone;
}

export interface TranslationSuggestion {
  text: string;
  /** Always true for machine output: a person checks it before it goes public. */
  needsReview: true;
  provider: string;
}

/**
 * The one seam where mocked AI is swapped for real calls (Workers AI or engine APIs).
 * Everything that drafts or translates goes through this interface.
 */
export interface AiProvider {
  readonly name: string;
  draftReply(input: DraftReplyInput): Promise<string>;
  suggestTranslation(input: {
    text: string;
    from: Locale;
    to: Locale;
  }): Promise<TranslationSuggestion>;
}

// ---------------------------------------------------------------------------
// Reply rules: applied to every draft, mocked or real.

const CLINIC_TERMS = [
  "patient",
  "treatment",
  "procedure",
  "implant",
  "veneer",
  "whitening",
  "crown",
  "surgery",
  "appointment",
  "your visit",
  "hasta",
  "tedavi",
  "işlem",
  "kaplama",
  "beyazlatma",
  "randevu",
  "ziyaret",
];
const ARGUING_TERMS = [
  "you are wrong",
  "you're wrong",
  "not true",
  "untrue",
  "a lie",
  "fake review",
  "haksız",
  "yalan",
  "doğru değil",
  "asılsız",
];

export type ReplyRuleViolation = "mentionsTreatment" | "argues" | "noDirectContact";

export function checkReplyRules(
  text: string,
  ctx: { vertical: Vertical; email: string; whatsapp: string },
): ReplyRuleViolation[] {
  const lower = text.toLocaleLowerCase("tr");
  const violations: ReplyRuleViolation[] = [];
  if (ctx.vertical === "clinic" && CLINIC_TERMS.some((t) => lower.includes(t))) {
    violations.push("mentionsTreatment");
  }
  if (ARGUING_TERMS.some((t) => lower.includes(t))) violations.push("argues");
  const digits = ctx.whatsapp.replace(/[^\d]/g, "");
  const hasContact =
    lower.includes(ctx.email.toLowerCase()) ||
    text.replace(/[^\d]/g, "").includes(digits.slice(-7));
  if (!hasContact) violations.push("noDirectContact");
  return violations;
}

// ---------------------------------------------------------------------------
// Mock provider: deterministic templates, clearly labelled in the UI.

type Band = "positive" | "negative";

const REPLIES: Record<Locale, Record<ReplyTone, Record<Band, string>>> = {
  en: {
    warm: {
      positive:
        "Dear {author}, thank you so much for your lovely words. It means a lot to the whole team at {name}. If there's ever anything we can do for you, write to us at {email} or on WhatsApp {whatsapp}. We hope to welcome you again soon.",
      negative:
        "Dear {author}, thank you for telling us. We're sorry it fell short of what you hoped for, and we'd really like to make it right. Please reach us directly at {email} or on WhatsApp {whatsapp} so we can talk it through.",
    },
    factual: {
      positive:
        "Thank you for your review, {author}. We've shared it with the team at {name}. For anything else, you can reach us at {email} or on WhatsApp {whatsapp}.",
      negative:
        "Thank you for your feedback, {author}. We've passed it to the team at {name} and are looking into it. Please contact us directly at {email} or on WhatsApp {whatsapp} with any details.",
    },
    apologetic: {
      positive:
        "Thank you, {author}. We're glad you took the time to write, and we're always working to do better. If anything could have been smoother, tell us at {email} or on WhatsApp {whatsapp}.",
      negative:
        "Dear {author}, we're truly sorry. This isn't the experience we want anyone to have at {name}. We would welcome the chance to put it right: please contact us at {email} or on WhatsApp {whatsapp}.",
    },
  },
  tr: {
    warm: {
      positive:
        "Sevgili {author}, güzel sözleriniz için çok teşekkür ederiz. {name} ekibinin tamamını çok mutlu etti. Size yardımcı olabileceğimiz her konuda {email} adresinden ya da WhatsApp {whatsapp} numarasından bize yazabilirsiniz. Sizi yeniden ağırlamayı umuyoruz.",
      negative:
        "Sevgili {author}, bize yazdığınız için teşekkür ederiz. Beklentinizi karşılayamadığımız için üzgünüz ve bunu telafi etmek isteriz. Konuşabilmemiz için lütfen {email} adresinden ya da WhatsApp {whatsapp} numarasından doğrudan bize ulaşın.",
    },
    factual: {
      positive:
        "Yorumunuz için teşekkürler, {author}. {name} ekibiyle paylaştık. Başka bir konuda {email} adresinden ya da WhatsApp {whatsapp} numarasından bize ulaşabilirsiniz.",
      negative:
        "Geri bildiriminiz için teşekkürler, {author}. {name} ekibine ilettik ve inceliyoruz. Ayrıntılar için lütfen {email} adresinden ya da WhatsApp {whatsapp} numarasından doğrudan bize ulaşın.",
    },
    apologetic: {
      positive:
        "Teşekkür ederiz, {author}. Yazmaya zaman ayırdığınız için mutluyuz ve her zaman daha iyisi için çalışıyoruz. Daha iyi olabilecek bir şey varsa {email} adresinden ya da WhatsApp {whatsapp} numarasından bize iletin.",
      negative:
        "Sevgili {author}, gerçekten çok üzgünüz. {name}'de kimsenin böyle bir deneyim yaşamasını istemeyiz. Durumu düzeltme fırsatı bulmak isteriz: lütfen {email} adresinden ya da WhatsApp {whatsapp} numarasından bize ulaşın.",
    },
  },
};

const EN_TR: Record<string, string> = {
  coffee: "kahve",
  tea: "çay",
  turkish: "Türk",
  breakfast: "kahvaltı",
  cheese: "peynir",
  egg: "yumurta",
  eggs: "yumurta",
  chicken: "tavuk",
  salad: "salata",
  soup: "çorba",
  lentil: "mercimek",
  water: "su",
  lemonade: "limonata",
  fresh: "taze",
  orange: "portakal",
  juice: "suyu",
  cake: "kek",
  chocolate: "çikolata",
  with: "ile",
  and: "ve",
  honey: "bal",
  bread: "ekmek",
  dress: "elbise",
  shirt: "gömlek",
  linen: "keten",
  cotton: "pamuk",
  silk: "ipek",
  blend: "karışım",
  trousers: "pantolon",
  jacket: "ceket",
  scarf: "eşarp",
  teeth: "diş",
  tooth: "diş",
  whitening: "beyazlatma",
  cleaning: "temizliği",
  check: "kontrol",
  "x-ray": "röntgen",
};
const TR_EN: Record<string, string> = Object.fromEntries(
  Object.entries(EN_TR).map(([a, b]) => [b, a]),
);

export class MockAiProvider implements AiProvider {
  readonly name = "mock";

  async draftReply({ review, business, tone }: DraftReplyInput): Promise<string> {
    const band: Band = review.rating >= 4 ? "positive" : "negative";
    const lang: Locale = review.lang === "tr" ? "tr" : "en";
    const template = REPLIES[lang][tone][band];
    return template
      .replaceAll("{author}", review.author.split(" ")[0] ?? review.author)
      .replaceAll("{name}", business.name)
      .replaceAll("{email}", business.email)
      .replaceAll("{whatsapp}", business.whatsapp);
  }

  async suggestTranslation({
    text,
    from,
    to,
  }: {
    text: string;
    from: Locale;
    to: Locale;
  }): Promise<TranslationSuggestion> {
    const dict = from === "en" && to === "tr" ? EN_TR : from === "tr" && to === "en" ? TR_EN : {};
    const out = text.replace(/[\p{L}-]+/gu, (word) => {
      const hit = dict[word.toLocaleLowerCase(from)];
      if (!hit) return word;
      return word[0] === word[0]?.toLocaleUpperCase(from)
        ? hit[0]!.toLocaleUpperCase(to) + hit.slice(1)
        : hit;
    });
    return { text: out, needsReview: true, provider: this.name };
  }
}
