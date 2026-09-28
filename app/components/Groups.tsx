"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useAsyncList } from "@/app/hooks/useAsyncList";
import LoadError from "./LoadError";
import { useLanguage } from "@/contexts/LanguageContext";
import { capitalize } from "@/lib/utils";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Loading from "./Loading";
import { notFound, redirect } from "next/navigation";
import { fetchGroups } from "@/services/groupService";
import Image from "next/image";
import Link from "next/link";
import CreatePopup from "./CreatePopup";
import supabase from "@/lib/supabaseClient";

const Groups = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();

  const {
    data: groups,
    setData: setGroups,
    loading,
    failed,
    reload,
  } = useAsyncList(
    fetchGroups,
    user?.user_metadata.role === "admin" ||
      user?.user_metadata.role === "teacher_assistant",
  );

  useEffect(() => {
    if (
      !user ||
      !["admin", "teacher_assistant"].includes(user.user_metadata.role)
    )
      return;
    const channel = supabase
      .channel("groups-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "groups",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setGroups((prev) => [
              payload.new,
              ...prev.filter((group) => group.id !== payload.new.id),
            ]);
          } else if (payload.eventType === "UPDATE") {
            setGroups((prev) =>
              prev.map((group) =>
                group.id === payload.new.id ? payload.new : group,
              ),
            );
          } else if (payload.eventType === "DELETE") {
            setGroups((prev) =>
              prev.filter((group) => group.id !== payload.old.id),
            );
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, setGroups]);

  const filteredGroups = useMemo(() => {
    if (!searchTerm.trim()) return groups;

    return groups.filter((group) => {
      const name = group.group_name?.toLowerCase() || "";
      const search = searchTerm.trim().toLowerCase() || "";

      return name.includes(search);
    });
  }, [searchTerm, groups]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  if (authLoading) {
    return <Loading />;
  }

  const isAdmin = user?.user_metadata.role === "admin";
  const isTeacherAssistant = user?.user_metadata.role === "teacher_assistant";

  if (!user) redirect("/signin?m=sr");
  if (!isAdmin && !isTeacherAssistant) notFound();

  if (loading) {
    return (
      <main className="main-container flex-grow-1 py-8">
        <h1 className="text-3xl font-bold mb-6">{t("groups.title")}</h1>
        <p className="text-center text-gray-500">{t("groups.loading")}</p>
      </main>
    );
  }

  return (
    <main className="main-container flex-grow-1 py-8">
      <h1 className="text-3xl font-bold mb-6">{t("groups.title")}</h1>
      {failed && <LoadError retry={reload} />}
      <div className="relative mb-4">
        <Search className="absolute top-1/2 start-3 transform -translate-y-1/2 text-secondary size-5" />
        <input
          aria-label={t("groups.searchPlaceholder")}
          type="search"
          className="input ps-10 placeholder:text-secondary bg-[#ededed]"
          name="search"
          id="search"
          placeholder={t("groups.searchPlaceholder")}
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>
      {searchTerm && (
        <p className="text-sm text-gray-600 mb-4" role="status">
          {filteredGroups.length}{" "}
          {filteredGroups.length !== 1
            ? t("groups.foundMany")
            : t("groups.foundOne")}
          {searchTerm &&
            " " + t("polish.searchFor").replace("{query}", searchTerm)}
        </p>
      )}
      {searchTerm && (
        <button
          type="button"
          className="text-primary underline mb-4 text-sm"
          onClick={() => setSearchTerm("")}
        >
          {t("polish.clearSearch")}
        </button>
      )}
      {filteredGroups.length === 0 && !loading && !failed && (
        <p className="text-center text-gray-500">
          {searchTerm ? t("groups.noMatch") : t("groups.none")}
        </p>
      )}
      {filteredGroups.length > 0 && (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => (
            <Link
              key={group.id}
              href={`/scores/manage/${encodeURIComponent(group.group_name || "")}`}
              className="group-card"
            >
              <Image
                src="/group.png"
                alt="Group Image"
                width={1536}
                height={1024}
                className="w-full h-36 object-contain mb-5"
              />
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-end">
                  {capitalize(group.group_name || "")}
                </h2>
                <span>
                  {group.closed ? t("groups.closed") : t("groups.open")}
                </span>
              </div>
            </Link>
          ))}
        </section>
      )}
      {isAdmin && (
        <button
          className="btn dark-btn mt-8 block mx-auto lg:ms-auto lg:mx-0"
          onClick={() => setShowCreatePopup(true)}
        >
          {t("groups.createNew")}
        </button>
      )}
      {isAdmin && showCreatePopup && (
        <CreatePopup
          setShowCreatePopup={setShowCreatePopup}
          onCreated={reload}
        />
      )}
    </main>
  );
};

export default Groups;
