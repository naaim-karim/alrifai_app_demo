"use client";

import { useAuth } from "@/contexts/AuthContext";
import { capitalize, getAge } from "@/lib/utils";
import { fetchStudents } from "@/services/studentsService";
import { StudentData } from "@/types";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Loading from "./Loading";
import { notFound, redirect } from "next/navigation";

const Students = () => {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    const loadStudents = async () => {
      try {
        const data = await fetchStudents();
        setStudents(data);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    loadStudents();
  }, []);

  const filteredStudents = useMemo(() => {
    if (!searchTerm.trim()) return students;

    return students.filter((student) => {
      const name = student.fullname?.toLowerCase() || "";
      const group = student.group?.toLowerCase() || "";
      const age = getAge(student.date_of_birth || "").toString() || "";
      const search = searchTerm.toLowerCase() || "";

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
        <h1 className="text-3xl font-bold mb-6">Students</h1>
        <p className="text-center text-gray-500">Loading students...</p>
      </main>
    );
  }

  return (
    <main className="main-container flex-grow-1 py-8">
      <h1 className="text-3xl font-bold mb-6">Students</h1>
      <div className="relative mb-4">
        <Search className="absolute top-1/2 left-3 transform -translate-y-1/2 text-secondary size-5" />
        <input
          type="search"
          className="input pl-10 placeholder:text-secondary bg-[#ededed]"
          name="search"
          id="search"
          placeholder="Search for students"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>
      {searchTerm && (
        <p className="text-sm text-gray-600 mb-4">
          {filteredStudents.length} student
          {filteredStudents.length !== 1 ? "s" : ""} found
          {searchTerm && ` for "${searchTerm}"`}
        </p>
      )}
      {filteredStudents.length === 0 && !loading && (
        <p className="text-center text-gray-500">
          {searchTerm
            ? "No students found matching your search"
            : "No students found"}
        </p>
      )}
      {filteredStudents.length > 0 && (
        <table className="table-auto w-full border border-gray-200 rounded-lg border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium border-b-2 border-gray-200">
                Name
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium border-b-2 border-gray-200">
                Group
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium border-b-2 border-gray-200">
                Age
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
                  {student.group}
                </td>
                <td
                  className={`px-4 py-4 text-secondary text-sm ${
                    filteredStudents.length - 1 > index
                      ? "border-b border-gray-200"
                      : ""
                  }`}
                >
                  {getAge(student.date_of_birth || "")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
};

export default Students;
