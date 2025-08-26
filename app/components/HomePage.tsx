"use client";

import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";
import Link from "next/link";
import Loading from "./Loading";
import { useEffect } from "react";
import supabase from "@/lib/supabaseClient";

const HomePage = () => {
  const { user, loading } = useAuth();

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
          console.error("Demo auto-sign in failed:", error);
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
          <div className="flex flex-col items-start gap-10 text-center lg:text-left lg:max-w-xl">
            <h1 className="text-4xl/tight font-bold text-white sm:text-5xl/tight md:text-6xl/tight">
              Connect with your child&#39;s education like never before
            </h1>
            <p className="text-white sm:text-xl">
              Alrifai is a platform that allows you to keep up with your
              child&#39;s lessons, assignments, and progress..
            </p>
            {user ? (
              <Link
                href={`/u/${
                  user.user_metadata.role ? user.user_metadata.role : "student"
                }/${user.user_metadata.username}`}
                className="btn light-btn inline-block mx-auto lg:mx-0"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/signin"
                className="btn light-btn inline-block mx-auto lg:mx-0"
              >
                Get Started with Alrifai
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
            What do we provide?
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
              <h3 className="text-xl font-bold mt-5">Quran Education</h3>
              <p className="text-center">
                Learn Quran with Tajweed and Tafseer
              </p>
            </div>
            <div className="flex flex-col items-center">
              <Image
                src="/dhad.png"
                alt="Dhad icon"
                width={512}
                height={512}
                className="w-28 h-auto"
              />
              <h3 className="text-xl font-bold mt-5">Arabic Education</h3>
              <p className="text-center">
                Learn Arabic grammar, vocabulary and more
              </p>
            </div>
            <div className="flex flex-col items-center">
              <Image
                src="/compass.png"
                alt="Compass icon"
                width={512}
                height={512}
                className="w-28 h-auto"
              />
              <h3 className="text-xl font-bold mt-5">Fiqh Education</h3>
              <p className="text-center">Learn Fiqh rules and regulations</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default HomePage;
