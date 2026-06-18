"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import Image from "next/image";
import Link from "next/link";
import Loading from "@/app/components/Loading";

const CheckEmailPage = () => {
  const { loading } = useAuth();
  const { t } = useLanguage();

  if (loading) {
    return <Loading />;
  } else {
    localStorage.removeItem("formValues");
  }

  return (
    <>
      <header className="shadow">
        <nav className="main-container text-center">
          <Link href={"/"} className="inline-block">
            <Image
              src="/alrifai_logo.png"
              alt="Alrifai Logo"
              width={500}
              height={481}
              className="w-20 h-auto"
            />
          </Link>
        </nav>
      </header>
      <main className="main-container py-16 flex-grow-1">
        <div className="flex flex-col items-center mx-auto max-w-md text-center">
          <div className="mb-6">
            <svg
              className="w-16 h-16 text-green-500 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold mb-4 md:text-2xl">
            {t("checkEmail.title")}
          </h1>
          <p className="text-gray-600 mb-4">{t("checkEmail.body")}</p>
          <a
            href="https://mail.google.com/mail/u/0/#inbox"
            target="_blank"
            rel="noopener noreferrer"
            className="btn dark-btn mb-4"
          >
            {t("checkEmail.openInbox")}
          </a>
          <p className="text-sm text-gray-500">
            {t("checkEmail.noEmail")}
            <Link href="/contact" className="text-primary font-semibold">
              {t("checkEmail.contactSupport")}
            </Link>
          </p>
        </div>
      </main>
    </>
  );
};

export default CheckEmailPage;
