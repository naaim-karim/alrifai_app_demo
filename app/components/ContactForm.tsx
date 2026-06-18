"use client";

import { useLanguage } from "@/contexts/LanguageContext";

const ContactForm = () => {
  const { t } = useLanguage();
  return (
    <main className="main-container py-16 flex-grow-1 flex flex-col items-center gap-4">
      <h2 className="text-3xl font-bold text-center">{t("contact.title")}</h2>
      <p className="text-lg text-center">{t("contact.subtitle")}</p>
      <form className="flex flex-col gap-4 w-md max-w-full">
        <input
          type="text"
          placeholder={t("contact.namePlaceholder")}
          className="input"
        />
        <input
          type="email"
          placeholder={t("contact.emailPlaceholder")}
          className="input"
        />
        <textarea
          placeholder={t("contact.messagePlaceholder")}
          className="input resize-none"
          rows={6}
        ></textarea>
        <button type="submit" className="btn dark-btn">
          {t("contact.send")}
        </button>
      </form>
    </main>
  );
};

export default ContactForm;
