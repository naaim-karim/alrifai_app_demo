"use client";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { notFound, redirect } from "next/navigation";
import { capitalize } from "@/lib/utils";
import {
  ArrowUpRight,
  CircleUser,
  LogOut,
  Users,
  GraduationCap,
  UserPlus,
  Trophy,
  BookOpen,
} from "lucide-react";
import Loading from "./Loading";
import toast from "react-hot-toast";
import { useState } from "react";

export default function UserProfile({ username }: { username: string }) {
  const { user, loading, signOut } = useAuth();
  const { t } = useLanguage();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      const result = await signOut();
      if (!result.success)
        throw new Error(result.error || t("userProfile.unexpectedError"));
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t("userProfile.unexpectedError"),
      );
      setIsSigningOut(false);
    }
  };
  if (loading) return <Loading />;
  if (!user) redirect(isSigningOut ? "/signin" : "/signin?m=sr");
  const profile = user.user_metadata;
  if (profile.username !== username.toLowerCase()) notFound();
  const isAdmin = profile.role === "admin";
  const isTeacher = profile.role === "teacher";
  const isAssistant = profile.role === "teacher_assistant";
  const group = typeof profile.group === "string" ? profile.group : "";
  const shortcuts = [
    ...(isAdmin || isAssistant
      ? [
          {
            href: "/groups",
            title: t("polish.manageGroups"),
            description: t("polish.groupsDesc"),
            icon: Users,
          },
        ]
      : []),
    ...(isAdmin
      ? [
          {
            href: "/students",
            title: t("nav.students"),
            description: t("polish.studentsDesc"),
            icon: GraduationCap,
          },
          {
            href: "/new-user/student",
            title: t("nav.newStudent"),
            description: t("polish.registerDesc"),
            icon: UserPlus,
          },
          {
            href: "/new-user/admin",
            title: t("nav.newAdmin"),
            description: t("polish.staffDesc"),
            icon: UserPlus,
          },
        ]
      : []),
    ...(isTeacher && group
      ? [
          {
            href: `/scores/manage/${encodeURIComponent(group)}`,
            title: t("nav.editScores"),
            description: t("polish.groupsDesc"),
            icon: Users,
          },
        ]
      : []),
    ...(!isAdmin && !isAssistant && group
      ? [
          {
            href: `/group/${encodeURIComponent(group)}`,
            title: t("group.lessons"),
            description: t("polish.lessonsDesc"),
            icon: BookOpen,
          },
        ]
      : []),
    {
      href: "/scores",
      title: t("scores.leaderboard"),
      description: t("polish.scoresDesc"),
      icon: Trophy,
    },
  ];
  return (
    <main className="main-container flex-grow-1 py-10 md:py-14">
      <section className="flex items-center gap-5 pb-8 border-b border-gray-200">
        {profile.profileImageUrl ? (
          <Image
            src={profile.profileImageUrl}
            alt=""
            width={88}
            height={88}
            className="w-22 h-22 object-cover rounded-full"
          />
        ) : (
          <CircleUser
            className="size-20 text-primary shrink-0"
            aria-hidden="true"
          />
        )}
        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold break-words">
            {capitalize(profile.fullname || profile.username || "")}
          </h1>
          <p className="text-secondary mt-1 break-words">@{profile.username}</p>
          <p className="text-sm text-secondary mt-2">
            {t("userProfile.joined")}{" "}
            {typeof profile.joinedOn === "string"
              ? profile.joinedOn.replaceAll("-", "/")
              : "—"}
          </p>
          {group && !isAdmin && !isAssistant && (
            <p className="text-sm text-secondary mt-1">
              {t("userProfile.group")}: {capitalize(group)}
            </p>
          )}
        </div>
      </section>
      <section className="py-8">
        <h2 className="text-xl font-bold">{t("polish.quickAccess")}</h2>
        <p className="text-secondary mt-2 mb-6">{t("polish.workspaceIntro")}</p>
        {!group && !isAdmin && !isAssistant && (
          <p className="state-panel mb-6">{t("polish.noGroup")}</p>
        )}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {shortcuts.map(({ href, title, description, icon: Icon }) => (
            <Link href={href} key={href} className="workspace-card">
              <div className="flex justify-between text-primary">
                <Icon className="size-6" aria-hidden="true" />
                <ArrowUpRight className="size-5" aria-hidden="true" />
              </div>
              <h3 className="font-semibold text-lg mt-2">{title}</h3>
              <p className="text-secondary text-sm leading-relaxed">
                {description}
              </p>
            </Link>
          ))}
        </div>
      </section>
      <div className="border-t border-gray-200 pt-6">
        <button
          type="button"
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="btn border border-gray-200 bg-white text-primary gap-2"
        >
          <LogOut className="size-4" aria-hidden="true" />
          {t(isSigningOut ? "userProfile.signingOut" : "userProfile.signOut")}
        </button>
      </div>
    </main>
  );
}
