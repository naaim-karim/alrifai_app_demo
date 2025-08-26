import supabase from "@/lib/supabaseClient";
import { GroupData } from "@/types";

export const fetchGroups = async (): Promise<GroupData[]> => {
  const { data, error } = await supabase
    .from("groups")
    .select("group_name, id")
    .order("group_name", { ascending: true });

  if (error) {
    return [{ error: error.message }];
  }

  return data.map((group) => ({ group_name: group.group_name, id: group.id }));
};

export const fetchGroupMembers = async (
  groupName: string
): Promise<string[]> => {
  const { data, error } = await supabase
    .from("student_profiles")
    .select("fullname")
    .eq("group", groupName);

  if (error) {
    return [error.message];
  }

  return data.map((member) => member.fullname);
};
