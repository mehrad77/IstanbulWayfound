import type { Faq } from "./content-types.ts";

const L = (en: string, tr: string) => ({ en, tr });

export const nav = {
  audit: L("Free AI audit", "Ücretsiz yapay zekâ denetimi"),
  services: L("Services", "Hizmetler"),
  industries: L("Industries", "Sektörler"),
  how: L("How we work", "Nasıl çalışıyoruz"),
  demos: L("Live demos", "Canlı demolar"),
  about: L("About and contact", "Hakkımızda ve iletişim"),
  book: L("Book a call", "Görüşme ayarlayın"),
};

export const home = {
  title: L(
    "Get found by international visitors and AI answer engines",
    "Uluslararası ziyaretçiler ve yapay zekâ yanıt motorları sizi bulsun",
  ),
  description: L(
    "Wayfound helps Istanbul clinics, restaurants, cafés, boutiques and showrooms get found and chosen by international visitors on maps, directories and AI engines like ChatGPT, Perplexity and Google AI Overviews.",
    "Wayfound, İstanbul'daki kliniklerin, restoranların, kafelerin, butiklerin ve showroomların haritalarda, dizinlerde ve ChatGPT, Perplexity ve Google Yapay Zekâ Özetleri gibi motorlarda uluslararası ziyaretçiler tarafından bulunmasına ve tercih edilmesine yardımcı olur.",
  ),
  eyebrow: L(
    "For Istanbul businesses that serve visitors",
    "Ziyaretçi ağırlayan İstanbul işletmeleri için",
  ),
  hero: L(
    "When tourists ask AI where to go, be the answer",
    "Turistler yapay zekâya nereye gideceğini sorduğunda, yanıt siz olun",
  ),
  heroLead: L(
    "We make your business easy to find, understand and choose for visitors from abroad: in ChatGPT and Google's AI answers, on every map they use, and on the page they open when they scan your QR code.",
    "İşletmenizi yurt dışından gelen ziyaretçiler için kolay bulunur, anlaşılır ve tercih edilir hâle getiriyoruz: ChatGPT'de ve Google'ın yapay zekâ yanıtlarında, kullandıkları her haritada ve QR kodunuzu okuttuklarında açılan sayfada.",
  ),
  auditCta: L(
    "See how AI answers about your area",
    "Yapay zekânın bölgeniz hakkında ne yanıtladığını görün",
  ),
  verticalsTitle: L("Built for three kinds of business", "Üç tür işletme için tasarlandı"),
  pillarsTitle: L("Five things we do", "Yaptığımız beş şey"),
  modelsTitle: L("Two ways to work with us", "Bizimle çalışmanın iki yolu"),
  demosTitle: L("Click through the demo", "Demoyu tıklayarak gezin"),
  demosLead: L(
    "Three invented businesses, one per industry, show every app end to end. Everything works except the AI engine answers, which are clearly labelled sample data.",
    "Her sektörden bir tane olmak üzere üç uydurma işletme, tüm uygulamaları baştan sona gösteriyor. Yapay zekâ motoru yanıtları dışında her şey çalışıyor; bu yanıtlar açıkça örnek veri olarak etiketli.",
  ),
  faqTitle: L("Questions owners ask", "İşletme sahiplerinin sorduğu sorular"),
};

export const models = [
  {
    key: "virtual",
    name: L("Pure Virtual", "Tamamen Sanal"),
    lead: L("Everything we can do remotely.", "Uzaktan yapabildiğimiz her şey."),
    items: [
      L("GEO audit, schema and FAQ content", "GEO denetimi, şema ve SSS içeriği"),
      L("Map and directory listings", "Harita ve dizin kayıtları"),
      L("QR menu, catalog or clinic portal", "QR menü, katalog veya klinik portalı"),
      L(
        "Review page, print-ready artwork, Reputation Desk",
        "Yorum sayfası, baskıya hazır tasarımlar, İtibar Masası",
      ),
    ],
    note: L(
      "Review stands are printed by a local vendor from our artwork.",
      "Yorum standları tasarımlarımızdan yerel bir matbaa tarafından basılır.",
    ),
  },
  {
    key: "turnkey",
    name: L("Full-Stack Turnkey", "Anahtar Teslim"),
    lead: L(
      "Everything in Pure Virtual, plus our team on site.",
      "Tamamen Sanal'daki her şey, artı yerinde ekibimiz.",
    ),
    items: [
      L("Photography and 360° tour", "Fotoğraf çekimi ve 360° tur"),
      L("Wayfinding video from the metro to your door", "Metrodan kapınıza yol tarifi videosu"),
      L(
        "Installed NFC stands and staff briefing",
        "Kurulumu yapılmış NFC standları ve personel bilgilendirmesi",
      ),
      L("Staff phrase cards", "Personel ifade kartları"),
    ],
    note: L(
      "For businesses that want it all done for them.",
      "Her şeyin kendileri için yapılmasını isteyen işletmeler için.",
    ),
  },
];

export const tiers = [
  {
    name: L("Tier 1 · Fully remote", "1. kademe · Tamamen uzaktan"),
    what: L(
      "GEO, schema, FAQ, listings, menus and portals, the Reputation Desk.",
      "GEO, şema, SSS, kayıtlar, menüler ve portallar, İtibar Masası.",
    ),
  },
  {
    name: L("Tier 2 · Remote with a local vendor", "2. kademe · Uzaktan + yerel tedarikçi"),
    what: L(
      "Review stands, tap cards, table tents and staff cards, printed from our files.",
      "Yorum standları, dokunmatik kartlar, masa kartları ve personel kartları; dosyalarımızdan basılır.",
    ),
  },
  {
    name: L("Tier 3 · On-site", "3. kademe · Yerinde"),
    what: L(
      "Photography, 360° tours and wayfinding video.",
      "Fotoğraf, 360° turlar ve yol tarifi videoları.",
    ),
  },
];

export const homeFaqs: Faq[] = [
  {
    q: L("How do I get recommended by ChatGPT?", "ChatGPT'nin beni önermesini nasıl sağlarım?"),
    a: L(
      "AI engines recommend places they can confirm from several trusted sources. Publish complete structured data on your own site, answer common visitor questions in short, clear paragraphs, keep map listings accurate, and get mentioned on the guides and forums the engines cite for your area. Then check the answers regularly.",
      "Yapay zekâ motorları, birkaç güvenilir kaynaktan doğrulayabildikleri yerleri önerir. Kendi sitenizde eksiksiz yapılandırılmış veri yayınlayın, sık sorulan ziyaretçi sorularını kısa ve net paragraflarla yanıtlayın, harita kayıtlarınızı doğru tutun ve motorların bölgeniz için gösterdiği rehber ve forumlarda adınızın geçmesini sağlayın. Ardından yanıtları düzenli kontrol edin.",
    ),
  },
  {
    q: L(
      "What does the free AI Visibility Audit check?",
      "Ücretsiz Yapay Zekâ Görünürlük Denetimi neyi kontrol eder?",
    ),
    a: L(
      "It builds 12 to 15 questions tourists ask about your type of business and area, shows how often you appear in the answers, who is recommended instead and which sources are cited, then checks your website for the structured data and FAQ content AI engines read. In this demo the engine answers are sample data.",
      "İşletme türünüz ve bölgeniz hakkında turistlerin sorduğu 12–15 soru oluşturur; yanıtlarda ne sıklıkla yer aldığınızı, onun yerine kimin önerildiğini ve hangi kaynakların gösterildiğini gösterir, ardından web sitenizi yapay zekâ motorlarının okuduğu yapılandırılmış veri ve SSS içeriği açısından kontrol eder. Bu demoda motor yanıtları örnek veridir.",
    ),
  },
  {
    q: L("Do I need a new website?", "Yeni bir web sitesine ihtiyacım var mı?"),
    a: L(
      "Usually not. Your Business Profile with us powers fast visitor pages (menu, catalog or treatment packages) with full structured data, and we can add the same data to your existing site. Most businesses keep their site and link to the visitor pages from their QR codes and listings.",
      "Genellikle hayır. Bizdeki İşletme Profiliniz, eksiksiz yapılandırılmış veriye sahip hızlı ziyaretçi sayfalarını (menü, katalog veya tedavi paketleri) besler; aynı veriyi mevcut sitenize de ekleyebiliriz. Çoğu işletme sitesini korur ve QR kodlarından ve kayıtlarından ziyaretçi sayfalarına bağlantı verir.",
    ),
  },
  {
    q: L("How much does it cost?", "Ücreti ne kadar?"),
    a: L(
      "Packages depend on how many locations you have, which services you need and whether you want our on-site team. Run the free audit or message us on WhatsApp, and we'll send a written proposal for your business. There's no long contract to start.",
      "Paketler şube sayınıza, ihtiyacınız olan hizmetlere ve yerinde ekibimizi isteyip istemediğinize göre değişir. Ücretsiz denetimi başlatın veya bize WhatsApp'tan yazın; işletmeniz için yazılı bir teklif gönderelim. Başlamak için uzun bir sözleşme gerekmez.",
    ),
  },
];

export const about = {
  title: L("About and contact", "Hakkımızda ve iletişim"),
  lead: L(
    "Wayfound is an Istanbul agency that helps local businesses get found and chosen by international visitors. We work in English and Turkish, mostly remotely, with an on-site team for photography and video.",
    "Wayfound, yerel işletmelerin uluslararası ziyaretçiler tarafından bulunmasına ve tercih edilmesine yardımcı olan bir İstanbul ajansıdır. Çoğunlukla uzaktan, İngilizce ve Türkçe çalışıyoruz; fotoğraf ve video için yerinde bir ekibimiz var.",
  ),
  pricing: L(
    "Packages are priced per business. Contact us for a proposal.",
    "Paketler işletmeye göre fiyatlandırılır. Teklif için bizimle iletişime geçin.",
  ),
};

export const how = {
  title: L("How we work", "Nasıl çalışıyoruz"),
  lead: L(
    "Most of the work is remote. You choose whether our team also comes on site.",
    "İşin çoğu uzaktan yapılır. Ekibimizin yerinde de çalışıp çalışmayacağına siz karar verirsiniz.",
  ),
  tiersTitle: L("What can be done remotely", "Neler uzaktan yapılabilir"),
  steps: [
    L(
      "Free audit: see where you stand in AI answers and on maps.",
      "Ücretsiz denetim: yapay zekâ yanıtlarında ve haritalarda nerede olduğunuzu görün.",
    ),
    L(
      "Business Profile: we enter your facts once, in English and Turkish.",
      "İşletme Profili: bilgilerinizi bir kez, İngilizce ve Türkçe olarak giriyoruz.",
    ),
    L(
      "Publish: visitor pages, schema, listings and review stands go live.",
      "Yayın: ziyaretçi sayfaları, şema, kayıtlar ve yorum standları yayına girer.",
    ),
    L(
      "Monthly: we re-check the answers, answer reviews with you and report.",
      "Her ay: yanıtları yeniden kontrol eder, yorumları sizinle birlikte yanıtlar ve raporlarız.",
    ),
  ],
};

export const demos = {
  title: L("Live demos", "Canlı demolar"),
  lead: L(
    "Open these on your phone. The businesses are invented, but the pages, admin and schema are real and run on the same system a client gets.",
    "Bunları telefonunuzda açın. İşletmeler uydurmadır ama sayfalar, yönetim paneli ve şema gerçektir ve bir müşterinin kullanacağı sistemin aynısında çalışır.",
  ),
  console: L("Owner console (demo sign-in)", "İşletme paneli (demo girişi)"),
};
