/** WhatsApp reply library: EN and TR per key. Arabic comes after the demo. */
export interface TemplateSeed {
  key: string;
  category: "booking" | "objection" | "service" | "reviews" | "clinic";
  vertical: "dining" | "retail" | "clinic" | null;
  en: { title: string; body: string };
  tr: { title: string; body: string };
}

export const templateSeeds: TemplateSeed[] = [
  {
    key: "booking-confirm",
    category: "booking",
    vertical: "dining",
    en: {
      title: "Confirm a table",
      body: "Hi {name}, your table for {guests} is booked for {time}. We'll keep it for 15 minutes. Here's how to find us: {map_link}",
    },
    tr: {
      title: "Masa onayı",
      body: "Merhaba {name}, {time} için {guests} kişilik masanız ayrıldı. Masanızı 15 dakika tutuyoruz. Bize ulaşmak için: {map_link}",
    },
  },
  {
    key: "booking-full",
    category: "booking",
    vertical: "dining",
    en: {
      title: "Fully booked, offer another time",
      body: "Hi {name}, we're full at {time}, sorry. We can seat you at {alt_time} in the garden. Shall I book it?",
    },
    tr: {
      title: "Dolu, başka saat önerin",
      body: "Merhaba {name}, {time} için maalesef doluyuz. Sizi {alt_time}'da bahçede ağırlayabiliriz. Ayırayım mı?",
    },
  },
  {
    key: "price-too-high",
    category: "objection",
    vertical: null,
    en: {
      title: '"It\'s cheaper elsewhere"',
      body: "Thanks for checking with us. Our price includes {inclusions}, so you won't pay extra later. Happy to send a written breakdown so you can compare like for like.",
    },
    tr: {
      title: '"Başka yerde daha ucuz"',
      body: "Bize sorduğunuz için teşekkürler. Fiyatımıza {inclusions} dahil, sonradan ek ödeme çıkmaz. Birebir karşılaştırabilmeniz için yazılı bir döküm gönderebilirim.",
    },
  },
  {
    key: "currency-question",
    category: "objection",
    vertical: null,
    en: {
      title: "Which currency do I pay in?",
      body: "Prices are charged in Turkish lira. The euro, dollar and pound prices on our page are approximate, using the day's rate. You can pay by card; your bank converts at its own rate.",
    },
    tr: {
      title: "Hangi para birimiyle ödüyorum?",
      body: "Ödemeler Türk lirası ile alınır. Sayfamızdaki euro, dolar ve sterlin fiyatları günün kuruna göre yaklaşıktır. Kartla ödeyebilirsiniz; dönüşümü bankanız kendi kuruyla yapar.",
    },
  },
  {
    key: "directions",
    category: "service",
    vertical: null,
    en: {
      title: "Send directions",
      body: "Here's our location: {map_link}. {how_to_find_us} Message me when you're outside and I'll come down.",
    },
    tr: {
      title: "Yol tarifi gönderin",
      body: "Konumumuz: {map_link}. {how_to_find_us} Kapıya geldiğinizde yazın, aşağı ineyim.",
    },
  },
  {
    key: "running-late",
    category: "service",
    vertical: null,
    en: {
      title: "We're running late",
      body: "Hi {name}, I'm sorry, we're running about {minutes} minutes behind today. You're welcome to wait with a tea, or I can move you to {alt_time}.",
    },
    tr: {
      title: "Gecikiyoruz",
      body: "Merhaba {name}, kusura bakmayın, bugün yaklaşık {minutes} dakika gecikmeyle ilerliyoruz. Bir çay eşliğinde bekleyebilir ya da sizi {alt_time}'a alabilirim.",
    },
  },
  {
    key: "review-ask",
    category: "reviews",
    vertical: null,
    en: {
      title: "Ask for a review after a visit",
      body: "Thank you for visiting {business}! If you have a minute, a review helps other travellers find us: {review_link}",
    },
    tr: {
      title: "Ziyaret sonrası yorum isteyin",
      body: "{business}'i ziyaret ettiğiniz için teşekkürler! Bir dakikanız varsa, yorumunuz diğer gezginlerin bizi bulmasına yardımcı olur: {review_link}",
    },
  },
  {
    key: "wholesale-quote",
    category: "service",
    vertical: "retail",
    en: {
      title: "Wholesale quote",
      body: "Thanks for your interest in {item}. For {quantity} pieces the price is {price} each, minimum {moq} per style. Shipping to {city} is about {shipping}. Shall I prepare a pro forma invoice?",
    },
    tr: {
      title: "Toptan fiyat teklifi",
      body: "{item} ile ilgilendiğiniz için teşekkürler. {quantity} adet için birim fiyat {price}, model başına minimum {moq} adet. {city} için kargo yaklaşık {shipping}. Proforma fatura hazırlayayım mı?",
    },
  },
  {
    key: "clinic-followup",
    category: "clinic",
    vertical: "clinic",
    en: {
      title: "Follow up an inquiry",
      body: "Hello {name}, thank you for your message. I'm {coordinator}, your coordinator. Would a short video call with the dentist this week suit you? I can also send the day-by-day plan for {package}.",
    },
    tr: {
      title: "Talebi takip edin",
      body: "Merhaba {name}, mesajınız için teşekkürler. Ben {coordinator}, koordinatörünüzüm. Bu hafta diş hekimiyle kısa bir görüntülü görüşme uygun olur mu? {package} için gün gün planı da gönderebilirim.",
    },
  },
  {
    key: "clinic-records",
    category: "clinic",
    vertical: "clinic",
    en: {
      title: "Ask for X-rays securely",
      body: "To prepare your plan, the dentist would like a recent X-ray if you have one. Please don't send it here; I'll send you a secure upload link by email.",
    },
    tr: {
      title: "Röntgeni güvenli şekilde isteyin",
      body: "Planınızı hazırlamak için diş hekimimiz varsa yakın tarihli bir röntgen görmek istiyor. Lütfen buradan göndermeyin; size e-postayla güvenli bir yükleme bağlantısı göndereceğim.",
    },
  },
];

export const agencyUser = {
  id: "usr_agency",
  email: "team@wayfound.example",
  name: "Wayfound team",
  demoAccount: "agency",
};
