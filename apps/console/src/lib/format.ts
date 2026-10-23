export const lira = (kurus: number | null | undefined) =>
  kurus === null || kurus === undefined
    ? "—"
    : new Intl.NumberFormat("tr-TR", {
        style: "currency",
        currency: "TRY",
        maximumFractionDigits: 0,
      }).format(kurus / 100);

export const ago = (iso: string) => {
  const diff = (Date.now() - Date.parse(iso)) / 1000;
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  if (diff < 60) return "just now";
  if (diff < 3600) return rtf.format(-Math.round(diff / 60), "minute");
  if (diff < 86400) return rtf.format(-Math.round(diff / 3600), "hour");
  return rtf.format(-Math.round(diff / 86400), "day");
};

export const dateTime = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Istanbul",
  }).format(new Date(iso));

export const VERTICAL_LABEL = {
  dining: "Café / restaurant",
  retail: "Showroom / boutique",
  clinic: "Clinic",
} as const;
export const CATALOG_LABEL = { dining: "Menu", retail: "Catalog", clinic: "Price list" } as const;
