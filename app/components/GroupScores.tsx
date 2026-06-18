"use client";

import { useEffect, useState } from "react";
import { notFound, redirect } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { capitalize, getFriendlyErrorMessage } from "@/lib/utils";
import { ScoreData } from "@/types";
import {
  fetchGroupScores,
  updateScore,
  deleteScore,
} from "@/services/scoresService";
import toast from "react-hot-toast";
import Loading from "./Loading";
import AddScorePopup from "./AddScorePopup";
import { Minus, Plus, Trash2 } from "lucide-react";

const GroupScores = ({ groupName }: { groupName: string }) => {
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const [students, setStudents] = useState<ScoreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [editingName, setEditingName] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");

  const isAdmin = user?.user_metadata.role === "admin";
  const isOwningTeacher =
    user?.user_metadata.role === "teacher" &&
    user?.user_metadata.group === groupName;
  const isTeacherAssistant = user?.user_metadata.role === "teacher_assistant";
  const canView = isAdmin || isOwningTeacher || isTeacherAssistant;
  const canManageStudents = isAdmin || isOwningTeacher;

  useEffect(() => {
    if (!canView) return;

    const loadStudents = async () => {
      try {
        const data = await fetchGroupScores(groupName);
        setStudents(data.filter((student) => !student.error));
      } catch {
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, [groupName, canView]);

  if (authLoading) {
    return <Loading />;
  }

  if (!user) redirect("/signin?m=sr");
  if (!canView) notFound();

  const handleScoreChange = async (name: string, newScore: number) => {
    const safeScore = Math.max(0, newScore);
    const { error } = await updateScore(name, safeScore);

    if (error) {
      toast.error(getFriendlyErrorMessage(error, t), { duration: 5000 });
      return;
    }

    setStudents((prev) =>
      prev.map((student) =>
        student.name === name ? { ...student, score: safeScore } : student
      )
    );
  };

  const handleDelete = async (name: string) => {
    if (
      !window.confirm(
        t("groupScores.removeConfirm").replace("{name}", capitalize(name))
      )
    ) {
      return;
    }

    const { error } = await deleteScore(name);

    if (error) {
      toast.error(getFriendlyErrorMessage(error, t), { duration: 5000 });
      return;
    }

    toast.success(t("groupScores.removedToast"), { duration: 5000 });
    setStudents((prev) => prev.filter((student) => student.name !== name));
  };

  const startEditing = (student: ScoreData) => {
    setEditingName(student.name);
    setEditingValue(String(student.score));
  };

  const commitEditing = async () => {
    if (editingName === null) return;
    const parsed = parseInt(editingValue, 10);
    if (!isNaN(parsed)) {
      await handleScoreChange(editingName, parsed);
    }
    setEditingName(null);
  };

  if (loading) {
    return (
      <main className="main-container flex-grow-1 py-8">
        <p className="text-center text-gray-500">{t("groupScores.loading")}</p>
      </main>
    );
  }

  return (
    <main className="main-container flex-grow-1 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">
        {capitalize(groupName)} {t("groupScores.scoresSuffix")}
      </h1>
      {students.length === 0 ? (
        <p className="text-center text-gray-500 mb-8">{t("groupScores.none")}</p>
      ) : (
        <div className="flex flex-col gap-3 max-w-2xl mx-auto mb-8">
          {students.map((student) => (
            <div
              key={student.name}
              className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4"
            >
              <span className="font-semibold truncate">
                {capitalize(student.name)}
              </span>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  className="btn light-btn border border-gray-200 p-2"
                  onClick={() => handleScoreChange(student.name, student.score - 1)}
                  aria-label={`Decrease score for ${student.name}`}
                >
                  <Minus className="size-4" />
                </button>
                {editingName === student.name ? (
                  <input
                    type="number"
                    className="input w-20 text-center"
                    value={editingValue}
                    autoFocus
                    onChange={(e) => setEditingValue(e.target.value)}
                    onBlur={commitEditing}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitEditing();
                      if (e.key === "Escape") setEditingName(null);
                    }}
                  />
                ) : (
                  <button
                    type="button"
                    className="font-bold text-primary text-lg w-12 text-center cursor-pointer"
                    onClick={() => startEditing(student)}
                  >
                    {student.score}
                  </button>
                )}
                <button
                  type="button"
                  className="btn light-btn border border-gray-200 p-2"
                  onClick={() => handleScoreChange(student.name, student.score + 1)}
                  aria-label={`Increase score for ${student.name}`}
                >
                  <Plus className="size-4" />
                </button>
                {canManageStudents && (
                  <button
                    type="button"
                    className="text-red-500 p-2 cursor-pointer"
                    onClick={() => handleDelete(student.name)}
                    aria-label={`Remove ${student.name}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {canManageStudents && (
        <button
          type="button"
          className="btn dark-btn block mx-auto"
          onClick={() => setShowAddPopup(true)}
        >
          {t("groupScores.addStudent")}
        </button>
      )}
      {canManageStudents && showAddPopup && (
        <AddScorePopup
          groupName={groupName}
          setShowAddPopup={setShowAddPopup}
          onAdded={(student) => setStudents((prev) => [...prev, student])}
        />
      )}
    </main>
  );
};

export default GroupScores;
