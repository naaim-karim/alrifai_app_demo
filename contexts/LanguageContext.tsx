"use client";

import { createContext, useContext, useState } from "react";
import { getTranslator, type Locale } from "@/locales";

type LanguageContextType = {
  locale: Locale;
  dir: "ltr" | "rtl";
  t: (key: string) => string;
  setLocale: (locale: Locale) => void;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

const LOCALE_COOKIE = "locale";

const getDir = (locale: Locale): "ltr" | "rtl" => (locale === "ar" ? "rtl" : "ltr");

export const LanguageProvider = ({
  initialLocale,
  children,
}: Readonly<{ initialLocale: Locale; children: React.ReactNode }>) => {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = (next: Locale) => {
    setLocaleState(next);
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000`;
    document.documentElement.lang = next;
    document.documentElement.dir = getDir(next);
  };

  const t = getTranslator(locale);

  const value = { locale, dir: getDir(locale), t, setLocale };
  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
