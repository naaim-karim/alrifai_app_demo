"use client";

import { useCallback, useRef, useState } from "react";
import { notFound, redirect } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { capitalize } from "@/lib/utils";
import { useAsyncList } from "@/app/hooks/useAsyncList";
import LoadError from "./LoadError";
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

  const fetchStudents = useCallback(
    () => fetchGroupScores(groupName),
    [groupName],
  );
  const {
    data: students,
    setData: setStudents,
    loading,
    failed,
    reload,
  } = useAsyncList(fetchStudents, canView);
  const pendingRef = useRef(new Set<string>());
  const [pending, setPending] = useState(new Set<string>());
  const lockRow = (name: string) => {
    if (pendingRef.current.has(name)) return false;
    pendingRef.current.add(name);
    setPending(new Set(pendingRef.current));
    return true;
  };
  const unlockRow = (name: string) => {
    pendingRef.current.delete(name);
    setPending(new Set(pendingRef.current));
  };

  if (authLoading) {
    return <Loading />;
  }

  if (!user) redirect("/signin?m=sr");
  if (!canView) notFound();

  const handleScoreChange = async (name: string, newScore: number) => {
    if (!Number.isInteger(newScore) || newScore < 0 || newScore > 2147483647) {
      toast.error(t("polish.invalidScore"));
      return false;
    }
    if (!lockRow(name)) return false;
    try {
      const { error } = await updateScore(name, groupName, newScore);
      if (error) throw error;
      setStudents((prev) =>
        prev.map((student) =>
          student.name === name ? { ...student, score: newScore } : student,
        ),
      );
      return true;
    } catch {
      toast.error(t("errors.generic"));
      return false;
    } finally {
      unlockRow(name);
    }
  };
  const handleDelete = async (name: string) => {
    if (
      pendingRef.current.has(name) ||
      !window.confirm(
        t("groupScores.removeConfirm").replace("{name}", capitalize(name)),
      )
    )
      return;
    if (!lockRow(name)) return;
    try {
      const { error } = await deleteScore(name, groupName);
      if (error) throw error;
      setStudents((prev) => prev.filter((student) => student.name !== name));
      toast.success(t("groupScores.removedToast"));
    } catch {
      toast.error(t("errors.generic"));
    } finally {
      unlockRow(name);
    }
  };

  const startEditing = (student: ScoreData) => {
    setEditingName(student.name);
    setEditingValue(String(student.score));
  };

  const commitEditing = async () => {
    if (editingName === null || pendingRef.current.has(editingName)) return;
    const parsed = editingValue.trim() === "" ? NaN : Number(editingValue);
    if (await handleScoreChange(editingName, parsed)) setEditingName(null);
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
      {failed ? (
        <LoadError retry={reload} />
      ) : students.length === 0 ? (
        <p className="text-center text-gray-500 mb-8">
          {t("groupScores.none")}
        </p>
      ) : (
        <div className="flex flex-col gap-3 max-w-2xl mx-auto mb-8">
          {students.map((student) => (
            <div
              key={student.name}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4"
            >
              <span className="font-semibold truncate">
                {capitalize(student.name)}
              </span>
              <div
                className="flex items-center flex-wrap gap-2 shrink-0"
                aria-busy={pending.has(student.name)}
              >
                <button
                  type="button"
                  className="btn light-btn border border-gray-200 p-2"
                  onClick={() =>
                    handleScoreChange(student.name, student.score - 1)
                  }
                  disabled={
                    pending.has(student.name) ||
                    editingName === student.name ||
                    student.score === 0
                  }
                  aria-label={t("polish.decrease").replace(
                    "{name}",
                    capitalize(student.name),
                  )}
                >
                  <Minus className="size-4" />
                </button>
                {editingName === student.name ? (
                  <input
                    type="number"
                    className="input w-20 text-center"
                    min={0}
                    max={2147483647}
                    step={1}
                    disabled={pending.has(student.name)}
                    aria-label={t("polish.editScore").replace(
                      "{name}",
                      capitalize(student.name),
                    )}
                    value={editingValue}
                    autoFocus
                    onChange={(e) => setEditingValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        void commitEditing();
                      }
                      if (e.key === "Escape") setEditingName(null);
                    }}
                  />
                ) : (
                  <button
                    type="button"
                    className="font-bold text-primary text-lg w-12 text-center cursor-pointer"
                    disabled={pending.has(student.name)}
                    aria-label={t("polish.editScore").replace(
                      "{name}",
                      capitalize(student.name),
                    )}
                    onClick={() => startEditing(student)}
                  >
                    {student.score}
                  </button>
                )}
                <button
                  type="button"
                  className="btn light-btn border border-gray-200 p-2"
                  onClick={() =>
                    handleScoreChange(student.name, student.score + 1)
                  }
                  disabled={
                    pending.has(student.name) ||
                    editingName === student.name ||
                    student.score === 2147483647
                  }
                  aria-label={t("polish.increase").replace(
                    "{name}",
                    capitalize(student.name),
                  )}
                >
                  <Plus className="size-4" />
                </button>
                {editingName === student.name && (
                  <>
                    <button
                      type="button"
                      className="btn dark-btn text-sm"
                      disabled={pending.has(student.name)}
                      onClick={commitEditing}
                    >
                      {t(
                        pending.has(student.name)
                          ? "polish.saving"
                          : "polish.save",
                      )}
                    </button>
                    <button
                      type="button"
                      className="btn text-sm"
                      disabled={pending.has(student.name)}
                      onClick={() => setEditingName(null)}
                    >
                      {t("polish.cancel")}
                    </button>
                  </>
                )}
                {canManageStudents && !failed && (
                  <button
                    type="button"
                    className="text-red-500 p-2 cursor-pointer"
                    onClick={() => handleDelete(student.name)}
                    disabled={
                      pending.has(student.name) || editingName === student.name
                    }
                    aria-label={t("polish.remove").replace(
                      "{name}",
                      capitalize(student.name),
                    )}
                  >
                    <Trash2 className="size-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {canManageStudents && !failed && (
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
