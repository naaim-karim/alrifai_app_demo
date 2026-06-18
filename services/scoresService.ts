import supabase from "@/lib/supabaseClient";
import { ScoreData } from "@/types";

export const fetchAllScores = async (): Promise<ScoreData[]> => {
  const { data, error } = await supabase
    .from("student_scores")
    .select("name, score, group")
    .order("score", { ascending: false });

  if (error) {
    return [{ name: "", score: 0, group: "", error: error.message }];
  }

  return data;
};

export const fetchGroupScores = async (
  groupName: string
): Promise<ScoreData[]> => {
  const { data, error } = await supabase
    .from("student_scores")
    .select("name, score, group")
    .eq("group", groupName)
    .order("score", { ascending: false });

  if (error) {
    return [{ name: "", score: 0, group: "", error: error.message }];
  }

  return data;
};

export const fetchScoreNames = async (): Promise<string[]> => {
  const { data, error } = await supabase.from("student_scores").select("name");

  if (error) {
    return [error.message];
  }

  return data.map((record) => record.name);
};

export const insertScore = async (name: string, group: string) => {
  return await supabase
    .from("student_scores")
    .insert({ name: name.toLowerCase(), score: 0, group });
};

export const updateScore = async (name: string, score: number) => {
  return await supabase
    .from("student_scores")
    .update({ score })
    .eq("name", name);
};

export const deleteScore = async (name: string) => {
  return await supabase.from("student_scores").delete().eq("name", name);
};
