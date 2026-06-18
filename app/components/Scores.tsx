"use client";

import { useEffect, useState } from "react";
import { capitalize } from "@/lib/utils";
import { ScoreData } from "@/types";
import { fetchAllScores } from "@/services/scoresService";
import supabase from "@/lib/supabaseClient";
import { useLanguage } from "@/contexts/LanguageContext";

const rankStyles: Record<number, string> = {
  0: "bg-yellow-100 border-yellow-400",
  1: "bg-gray-100 border-gray-400",
  2: "bg-orange-100 border-orange-400",
};

const rankMedals: Record<number, string> = {
  0: "🥇",
  1: "🥈",
  2: "🥉",
};

const Scores = () => {
  const [scores, setScores] = useState<ScoreData[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    const loadScores = async () => {
      try {
        const data = await fetchAllScores();
        setScores(data.filter((score) => !score.error));
      } catch {
      } finally {
        setLoading(false);
      }
    };
    loadScores();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("student-scores-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "student_scores" },
        () => {
          fetchAllScores().then((data) =>
            setScores(data.filter((score) => !score.error))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <main className="main-container flex-grow-1 py-8">
        <h1 className="text-3xl font-bold mb-6 text-center">
          {t("scores.leaderboard")}
        </h1>
        <p className="text-center text-gray-500">{t("scores.loading")}</p>
      </main>
    );
  }

  return (
    <main className="main-container flex-grow-1 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">
        {t("scores.leaderboard")}
      </h1>
      {scores.length === 0 ? (
        <p className="text-center text-gray-500">{t("scores.none")}</p>
      ) : (
        <div className="flex flex-col gap-3 max-w-2xl mx-auto">
          {scores.map((student, index) => (
            <div
              key={student.name}
              className={`flex items-center justify-between gap-4 rounded-xl border p-4 ${
                rankStyles[index] || "bg-white border-gray-200"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="font-bold text-secondary w-8 shrink-0">
                  {rankMedals[index] || `#${index + 1}`}
                </span>
                <span className="font-semibold truncate">
                  {capitalize(student.name)}
                </span>
              </div>
              <div className="flex items-center gap-6 shrink-0">
                <span className="text-sm text-secondary">
                  {capitalize(student.group)}
                </span>
                <span className="font-bold text-primary text-lg">
                  {student.score}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default Scores;
