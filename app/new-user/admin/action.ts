"use server";

import { fieldValidators, validateFormData } from "@/lib/validations";
import { SignUpUserData, SignUpResult } from "@/types";

export const signUpNewAdminAction = async (
  formData: FormData
): Promise<SignUpResult> => {
  const data: SignUpUserData = {
    fullname: formData.get("fullname")?.toString() || "",
    username: formData.get("username")?.toString() || "",
    email: formData.get("email")?.toString() || "",
    joinedOn: formData.get("joinedOn")?.toString() || "",
    group: formData.get("group")?.toString() || "",
    profileImage: formData.get("profileImage") as File,
    role: formData.get("role")?.toString() || "",
  };

  const { isValid, errors } = await validateFormData(data, {
    fullname: fieldValidators.fullname,
    username: fieldValidators.username,
    email: fieldValidators.email,
    joinedOn: fieldValidators.joinedOn,
    profileImage: fieldValidators.profileImage,
    role: fieldValidators.role,
  });

  if (!isValid) {
    return {
      success: false,
      errors,
    };
  }

  return {
    success: true,
    data,
  };
};
