import supabase from "@/lib/supabaseClient";
import { StudentData } from "@/types";

export const fetchStudents = async (): Promise<StudentData[]> => {
  const { data, error } = await supabase
    .from("student_profiles")
    .select("fullname, group, date_of_birth");

  if (error) {
    return [{ error: error.message }];
  }

  return data;
};
