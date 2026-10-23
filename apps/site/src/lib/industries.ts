import type { IndustryPage } from "./content-types.ts";

const L = (en: string, tr: string) => ({ en, tr });

export const industries: IndustryPage[] = [
  {
    vertical: "clinic",
    slug: "clinics",
    title: L("Clinics", "Klinikler"),
    lead: L(
      "Patients abroad choose a clinic before they book a flight. Be the one the answer engines name, with a plan they can trust.",
      "Yurt dışındaki hastalar uçak bileti almadan önce kliniğini seçer. Yanıt motorlarının adını verdiği ve planına güvenilen klinik siz olun.",
    ),
    pains: [
      L(
        "Patients compare clinics in ChatGPT and on Reddit before they ever reach your website.",
        "Hastalar web sitenize gelmeden önce klinikleri ChatGPT'de ve Reddit'te karşılaştırıyor.",
      ),
      L(
        "Prices and day-by-day plans are vague, so serious patients hesitate.",
        "Fiyatlar ve gün gün planlar belirsiz; bu yüzden ciddi hastalar tereddüt ediyor.",
      ),
      L(
        "Inquiries arrive in five languages across WhatsApp, email and Instagram.",
        "Talepler beş farklı dilde WhatsApp, e-posta ve Instagram'dan geliyor.",
      ),
      L(
        "One unanswered bad review costs more than a month of ads.",
        "Yanıtsız kalan tek bir kötü yorum, bir aylık reklamdan daha pahalıya patlıyor.",
      ),
    ],
    demoSlug: "defne-dental",
    demoName: "Defne Dental Clinic",
    demoLinks: [
      {
        label: L("Implant package page", "İmplant paket sayfası"),
        path: "/c/defne-dental/implants-6-day",
      },
      { label: L("Price list", "Fiyat listesi"), path: "/m/defne-dental" },
      { label: L("Review page", "Yorum sayfası"), path: "/r/defne-dental" },
    ],
    faqs: [
      {
        q: L(
          "Can you advertise treatments to foreign patients from Turkey?",
          "Türkiye'den yabancı hastalara tedavi tanıtımı yapılabilir mi?",
        ),
        a: L(
          "Yes, within Turkish health-advertising rules and the patient's home-country rules. We keep pages factual: what's included, how long it takes, who does it and from-prices. We avoid before-and-after claims and guarantees of outcome, and get legal review before a clinic goes live.",
          "Evet, Türk sağlık reklamı kuralları ve hastanın kendi ülkesinin kuralları çerçevesinde. Sayfaları bilgilendirici tutuyoruz: pakete neyin dahil olduğu, ne kadar sürdüğü, kimin yaptığı ve başlangıç fiyatları. Önce-sonra iddialarından ve sonuç garantilerinden kaçınıyor, klinik yayına girmeden hukuki inceleme yaptırıyoruz.",
        ),
      },
    ],
  },
  {
    vertical: "dining",
    slug: "restaurants-cafes",
    title: L("Restaurants and cafés", "Restoran ve kafeler"),
    lead: L(
      "Visitors ask their phone where to eat right now. Show up with a menu they can read, prices they understand and a table they can book on WhatsApp.",
      "Ziyaretçiler telefonlarına şu an nerede yemek yiyeceklerini soruyor. Okuyabilecekleri bir menü, anlayabilecekleri fiyatlar ve WhatsApp'tan ayırtabilecekleri bir masayla karşılarına çıkın.",
    ),
    pains: [
      L(
        "A PDF menu in Turkish only, with no way to tell what's halal, vegan or safe for allergies.",
        "Yalnızca Türkçe bir PDF menü; neyin helal, vegan ya da alerjiler için güvenli olduğunu anlamanın yolu yok.",
      ),
      L(
        "Tourists can't judge lira prices, so they walk on to a place that shows euros.",
        "Turistler lira fiyatlarını kestiremiyor ve euro gösteren bir yere yürüyüp gidiyor.",
      ),
      L(
        "AI answers recommend the same few places, and you're not one of them.",
        "Yapay zekâ yanıtları hep aynı birkaç yeri öneriyor ve siz aralarında değilsiniz.",
      ),
      L(
        "Happy guests leave without reviewing; unhappy ones always do.",
        "Memnun misafirler yorum yapmadan gidiyor; memnun olmayanlar ise mutlaka yazıyor.",
      ),
    ],
    demoSlug: "cafe-lale",
    demoName: "Café Lale",
    demoLinks: [
      { label: L("QR menu", "QR menü"), path: "/m/cafe-lale" },
      { label: L("Review page", "Yorum sayfası"), path: "/r/cafe-lale" },
    ],
    faqs: [
      {
        q: L("Will a QR menu replace my printed menu?", "QR menü basılı menümün yerini alır mı?"),
        a: L(
          "It works alongside it. Many guests still like paper, but visitors who don't read Turkish scan the code to see dishes in their language, filter by diet or allergy and check prices in their own currency. Your staff spend less time translating and more time serving.",
          "Basılı menünün yanında çalışır. Birçok misafir hâlâ kâğıdı sever; ama Türkçe bilmeyen ziyaretçiler kodu okutup yemekleri kendi dillerinde görür, diyete veya alerjiye göre filtreler ve fiyatları kendi para birimlerinde kontrol eder. Personeliniz çeviriye daha az, servise daha çok zaman ayırır.",
        ),
      },
    ],
  },
  {
    vertical: "retail",
    slug: "boutiques-showrooms",
    title: L("Boutiques and showrooms", "Butik ve showroomlar"),
    lead: L(
      "Buyers from the Gulf, Central Asia and Europe plan their Osmanbey trip online. Make your catalog the one they find and message first.",
      "Körfez'den, Orta Asya'dan ve Avrupa'dan gelen alıcılar Osmanbey gezilerini internetten planlıyor. İlk bulup mesaj attıkları katalog sizinki olsun.",
    ),
    pains: [
      L(
        "Buyers can't see your range, minimums or sizes until they find the shop.",
        "Alıcılar dükkânı bulana kadar ürün yelpazenizi, minimum adetlerinizi veya bedenlerinizi göremiyor.",
      ),
      L(
        "Wholesale price questions come in Arabic and Russian, and answers take hours.",
        "Toptan fiyat soruları Arapça ve Rusça geliyor; yanıtlar saatler sürüyor.",
      ),
      L(
        "You're missing on Yandex and Apple Maps, where many of these buyers look.",
        "Bu alıcıların çoğunun baktığı Yandex ve Apple Haritalar'da yoksunuz.",
      ),
      L(
        "Showroom entrances on upper floors are hard to find.",
        "Üst katlardaki showroom girişlerini bulmak zor.",
      ),
    ],
    demoSlug: "selvi-showroom",
    demoName: "Selvi Textile Showroom",
    demoLinks: [
      { label: L("Catalog", "Katalog"), path: "/m/selvi-showroom" },
      { label: L("Review page", "Yorum sayfası"), path: "/r/selvi-showroom" },
    ],
    faqs: [
      {
        q: L(
          "Can buyers request a quote for a specific item?",
          "Alıcılar belirli bir ürün için teklif isteyebilir mi?",
        ),
        a: L(
          'Yes. Every product in the catalog has its own code and a "Request a quote" button that opens WhatsApp with a message like "I\'d like a quote for item A12 (linen midi dress)" in the buyer\'s language, so you know exactly what they mean.',
          'Evet. Katalogdaki her ürünün kendi kodu ve alıcının dilinde "A12 ürünü (keten midi elbise) için teklif almak istiyorum" gibi bir mesajla WhatsApp\'ı açan bir "Teklif isteyin" butonu vardır; böylece tam olarak neyi kastettiklerini bilirsiniz.',
        ),
      },
    ],
  },
];
