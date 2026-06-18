import en from "./en";
import ar from "./ar";
import type { Locale } from "./types";

export const dictionaries: Record<Locale, typeof en> = { en, ar };
export type { Locale, Dictionary } from "./types";

export const getTranslator = (locale: Locale) => {
  return (key: string): string => {
    const value = key
      .split(".")
      .reduce<unknown>(
        (acc, part) =>
          typeof acc === "object" && acc !== null
            ? (acc as Record<string, unknown>)[part]
            : undefined,
        dictionaries[locale]
      );
    return typeof value === "string" ? value : key;
  };
};
