"use client";

import Image from "next/image";
import Link from "next/link";
import { CircleUser } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePathname } from "next/navigation";
import Modal from "./Modal";
import Loading from "./Loading";
import LanguageSwitcher from "./LanguageSwitcher";
import { Bars3BottomLeftIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { capitalize, getProfileRole } from "@/lib/utils";

const MobileNavbar = () => {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  if (loading) {
    return <Loading />;
  }

  return (
    <nav className="main-container grid grid-cols-3 items-center md:hidden">
      <button
        type="button"
        aria-label={t("polish.openMenu")}
        aria-expanded={isOpen}
        className="cursor-pointer me-auto"
        onClick={() => setIsOpen(true)}
      >
        <Bars3BottomLeftIcon className="size-8" />
      </button>
      {isOpen && (
        <Modal
          titleId="mobile-menu-title"
          onClose={() => setIsOpen(false)}
          className="nav-modal"
        >
          <div>
            <div className="flex justify-between items-center mb-8">
              <h2 id="mobile-menu-title" className="text-xl font-bold">
                {user
                  ? capitalize(user.user_metadata.fullname || "")
                  : t("common.menu")}
              </h2>
              <button
                type="button"
                aria-label={t("polish.closeMenu")}
                className="cursor-pointer"
                onClick={() => setIsOpen(false)}
              >
                <XMarkIcon className="size-8" />
              </button>
            </div>
            <ul
              className="flex flex-col gap-4"
              onClick={(event) => {
                if ((event.target as HTMLElement).closest("a"))
                  setIsOpen(false);
              }}
            >
              <li>
                <Link href="/">{t("nav.home")}</Link>
              </li>
              <li>
                <Link href="/contact">{t("nav.contact")}</Link>
              </li>
              <li>
                <Link href="/scores">{t("nav.scores")}</Link>
              </li>
              {user &&
                (["admin", "teacher_assistant"].includes(
                  user.user_metadata.role,
                ) ||
                  user.user_metadata.group) && (
                  <li>
                    <Link
                      href={
                        user.user_metadata.role === "admin" ||
                        user.user_metadata.role === "teacher_assistant"
                          ? `/groups`
                          : `/group/${encodeURIComponent(user.user_metadata.group || "")}`
                      }
                    >
                      {user.user_metadata.role === "admin" ||
                      user.user_metadata.role === "teacher_assistant"
                        ? t("nav.groups")
                        : t("nav.group")}
                    </Link>
                  </li>
                )}
              {user && user.user_metadata.role === "admin" && (
                <li>
                  <Link href={`/students`}>{t("nav.students")}</Link>
                </li>
              )}
              {user &&
                user.user_metadata.role === "teacher" &&
                user.user_metadata.group && (
                  <li>
                    <Link
                      href={`/scores/manage/${encodeURIComponent(user.user_metadata.group || "")}`}
                    >
                      {t("nav.editScores")}
                    </Link>
                  </li>
                )}
              {user && user.user_metadata.role === "admin" && (
                <>
                  <li className="btn dark-btn">
                    <Link href={`/new-user/admin`}>{t("nav.newAdmin")}</Link>
                  </li>
                  <li className="btn dark-btn">
                    <Link href={`/new-user/student`}>
                      {t("nav.newStudent")}
                    </Link>
                  </li>
                </>
              )}
              <li>
                <LanguageSwitcher />
              </li>
            </ul>
          </div>
        </Modal>
      )}
      <Link href="/" className="m-auto w-20">
        <Image
          src="/alrifai_logo.png"
          alt="Alrifai Logo"
          width={500}
          height={481}
        />
      </Link>
      {user ? (
        <Link
          href={`/u/${getProfileRole(user.user_metadata.role)}/${
            user.user_metadata.username
          }`}
          className="ms-auto"
          aria-label={t("polish.profile")}
        >
          {user.user_metadata.profileImageUrl ? (
            <Image
              src={user.user_metadata.profileImageUrl}
              alt="Profile Image"
              width={40}
              height={40}
              className="w-10 h-10 object-cover rounded-full"
            />
          ) : (
            <CircleUser className="size-9 text-primary" />
          )}
        </Link>
      ) : (
        <Link href="/signin" className="btn dark-btn ms-auto">
          {t("common.signIn")}
        </Link>
      )}
    </nav>
  );
};

export default MobileNavbar;
