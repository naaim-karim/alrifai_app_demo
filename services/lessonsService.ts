import supabase from "@/lib/supabaseClient";
import { fetchGroups } from "./groupService";
import { LessonContentsData } from "@/types";

export const fetchGroupLessons = async (
  groupName: string,
): Promise<string[]> => {
  const groups = await fetchGroups();
  const groupError = groups.find((group) => group.error);
  if (groupError) throw new Error(groupError.error);
  const groupId = groups.find((group) => group.group_name === groupName);

  if (!groupId?.id) throw new Error("Group not found");
  const { data, error } = await supabase
    .from("group_lessons")
    .select("lesson_id")
    .eq("group_id", groupId?.id);

  if (error) {
    throw error;
  }

  return data.map((lesson) => lesson.lesson_id);
};

export const fetchLessonContent = async (
  lessonIds: string[],
): Promise<LessonContentsData[]> => {
  if (lessonIds.length === 0) return [];
  const { data, error } = await supabase
    .from("lessons")
    .select("lesson_name, lesson_book")
    .in("id", lessonIds);

  if (error) {
    throw error;
  }

  return data;
};
