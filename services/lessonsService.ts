import supabase from "@/lib/supabaseClient";
import { fetchGroups } from "./groupService";
import { LessonContentsData } from "@/types";

export const fetchGroupLessons = async (
  groupName: string
): Promise<string[]> => {
  const groups = await fetchGroups();
  const groupId = groups.find((group) => group.group_name === groupName);

  const { data, error } = await supabase
    .from("group_lessons")
    .select("lesson_id")
    .eq("group_id", groupId?.id);

  if (error) {
    return [error.message];
  }

  return data.map((lesson) => lesson.lesson_id);
};

export const fetchLessonContent = async (
  lessonIds: string[]
): Promise<LessonContentsData[]> => {
  const { data, error } = await supabase
    .from("lessons")
    .select("lesson_name, lesson_book")
    .in("id", lessonIds);

  if (error) {
    return [{ error: error.message }];
  }

  return data;
};
