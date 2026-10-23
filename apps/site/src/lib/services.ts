import type { ServicePage } from "./content-types.ts";

const L = (en: string, tr: string) => ({ en, tr });

export const services: ServicePage[] = [
  {
    pillar: 1,
    slug: "geo",
    title: L("GEO and AI search visibility", "GEO ve yapay zekâ arama görünürlüğü"),
    lead: L(
      "When a visitor asks ChatGPT, Perplexity or Google where to go, your business should be in the answer.",
      "Bir ziyaretçi ChatGPT'ye, Perplexity'ye veya Google'a nereye gideceğini sorduğunda, yanıtta işletmeniz olmalı.",
    ),
    description: L(
      "Generative engine optimisation (GEO) makes the facts about your business easy for AI answer engines to find, trust and quote: structured data, short answers to real questions, and mentions on the sources those engines cite.",
      "Üretken motor optimizasyonu (GEO), işletmenizle ilgili bilgileri yapay zekâ yanıt motorlarının kolayca bulabileceği, güvenebileceği ve alıntılayabileceği hâle getirir: yapılandırılmış veri, gerçek sorulara kısa yanıtlar ve bu motorların kaynak gösterdiği sitelerde adınızın geçmesi.",
    ),
    modules: [
      {
        name: L("Generative engine auditing", "Üretken motor denetimi"),
        delivered: L(
          "We ask the engines the questions your visitors ask, in their languages, and report who gets recommended, which sources are cited and what to fix first.",
          "Motorlara ziyaretçilerinizin sorduğu soruları onların dillerinde soruyor; kimin önerildiğini, hangi kaynakların gösterildiğini ve önce neyin düzeltilmesi gerektiğini raporluyoruz.",
        ),
        mode: "remote",
        demo: { label: L("Run the free audit", "Ücretsiz denetimi başlatın"), href: "/audit/" },
      },
      {
        name: L("Structured data and schema graph", "Yapılandırılmış veri ve şema grafiği"),
        delivered: L(
          "A complete schema.org graph (business type, address, hours, menu or catalog, prices, ratings, FAQ) generated from your Business Profile and kept in sync.",
          "İşletme Profilinizden üretilen ve sürekli güncel tutulan eksiksiz bir schema.org grafiği (işletme türü, adres, saatler, menü veya katalog, fiyatlar, puanlar, SSS).",
        ),
        mode: "remote",
      },
      {
        name: L("Conversational FAQ pages", "Sohbet tarzı SSS sayfaları"),
        delivered: L(
          "Short, quotable answers (40–60 words) to the questions visitors really ask, in each language, marked up so engines can lift them.",
          "Ziyaretçilerin gerçekten sorduğu sorulara her dilde kısa ve alıntılanabilir yanıtlar (40–60 kelime); motorların kolayca alabilmesi için işaretlenmiş.",
        ),
        mode: "remote",
      },
      {
        name: L("Entity authority and citation seeding", "Varlık otoritesi ve atıf çalışması"),
        delivered: L(
          "We get your business mentioned, accurately and consistently, on the guides, forums and directories the engines already cite for your area.",
          "İşletmenizin, motorların bölgeniz için zaten kaynak gösterdiği rehberlerde, forumlarda ve dizinlerde doğru ve tutarlı biçimde anılmasını sağlıyoruz.",
        ),
        mode: "remote",
      },
    ],
    faqs: [
      {
        q: L("How do I get recommended by ChatGPT?", "ChatGPT'nin beni önermesini nasıl sağlarım?"),
        a: L(
          "AI engines recommend places they can confirm from several trusted sources. Publish complete structured data on your own site, answer common visitor questions in short, clear paragraphs, keep map listings accurate, and get mentioned on the guides and forums the engines cite for your area. Then check the answers regularly.",
          "Yapay zekâ motorları, birkaç güvenilir kaynaktan doğrulayabildikleri yerleri önerir. Kendi sitenizde eksiksiz yapılandırılmış veri yayınlayın, sık sorulan ziyaretçi sorularını kısa ve net paragraflarla yanıtlayın, harita kayıtlarınızı doğru tutun ve motorların bölgeniz için gösterdiği rehber ve forumlarda adınızın geçmesini sağlayın. Ardından yanıtları düzenli kontrol edin.",
        ),
      },
      {
        q: L("Is GEO different from SEO?", "GEO, SEO'dan farklı mı?"),
        a: L(
          "They overlap, but the goal differs. SEO aims for a click from a list of links. GEO aims to be the business an AI answer names and quotes. That puts more weight on structured facts, short quotable answers, consistency across sources and reviews, and less on keyword-stuffed pages.",
          "Örtüşürler ama hedef farklıdır. SEO, bağlantı listesinden bir tıklama almayı hedefler. GEO ise yapay zekâ yanıtının adını verdiği ve alıntıladığı işletme olmayı hedefler. Bu yüzden yapılandırılmış bilgilere, kısa alıntılanabilir yanıtlara, kaynaklar arası tutarlılığa ve yorumlara daha çok, anahtar kelime yığılmış sayfalara daha az ağırlık verir.",
        ),
      },
    ],
  },
  {
    pillar: 2,
    slug: "discovery",
    title: L("Maps and global discovery", "Haritalar ve küresel keşif"),
    lead: L(
      "Visitors don't all use Google Maps. Be listed, correct and complete wherever they look.",
      "Ziyaretçilerin hepsi Google Haritalar kullanmaz. Baktıkları her yerde kayıtlı, doğru ve eksiksiz olun.",
    ),
    description: L(
      "We claim and complete your listings on Google, Apple, Bing, Yandex and Amap, and on the niche directories visitors in your field trust, using the keywords people actually type.",
      "Google, Apple, Bing, Yandex ve Amap'teki kayıtlarınızı ve sektörünüzde ziyaretçilerin güvendiği özel dizinlerdeki kayıtlarınızı, insanların gerçekten yazdığı anahtar kelimelerle sahipleniyor ve tamamlıyoruz.",
    ),
    modules: [
      {
        name: L("Multi-engine and non-Western maps", "Çoklu harita ve Batı dışı harita servisleri"),
        delivered: L(
          "Google Business Profile, Apple Business Connect, Bing Places, Yandex Business and Amap: claimed, verified and filled in with hours, photos, languages and categories.",
          "Google İşletme Profili, Apple Business Connect, Bing Places, Yandex Business ve Amap: sahiplenilmiş, doğrulanmış; saatler, fotoğraflar, diller ve kategorilerle doldurulmuş.",
        ),
        mode: "remote",
      },
      {
        name: L(
          "Niche directories and intent keywords",
          "Sektörel dizinler ve niyet anahtar kelimeleri",
        ),
        delivered: L(
          'Tripadvisor, WhatClinic, RealSelf and trade directories, written around the phrases visitors use, like "English-speaking dentist near Osmanbey metro".',
          'Tripadvisor, WhatClinic, RealSelf ve sektör dizinleri; ziyaretçilerin kullandığı ifadeler etrafında yazılmış, örneğin "Osmanbey metrosu yakınında İngilizce konuşan diş hekimi".',
        ),
        mode: "remote",
      },
    ],
    faqs: [
      {
        q: L(
          "Why do Yandex and Amap matter in Istanbul?",
          "İstanbul'da Yandex ve Amap neden önemli?",
        ),
        a: L(
          "Many visitors from Russia and Central Asia navigate with Yandex Maps, and visitors from China use Amap because Google is blocked there. If you're missing from those apps, those visitors simply don't see you, however good your Google listing is.",
          "Rusya ve Orta Asya'dan gelen birçok ziyaretçi Yandex Haritalar'ı, Çin'den gelenler ise Google orada engelli olduğu için Amap'i kullanır. Bu uygulamalarda yoksanız, Google kaydınız ne kadar iyi olursa olsun bu ziyaretçiler sizi göremez.",
        ),
      },
    ],
  },
  {
    pillar: 3,
    slug: "funnels",
    title: L(
      "Multilingual menus, catalogs and funnels",
      "Çok dilli menüler, kataloglar ve dönüşüm akışları",
    ),
    lead: L(
      "Turn a scan or a search into a booking, a quote request or a WhatsApp message.",
      "Bir taramayı veya aramayı rezervasyona, teklif talebine ya da WhatsApp mesajına dönüştürün.",
    ),
    description: L(
      "Pages visitors open on their phones: your menu, catalog or treatment packages in their language and currency, with clear badges and a WhatsApp button that writes the first message for them.",
      "Ziyaretçilerin telefonda açtığı sayfalar: menünüz, kataloğunuz veya tedavi paketleriniz onların dilinde ve para biriminde; net etiketler ve ilk mesajı onlar için yazan bir WhatsApp butonuyla.",
    ),
    modules: [
      {
        name: L("Multi-language QR menu and catalog", "Çok dilli QR menü ve katalog"),
        delivered: L(
          "A fast page per business, opened from a QR code, with language picked from the phone and a visible switch. You edit it yourself; changes go live at once.",
          "Her işletme için QR kodla açılan hızlı bir sayfa; dil telefondan otomatik seçilir ve görünür bir düğmeyle değiştirilebilir. Siz düzenlersiniz; değişiklikler anında yayına girer.",
        ),
        mode: "remote",
        demo: { label: L("See the café menu", "Kafe menüsünü görün"), href: "PUBLIC/m/cafe-lale" },
      },
      {
        name: L("Live currency and transparency badges", "Canlı kur ve şeffaflık etiketleri"),
        delivered: L(
          "Prices in lira with approximate euro, dollar, pound and dirham amounts (rate date shown), plus halal, vegan, gluten-free and allergen badges.",
          "Lira fiyatlarının yanında yaklaşık euro, dolar, sterlin ve dirhem tutarları (kur tarihiyle), ayrıca helal, vegan, glütensiz ve alerjen etiketleri.",
        ),
        mode: "remote",
      },
      {
        name: L("WhatsApp concierge routing", "WhatsApp karşılama yönlendirmesi"),
        delivered: L(
          "Buttons that open WhatsApp with a message already written in the visitor's language: a table for two, a quote for item A12, a treatment question.",
          "WhatsApp'ı, ziyaretçinin dilinde hazır yazılmış bir mesajla açan butonlar: iki kişilik masa, A12 ürünü için teklif, bir tedavi sorusu.",
        ),
        mode: "remote",
      },
      {
        name: L("Clinic package portals", "Klinik paket portalları"),
        delivered: L(
          "One page per treatment package with a day-by-day roadmap, what's included, the team, an FAQ and an inquiry that continues on WhatsApp.",
          "Her tedavi paketi için gün gün yol haritası, pakete dahil olanlar, ekip, SSS ve WhatsApp'ta devam eden bir talep formu içeren bir sayfa.",
        ),
        mode: "remote",
        demo: {
          label: L("See an implant package", "Bir implant paketini görün"),
          href: "PUBLIC/c/defne-dental/implants-6-day",
        },
      },
    ],
    faqs: [
      {
        q: L(
          "Do I need to reprint QR codes when prices change?",
          "Fiyatlar değişince QR kodları yeniden bastırmam gerekir mi?",
        ),
        a: L(
          "No. The QR code points to your live page, not to a file. Change a price, mark a dish sold out or add a product in the admin, and the next person who scans sees it. The structured data AI crawlers read updates at the same moment.",
          "Hayır. QR kod bir dosyaya değil, canlı sayfanıza yönlendirir. Panelden bir fiyatı değiştirin, bir yemeği tükendi olarak işaretleyin veya ürün ekleyin; bir sonraki okutan kişi bunu görür. Yapay zekâ tarayıcılarının okuduğu yapılandırılmış veri de aynı anda güncellenir.",
        ),
      },
    ],
  },
  {
    pillar: 4,
    slug: "visual",
    title: L("Visual production", "Görsel prodüksiyon"),
    lead: L(
      'Real photos, a 360° tour and a short "how to find us" video.',
      'Gerçek fotoğraflar, 360° tur ve kısa bir "bizi nasıl bulursunuz" videosu.',
    ),
    description: L(
      "Our on-site team photographs your space, dishes or products, records a 360° tour for map listings and films a short wayfinding video from the nearest metro exit to your door.",
      "Yerinde çalışan ekibimiz mekânınızı, yemeklerinizi veya ürünlerinizi fotoğraflar, harita kayıtları için 360° tur çeker ve en yakın metro çıkışından kapınıza kadar kısa bir yol tarifi videosu hazırlar.",
    ),
    modules: [
      {
        name: L("Photography", "Fotoğraf çekimi"),
        delivered: L(
          "Menu, product and interior photos, licensed for your listings, menu and social channels.",
          "Kayıtlarınız, menünüz ve sosyal kanallarınız için lisanslı menü, ürün ve iç mekân fotoğrafları.",
        ),
        mode: "onsite",
      },
      {
        name: L("360° tour", "360° tur"),
        delivered: L(
          "A walk-through published to Google Maps and embedded on your pages.",
          "Google Haritalar'da yayınlanan ve sayfalarınıza eklenen bir sanal gezinti.",
        ),
        mode: "onsite",
      },
      {
        name: L("Wayfinding video", "Yol tarifi videosu"),
        delivered: L(
          'A 30–60 second video from the metro exit to your door, shown in the "How to find us" slot on every public page.',
          'Metro çıkışından kapınıza 30–60 saniyelik bir video; her ziyaretçi sayfasındaki "Bizi nasıl bulursunuz" bölümünde gösterilir.',
        ),
        mode: "onsite",
      },
    ],
    faqs: [
      {
        q: L("Why does a wayfinding video help?", "Yol tarifi videosu neden işe yarar?"),
        a: L(
          "Istanbul streets are hard to read for a first-time visitor, and entrances on upper floors are easy to miss. A short video from the metro exit cuts no-shows and late arrivals, and gives map listings and AI engines fresh first-party media to link to.",
          "İstanbul sokakları ilk kez gelen biri için zor okunur; üst kattaki girişler kolayca gözden kaçar. Metro çıkışından başlayan kısa bir video gelmeyen ve geç kalan ziyaretçileri azaltır, harita kayıtlarına ve yapay zekâ motorlarına bağlantı verebilecekleri güncel ve size ait bir medya sunar.",
        ),
      },
    ],
  },
  {
    pillar: 5,
    slug: "reputation",
    title: L("Reviews and reputation", "Yorumlar ve itibar"),
    lead: L(
      "More honest reviews, and a careful reply to every one.",
      "Daha çok dürüst yorum ve her birine özenli bir yanıt.",
    ),
    description: L(
      "Ratings and recent reviews decide who gets recommended. We make reviewing a one-tap step for happy visitors and help you answer every review quickly, in the reviewer's language.",
      "Kimin önerileceğini puanlar ve güncel yorumlar belirler. Memnun ziyaretçiler için yorum yapmayı tek dokunuşa indiriyor, her yoruma yorumcunun dilinde hızlıca yanıt vermenize yardımcı oluyoruz.",
    ),
    modules: [
      {
        name: L("NFC and QR review displays", "NFC ve QR yorum standları"),
        delivered: L(
          "An acrylic stand and tap cards that open a review page in the visitor's language with every public review option. Artwork comes ready for a local print vendor.",
          "Ziyaretçinin dilinde, tüm herkese açık yorum seçenekleriyle bir yorum sayfası açan akrilik stand ve dokunmatik kartlar. Tasarımlar yerel matbaa için hazır gelir.",
        ),
        mode: "vendor",
        demo: {
          label: L("See the review page", "Yorum sayfasını görün"),
          href: "PUBLIC/r/cafe-lale",
        },
      },
      {
        name: L("Multilingual WhatsApp templates", "Çok dilli WhatsApp şablonları"),
        delivered: L(
          "Ready-to-paste replies for bookings, price questions and follow-ups, in English and Turkish.",
          "Rezervasyonlar, fiyat soruları ve takipler için İngilizce ve Türkçe kopyala-yapıştır yanıtlar.",
        ),
        mode: "remote",
      },
      {
        name: L("Crisis response moderation", "Kriz anında yanıt yönetimi"),
        delivered: L(
          "A Reputation Desk where every review gets a draft reply that never argues, never discloses private details and always offers a direct contact.",
          "Her yoruma, asla tartışmayan, asla özel bilgi paylaşmayan ve her zaman doğrudan iletişim sunan bir yanıt taslağı hazırlanan bir İtibar Masası.",
        ),
        mode: "remote",
      },
      {
        name: L("Staff cheat sheets", "Personel kopya kartları"),
        delivered: L(
          "Phrase cards so front-of-house staff can greet, explain and ask for reviews in visitors' languages.",
          "Ön saflardaki personelin ziyaretçileri onların dilinde karşılaması, bilgi vermesi ve yorum istemesi için ifade kartları.",
        ),
        mode: "vendor",
      },
    ],
    faqs: [
      {
        q: L(
          "Can I only show the review page to happy customers?",
          "Yorum sayfasını sadece memnun müşterilere gösterebilir miyim?",
        ),
        a: L(
          "No, and we don't build it that way. Filtering out unhappy customers before they reach Google (\"review gating\") breaks Google's review policy and can get reviews removed. Every visitor sees every public option; a private feedback box sits beside them for anyone who'd rather talk to you directly.",
          "Hayır, biz de böyle kurmuyoruz. Memnun olmayan müşterileri Google'a ulaşmadan elemek (\"yorum filtreleme\") Google'ın yorum politikasına aykırıdır ve yorumların silinmesine yol açabilir. Her ziyaretçi tüm herkese açık seçenekleri görür; doğrudan sizinle konuşmak isteyenler için yanında özel bir geri bildirim kutusu bulunur.",
        ),
      },
    ],
  },
];

export const MODE_LABEL = {
  remote: L("Fully remote", "Tamamen uzaktan"),
  vendor: L("Remote + local print vendor", "Uzaktan + yerel matbaa"),
  onsite: L("On-site team", "Yerinde ekip"),
};
