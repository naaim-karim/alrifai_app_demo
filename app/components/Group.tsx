"use client";

import { notFound, redirect } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { capitalize } from "@/lib/utils";
import Loading from "./Loading";
import { fetchGroupMembers } from "@/services/groupService";
import {
  fetchGroupLessons,
  fetchLessonContent,
} from "@/services/lessonsService";
import { useEffect, useState } from "react";
import { LessonContentsData } from "@/types";

const Group = ({ groupName }: { groupName: string }) => {
  const { user, loading: authLoading } = useAuth();
  const [groupMembers, setGroupMembers] = useState<string[]>([]);
  const [lessonContents, setLessonContents] = useState<LessonContentsData[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const groupMembers = await fetchGroupMembers(groupName);
        const lessonIds = await fetchGroupLessons(groupName);
        const lessonContents = await fetchLessonContent(lessonIds);

        setGroupMembers(groupMembers);
        setLessonContents(lessonContents);
      } catch {
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [groupName]);

  if (authLoading) {
    return <Loading />;
  }

  if (!user) redirect("/signin?m=sr");
  if (user.user_metadata.group !== groupName) notFound();

  if (loading) {
    return (
      <main className="main-container flex-grow-1 py-8">
        <p className="text-center text-gray-500">Loading group...</p>
      </main>
    );
  }

  return (
    <main className="main-container flex-grow-1">
      <section className="py-8">
        <h1 className="text-3xl font-bold text-center mb-6">
          {user?.user_metadata?.group}
        </h1>
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
        <h2 className="text-3xl font-bold mb-6">Lessons</h2>
        <table className="table-auto w-full border border-gray-200 rounded-lg border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium border-b-2 border-gray-200">
                Subject
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium border-b-2 border-gray-200">
                Textbook
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
      </section>
    </main>
  );
};

export default Group;
