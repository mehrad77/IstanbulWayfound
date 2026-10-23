import type { OpeningHours, Weekday } from "@wayfound/core";
import { intlLocale, type Locale } from "@wayfound/i18n";

export function formatDate(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Istanbul",
  }).format(new Date(iso));
}

export function formatDateTime(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Istanbul",
  }).format(new Date(iso));
}

const WEEKDAYS: Weekday[] = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

/** Today's opening hours in Istanbul, e.g. "08:00–22:00", or null when closed. */
export function todaysHours(hours: OpeningHours[], now = new Date()): string | null {
  const day = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "Europe/Istanbul" })
    .format(now)
    .slice(0, 2) as Weekday;
  const idx = WEEKDAYS.indexOf(day);
  const today = WEEKDAYS[idx]!;
  const slot = hours.find((h) => h.days.includes(today));
  return slot ? `${slot.opens}–${slot.closes}` : null;
}

export const LANGUAGE_NAMES: Record<string, Record<Locale, string>> = {
  en: { en: "English", tr: "İngilizce" },
  tr: { en: "Turkish", tr: "Türkçe" },
  ar: { en: "Arabic", tr: "Arapça" },
  ru: { en: "Russian", tr: "Rusça" },
  de: { en: "German", tr: "Almanca" },
  fr: { en: "French", tr: "Fransızca" },
};

export function languageName(code: string, locale: Locale): string {
  return LANGUAGE_NAMES[code]?.[locale] ?? code.toUpperCase();
}
