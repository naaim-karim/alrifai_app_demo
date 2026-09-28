"use client";
import { useState, type FormEvent } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowUpRight, Mail } from "lucide-react";
const CONTACT_EMAIL = "alrifaiorg@gmail.com";
export default function ContactForm() {
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const body = `${t("contact.namePlaceholder")}: ${name.trim()}\n${t("contact.emailPlaceholder")}: ${email.trim()}\n\n${message.trim()}`;
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(t("polish.contactSubject"))}&body=${encodeURIComponent(body)}`;
  };
  return (
    <main className="main-container py-12 md:py-16 flex-grow-1">
      <div className="max-w-xl mx-auto">
        <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-5">
          <Mail aria-hidden="true" />
        </div>
        <h1 className="text-3xl font-bold">{t("contact.title")}</h1>
        <p className="text-secondary mt-3 mb-8">{t("polish.contactNote")}</p>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 p-6 md:p-8 rounded-2xl border border-gray-200 bg-white"
        >
          <div>
            <label htmlFor="contact-name" className="label block">
              {t("contact.namePlaceholder")}
            </label>
            <input
              id="contact-name"
              name="name"
              type="text"
              autoComplete="name"
              required
              minLength={2}
              maxLength={100}
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="contact-email" className="label block">
              {t("contact.emailPlaceholder")}
            </label>
            <input
              id="contact-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="contact-message" className="label block">
              {t("polish.messageLabel")}
            </label>
            <textarea
              id="contact-message"
              name="message"
              required
              minLength={10}
              maxLength={4000}
              rows={6}
              className="input resize-y"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              aria-describedby="contact-delivery"
            />
          </div>
          <button type="submit" className="btn dark-btn gap-2">
            {t("polish.contactAction")}
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </button>
          <p
            id="contact-delivery"
            className="text-sm text-secondary leading-relaxed"
          >
            {t("polish.contactMailNote")}
          </p>
        </form>
      </div>
    </main>
  );
}
