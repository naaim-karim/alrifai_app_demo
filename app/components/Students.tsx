"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useAsyncList } from "@/app/hooks/useAsyncList";
import LoadError from "./LoadError";
import { useLanguage } from "@/contexts/LanguageContext";
import { capitalize, getAge } from "@/lib/utils";
import { fetchStudents } from "@/services/studentsService";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import Loading from "./Loading";
import { notFound, redirect } from "next/navigation";

const Students = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();

  const {
    data: students,
    loading,
    failed,
    reload,
  } = useAsyncList(fetchStudents, user?.user_metadata.role === "admin");

  const filteredStudents = useMemo(() => {
    if (!searchTerm.trim()) return students;

    return students.filter((student) => {
      const name = student.fullname?.toLowerCase() || "";
      const group = student.group?.toLowerCase() || "";
      const age = (getAge(student.date_of_birth || "") ?? "").toString() || "";
      const search = searchTerm.trim().toLowerCase() || "";

      return (
        name.includes(search) || group.includes(search) || age.includes(search)
      );
    });
  }, [searchTerm, students]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  if (authLoading) {
    return <Loading />;
  }

  if (!user) redirect("/signin?m=sr");
  if (user.user_metadata.role !== "admin") notFound();

  if (loading) {
    return (
      <main className="main-container flex-grow-1 py-8">
        <h1 className="text-3xl font-bold mb-6">{t("students.title")}</h1>
        <p className="text-center text-gray-500">{t("students.loading")}</p>
      </main>
    );
  }

  return (
    <main className="main-container flex-grow-1 py-8">
      <h1 className="text-3xl font-bold mb-6">{t("students.title")}</h1>
      {failed && <LoadError retry={reload} />}
      <div className="relative mb-4">
        <Search className="absolute top-1/2 start-3 transform -translate-y-1/2 text-secondary size-5" />
        <input
          aria-label={t("students.searchPlaceholder")}
          type="search"
          className="input ps-10 placeholder:text-secondary bg-[#ededed]"
          name="search"
          id="search"
          placeholder={t("students.searchPlaceholder")}
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>
      {searchTerm && (
        <p className="text-sm text-gray-600 mb-4" role="status">
          {filteredStudents.length}{" "}
          {filteredStudents.length !== 1
            ? t("students.foundMany")
            : t("students.foundOne")}
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
      {filteredStudents.length === 0 && !loading && !failed && (
        <p className="text-center text-gray-500">
          {searchTerm ? t("students.noMatch") : t("students.none")}
        </p>
      )}
      {filteredStudents.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="table-auto w-full min-w-[420px] rounded-lg border-separate border-spacing-0">
            <thead>
              <tr>
                <th className="px-4 py-2 text-start text-sm font-medium border-b-2 border-gray-200">
                  {t("students.name")}
                </th>
                <th className="px-4 py-2 text-start text-sm font-medium border-b-2 border-gray-200">
                  {t("students.group")}
                </th>
                <th className="px-4 py-2 text-start text-sm font-medium border-b-2 border-gray-200">
                  {t("students.age")}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student, index) => (
                <tr key={student.fullname}>
                  <td
                    className={`px-4 py-4 text-sm ${
                      filteredStudents.length - 1 > index
                        ? "border-b border-gray-200"
                        : ""
                    }`}
                  >
                    {capitalize(student.fullname || "")}
                  </td>
                  <td
                    className={`px-4 py-4 text-secondary text-sm ${
                      filteredStudents.length - 1 > index
                        ? "border-b border-gray-200"
                        : ""
                    }`}
                  >
                    {student.group ? capitalize(student.group) : "—"}
                  </td>
                  <td
                    className={`px-4 py-4 text-secondary text-sm ${
                      filteredStudents.length - 1 > index
                        ? "border-b border-gray-200"
                        : ""
                    }`}
                  >
                    {getAge(student.date_of_birth || "") ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
};

export default Students;
