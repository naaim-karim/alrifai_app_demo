"use client";

import { notFound, redirect } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { capitalize } from "@/lib/utils";
import Loading from "./Loading";
import LoadError from "./LoadError";
import { fetchGroupMembers } from "@/services/groupService";
import {
  fetchGroupLessons,
  fetchLessonContent,
} from "@/services/lessonsService";
import { useCallback, useEffect, useState } from "react";
import { LessonContentsData } from "@/types";

const Group = ({ groupName }: { groupName: string }) => {
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const [groupMembers, setGroupMembers] = useState<string[]>([]);
  const [lessonContents, setLessonContents] = useState<LessonContentsData[]>(
    [],
  );
  const [loading, setLoading] = useState(true);

  const [failed, setFailed] = useState(false);
  const canView = !!user && user.user_metadata.group === groupName;
  const loadData = useCallback(async () => {
    if (!canView) return;
    setLoading(true);
    setFailed(false);
    try {
      const members = await fetchGroupMembers(groupName);
      const ids = await fetchGroupLessons(groupName);
      const lessons = await fetchLessonContent(ids);
      setGroupMembers(members);
      setLessonContents(lessons);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, [groupName, canView]);
  useEffect(() => {
    void loadData();
  }, [loadData]);

  if (authLoading) {
    return <Loading />;
  }

  if (!user) redirect("/signin?m=sr");
  if (user.user_metadata.group !== groupName) notFound();

  if (loading) {
    return (
      <main className="main-container flex-grow-1 py-8">
        <p className="text-center text-gray-500">{t("group.loading")}</p>
      </main>
    );
  }

  return (
    <main className="main-container flex-grow-1">
      {failed && <LoadError retry={loadData} />}
      <section className="py-8">
        <h1 className="text-3xl font-bold text-center mb-6">
          {user?.user_metadata?.group}
        </h1>
        {!failed && groupMembers.length === 0 && (
          <p className="text-secondary mb-4">{t("polish.noMembers")}</p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {groupMembers.map((member) => (
            <div
              key={member}
              className="bg-gray-200 py-2 px-3 rounded-xl w-full text-center"
            >
              <span>{capitalize(member)}</span>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h2 className="text-3xl font-bold mb-6">{t("group.lessons")}</h2>
        {!failed && lessonContents.length === 0 && (
          <p className="text-secondary mb-4">{t("polish.noLessons")}</p>
        )}
        <div className="overflow-x-auto rounded-xl">
          <table className="table-auto w-full border border-gray-200 rounded-lg border-separate border-spacing-0">
            <thead>
              <tr>
                <th className="px-4 py-2 text-start text-sm font-medium border-b-2 border-gray-200">
                  {t("group.subject")}
                </th>
                <th className="px-4 py-2 text-start text-sm font-medium border-b-2 border-gray-200">
                  {t("group.textbook")}
                </th>
              </tr>
            </thead>
            <tbody>
              {lessonContents.map((lesson, index) => (
                <tr key={lesson.lesson_name}>
                  <td
                    className={`px-4 py-2 ${
                      lessonContents.length - 1 > index
                        ? "border-b border-gray-200"
                        : ""
                    }`}
                  >
                    {lesson.lesson_name}
                  </td>
                  <td
                    className={`px-4 py-2 ${
                      lessonContents.length - 1 > index
                        ? "border-b border-gray-200"
                        : ""
                    }`}
                  >
                    {lesson.lesson_book}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
};

export default Group;
