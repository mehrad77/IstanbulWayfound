import type { Localized, Vertical } from "../types.ts";

export interface PromptTemplate {
  id: string;
  text: Localized;
}

/**
 * Tourist-style questions per vertical. `{district}` is filled from the audit form.
 * 12 per vertical; the doc asks for 10–15.
 */
export const PROMPT_TEMPLATES: Record<Vertical, PromptTemplate[]> = {
  dining: [
    {
      id: "d01",
      text: {
        en: "Best café with outdoor seating in {district}",
        tr: "{district} civarında açık oturma alanı olan en iyi kafe",
      },
    },
    {
      id: "d02",
      text: {
        en: "Where can I get a good Turkish breakfast near {district}?",
        tr: "{district} yakınında nerede iyi bir serpme kahvaltı yapılır?",
      },
    },
    {
      id: "d03",
      text: {
        en: "Halal restaurant with an English menu in {district}",
        tr: "{district} civarında İngilizce menüsü olan helal restoran",
      },
    },
    {
      id: "d04",
      text: {
        en: "Vegan-friendly places to eat in {district}, Istanbul",
        tr: "{district}, İstanbul'da vegan dostu yemek yerleri",
      },
    },
    {
      id: "d05",
      text: {
        en: "Quiet café to work from in {district} with wifi",
        tr: "{district} civarında wifi olan, çalışmak için sakin kafe",
      },
    },
    {
      id: "d06",
      text: {
        en: "Gluten-free options near {district}",
        tr: "{district} yakınında glütensiz seçenekler",
      },
    },
    {
      id: "d07",
      text: {
        en: "Where do locals eat in {district}?",
        tr: "{district} civarında yerliler nerede yemek yiyor?",
      },
    },
    {
      id: "d08",
      text: {
        en: "Family-friendly restaurant in {district} open late",
        tr: "{district} civarında geç saate kadar açık, aile dostu restoran",
      },
    },
    {
      id: "d09",
      text: {
        en: "Best Turkish coffee in {district}",
        tr: "{district} civarındaki en iyi Türk kahvesi",
      },
    },
    {
      id: "d10",
      text: {
        en: "Restaurant in {district} that takes WhatsApp reservations",
        tr: "{district} civarında WhatsApp'tan rezervasyon alan restoran",
      },
    },
    {
      id: "d11",
      text: {
        en: "Affordable lunch spot in {district} for tourists",
        tr: "{district} civarında turistler için uygun fiyatlı öğle yemeği yeri",
      },
    },
    {
      id: "d12",
      text: {
        en: "Café with desserts and baklava in {district}",
        tr: "{district} civarında tatlı ve baklava olan kafe",
      },
    },
  ],
  retail: [
    {
      id: "r01",
      text: {
        en: "Textile wholesale showroom in {district} that ships abroad",
        tr: "{district} civarında yurt dışına gönderim yapan toptan tekstil showroomu",
      },
    },
    {
      id: "r02",
      text: {
        en: "Where to buy women's clothing wholesale in {district}?",
        tr: "{district} civarında toptan kadın giyim nereden alınır?",
      },
    },
    {
      id: "r03",
      text: {
        en: "Showroom in {district} with English-speaking staff",
        tr: "{district} civarında İngilizce konuşan personeli olan showroom",
      },
    },
    {
      id: "r04",
      text: {
        en: "Low minimum order clothing supplier in Istanbul",
        tr: "İstanbul'da düşük minimum siparişli giyim tedarikçisi",
      },
    },
    {
      id: "r05",
      text: {
        en: "Best boutique in {district} for modest fashion",
        tr: "{district} civarında tesettür modası için en iyi butik",
      },
    },
    {
      id: "r06",
      text: {
        en: "Linen and cotton fabric supplier near {district}",
        tr: "{district} yakınında keten ve pamuk kumaş tedarikçisi",
      },
    },
    {
      id: "r07",
      text: {
        en: "Osmanbey wholesale shops that accept card payments",
        tr: "Kredi kartı kabul eden Osmanbey toptancıları",
      },
    },
    {
      id: "r08",
      text: {
        en: "Turkish clothing brand showroom I can visit in {district}",
        tr: "{district} civarında ziyaret edebileceğim Türk giyim markası showroomu",
      },
    },
    {
      id: "r09",
      text: {
        en: "Where do boutique owners from abroad buy stock in Istanbul?",
        tr: "Yurt dışındaki butik sahipleri İstanbul'da nereden mal alıyor?",
      },
    },
    {
      id: "r10",
      text: {
        en: "Showroom in {district} with a WhatsApp catalog",
        tr: "{district} civarında WhatsApp kataloğu olan showroom",
      },
    },
    {
      id: "r11",
      text: {
        en: "Private label clothing manufacturer near {district}",
        tr: "{district} yakınında özel etiket giyim üreticisi",
      },
    },
    {
      id: "r12",
      text: {
        en: "Trustworthy wholesale supplier in {district} with reviews",
        tr: "{district} civarında yorumları olan güvenilir toptancı",
      },
    },
  ],
  clinic: [
    {
      id: "c01",
      text: {
        en: "English-speaking dentist near {district} metro",
        tr: "{district} metrosu yakınında İngilizce konuşan diş hekimi",
      },
    },
    {
      id: "c02",
      text: {
        en: "Best clinic for dental implants in Istanbul for foreigners",
        tr: "İstanbul'da yabancılar için en iyi implant kliniği",
      },
    },
    {
      id: "c03",
      text: {
        en: "How much do veneers cost in Istanbul, and which clinic is trusted?",
        tr: "İstanbul'da diş kaplama ne kadar, hangi klinik güvenilir?",
      },
    },
    {
      id: "c04",
      text: {
        en: "Dental clinic in {district} with airport transfer and hotel",
        tr: "{district} civarında havalimanı transferi ve oteli olan diş kliniği",
      },
    },
    {
      id: "c05",
      text: {
        en: "Teeth whitening in {district}, same day",
        tr: "{district} civarında aynı gün diş beyazlatma",
      },
    },
    {
      id: "c06",
      text: {
        en: "Arabic-speaking dentist in Istanbul",
        tr: "İstanbul'da Arapça konuşan diş hekimi",
      },
    },
    {
      id: "c07",
      text: {
        en: "Dental holiday package Istanbul with aftercare",
        tr: "İstanbul'da tedavi sonrası takibi olan diş tatili paketi",
      },
    },
    {
      id: "c08",
      text: {
        en: "Which Istanbul dental clinics have good reviews from UK patients?",
        tr: "İngiltere'den gelen hastaların iyi yorum yaptığı İstanbul diş klinikleri hangileri?",
      },
    },
    {
      id: "c09",
      text: {
        en: "Emergency dentist in {district} for tourists",
        tr: "{district} civarında turistler için acil diş hekimi",
      },
    },
    {
      id: "c10",
      text: {
        en: "Clinic in {district} that answers on WhatsApp",
        tr: "{district} civarında WhatsApp'tan yanıt veren klinik",
      },
    },
    {
      id: "c11",
      text: {
        en: "All-on-4 implants Istanbul price and recovery time",
        tr: "İstanbul'da All-on-4 implant fiyatı ve iyileşme süresi",
      },
    },
    {
      id: "c12",
      text: {
        en: "Is it safe to get dental work done in {district}?",
        tr: "{district} civarında diş tedavisi yaptırmak güvenli mi?",
      },
    },
  ],
};

export interface AuditPrompt {
  templateId: string;
  lang: "en" | "tr";
  text: string;
}

export const MAX_PROMPTS = 15;

/** Render the vertical's templates for the chosen languages, English first, capped at 15. */
export function buildPromptSet(
  vertical: Vertical,
  district: string,
  languages: readonly ("en" | "tr")[],
): AuditPrompt[] {
  const langs: ("en" | "tr")[] = languages.length ? [...languages] : ["en"];
  langs.sort((a, b) => (a === "en" ? -1 : b === "en" ? 1 : 0));
  const templates = PROMPT_TEMPLATES[vertical];
  const out: AuditPrompt[] = [];
  if (langs.length === 1) {
    const lang = langs[0]!;
    for (const tpl of templates) out.push(render(tpl, lang, district));
  } else {
    // Both languages: every template in English, plus Turkish for the first few up to the cap.
    for (const tpl of templates) out.push(render(tpl, "en", district));
    for (const tpl of templates.slice(0, Math.max(0, MAX_PROMPTS - out.length))) {
      out.push(render(tpl, "tr", district));
    }
  }
  return out.slice(0, MAX_PROMPTS);
}

function render(tpl: PromptTemplate, lang: "en" | "tr", district: string): AuditPrompt {
  return { templateId: tpl.id, lang, text: tpl.text[lang].replaceAll("{district}", district) };
}
