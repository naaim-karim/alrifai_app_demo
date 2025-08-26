import supabase from "@/lib/supabaseClient";

export const uploadProfileImage = async (
  file: File,
  userId?: string
): Promise<string | null> => {
  try {
    let fileExt = "";
    if (file.type === "image/png") fileExt = "png";
    else if (file.type === "image/jpeg") fileExt = "jpg";
    else if (file.type === "image/webp") fileExt = "webp";
    const fileName = `${userId || Date.now()}-${Math.random()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from("profile-images")
      .upload(fileName, file);
    console.log(data, error);

    if (error) {
      return null;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("profile-images").getPublicUrl(data.path);

    return publicUrl;
  } catch {
    return null;
  }
};
