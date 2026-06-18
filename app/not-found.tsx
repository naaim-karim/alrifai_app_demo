"use client";

import Footer from "@/app/components/Footer";
import Navbar from "@/app/components/Navbar";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

const NotFound = () => {
  const { t } = useLanguage();
  return (
    <>
      <Navbar />
      <main className="main-container flex-grow-1 py-8 text-center">
        <h1 className="text-3xl font-bold mb-4 md:text-4xl">
          {t("notFound.title")}
        </h1>
        <p className="mb-8">{t("notFound.body")}</p>
        <Image
          src="/notFound.png"
          alt="404 Not Found"
          width={512}
          height={512}
          className="mx-auto w-2xl max-w-full rounded-xl"
        />
        <Link href="/" className="btn dark-btn inline-block mt-8">
          {t("notFound.goHome")}
        </Link>
      </main>
      <Footer />
    </>
  );
};

export default NotFound;
