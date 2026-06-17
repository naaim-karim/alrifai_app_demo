import supabase from "@/lib/supabaseClient";

export const fetchStudentUsernames = async () => {
  const { data, error } = await supabase
    .from("student_profiles")
    .select("username");

  if (error) {
    return [error.message];
  }

  return data.map((student) => student.username);
};

export const fetchAdminUsernames = async () => {
  const { data, error } = await supabase
    .from("teacher_profiles")
    .select("username")
    .eq("role", "admin");

  if (error) {
    return [error.message];
  }

  return data.map((admin) => admin.username);
};

export const fetchTeacherUsernames = async () => {
  const { data, error } = await supabase
    .from("teacher_profiles")
    .select("username")
    .eq("role", "teacher");

  if (error) {
    return [error.message];
  }

  return data.map((teacher) => teacher.username);
};

export const fetchTeacherAssistantUsernames = async () => {
  const { data, error } = await supabase
    .from("teacher_profiles")
    .select("username")
    .eq("role", "teacher_assistant");

  if (error) {
    return [error.message];
  }

  return data.map((teacherAssistant) => teacherAssistant.username);
};
