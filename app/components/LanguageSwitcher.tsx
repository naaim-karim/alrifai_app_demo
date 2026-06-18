"use client";

import { useLanguage } from "@/contexts/LanguageContext";

const LanguageSwitcher = ({ className = "" }: { className?: string }) => {
  const { locale, setLocale } = useLanguage();
  const isArabic = locale === "ar";

  return (
    <button
      type="button"
      dir="ltr"
      role="switch"
      aria-checked={isArabic}
      aria-label="Toggle language"
      onClick={() => setLocale(isArabic ? "en" : "ar")}
      className={`relative inline-flex h-8 w-[68px] shrink-0 cursor-pointer items-center rounded-full bg-primary/15 transition-colors ${className}`}
    >
      <span className="flex w-full items-center justify-between px-2 text-[10px] font-bold text-primary">
        <span>EN</span>
        <span>ع</span>
      </span>
      <span
        className={`absolute start-1 flex size-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow transition-transform duration-200 ${
          isArabic ? "translate-x-9" : "translate-x-0"
        }`}
      >
        {isArabic ? "ع" : "EN"}
      </span>
    </button>
  );
};

export default LanguageSwitcher;
