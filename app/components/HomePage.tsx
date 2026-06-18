"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import Image from "next/image";
import Link from "next/link";
import Loading from "./Loading";
import { useEffect } from "react";
import supabase from "@/lib/supabaseClient";
import toast from "react-hot-toast";
import { getProfileRole } from "@/lib/utils";

const HomePage = () => {
  const { user, loading } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    const autoSignInDemo = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        const { error } = await supabase.auth.signInWithPassword({
          email: "fake@fake.fake",
          password: "Fakeadmin",
        });

        if (error) {
          toast.error("Demo auto-sign in failed", {
            duration: 5000,
          });
        }
      }
    };

    autoSignInDemo();
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <main className="flex-grow-1">
      {/* Hero Section */}
      <section className="bg-primary">
        <div className="main-container min-h-[47rem] flex justify-center lg:justify-between items-center">
          <div className="flex flex-col items-start gap-10 text-center lg:text-start lg:max-w-xl">
            <h1 className="text-4xl/snug font-bold text-white sm:text-5xl/snug md:text-6xl/snug">
              {t("home.heroTitle")}
            </h1>
            <p className="text-white sm:text-xl">{t("home.heroSubtitle")}</p>
            {user ? (
              <Link
                href={`/u/${getProfileRole(user.user_metadata.role)}/${
                  user.user_metadata.username
                }`}
                className="btn light-btn inline-block mx-auto lg:mx-0"
              >
                {t("home.dashboard")}
              </Link>
            ) : (
              <Link
                href="/signin"
                className="btn light-btn inline-block mx-auto lg:mx-0"
              >
                {t("home.getStarted")}
              </Link>
            )}
          </div>
          <div className="hidden lg:block">
            <Image
              src="/quran_boy.png"
              alt="Quran Boy"
              width={1024}
              height={1536}
              className="w-md h-auto"
            />
          </div>
        </div>
      </section>
      {/* What We Provide Section */}
      <section className="py-16">
        <div className="main-container">
          <h2 className="text-3xl font-bold text-center mb-15">
            {t("home.provideTitle")}
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="flex flex-col items-center">
              <Image
                src="/quran.png"
                alt="Quran icon"
                width={512}
                height={512}
                className="w-28 h-auto"
              />
              <h3 className="text-xl font-bold mt-5">{t("home.quranTitle")}</h3>
              <p className="text-center">{t("home.quranDesc")}</p>
            </div>
            <div className="flex flex-col items-center">
              <Image
                src="/dhad.png"
                alt="Dhad icon"
                width={512}
                height={512}
                className="w-28 h-auto"
              />
              <h3 className="text-xl font-bold mt-5">{t("home.arabicTitle")}</h3>
              <p className="text-center">{t("home.arabicDesc")}</p>
            </div>
            <div className="flex flex-col items-center">
              <Image
                src="/compass.png"
                alt="Compass icon"
                width={512}
                height={512}
                className="w-28 h-auto"
              />
              <h3 className="text-xl font-bold mt-5">{t("home.fiqhTitle")}</h3>
              <p className="text-center">{t("home.fiqhDesc")}</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default HomePage;
