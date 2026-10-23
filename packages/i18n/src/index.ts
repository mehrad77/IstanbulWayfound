import { en } from "./catalog/en.ts";
import { tr } from "./catalog/tr.ts";
import type { Locale } from "./locales.ts";

export type { Messages } from "./catalog/en.ts";
export * from "./locales.ts";

const catalogs = { en, tr } satisfies Record<Locale, typeof en>;

type Leaves<T, P extends string = ""> = {
  [K in keyof T & string]: T[K] extends string ? `${P}${K}` : Leaves<T[K], `${P}${K}.`>;
}[keyof T & string];

export type MessageKey = Leaves<typeof en>;

function lookup(tree: unknown, key: string): string | undefined {
  let node: unknown = tree;
  for (const part of key.split(".")) {
    if (node && typeof node === "object" && part in node) {
      node = (node as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return typeof node === "string" ? node : undefined;
}

/** Translate a key, interpolating `{name}` placeholders. Falls back to English. */
export function t(locale: Locale, key: MessageKey, vars?: Record<string, string | number>): string {
  const raw = lookup(catalogs[locale], key) ?? lookup(catalogs.en, key) ?? key;
  if (!vars) return raw;
  return raw.replace(/\{(\w+)\}/g, (_, name: string) =>
    name in vars ? String(vars[name]) : `{${name}}`,
  );
}

export function translator(locale: Locale) {
  return (key: MessageKey, vars?: Record<string, string | number>) => t(locale, key, vars);
}

export function messages(locale: Locale) {
  return catalogs[locale];
}
