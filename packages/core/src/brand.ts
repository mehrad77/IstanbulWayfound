/** Single place for the brand. Domains are placeholders until the founder picks one. */
export const BRAND = {
  name: "Wayfound",
  tagline: {
    en: "Get found and chosen by international visitors",
    tr: "Uluslararası ziyaretçiler tarafından bulunun ve tercih edilin",
  },
  domain: "wayfound.example",
  publicDomain: "go.wayfound.example",
  consoleDomain: "app.wayfound.example",
  email: "hello@wayfound.example",
  whatsapp: "+905550000000",
  bookingUrl: "https://cal.com/wayfound/intro",
  city: "İstanbul",
} as const;

export const products = {
  audit: "Wayfound Audit",
  menu: "Wayfound Menu",
  care: "Wayfound Care",
  reviews: "Wayfound Reviews",
} as const;
