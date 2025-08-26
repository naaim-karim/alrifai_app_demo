"use server";

import { fieldValidators, validateFormData } from "@/lib/validations";
import { SignUpUserData, SignUpResult } from "@/types";

export const signUpNewStudentAction = async (
  formData: FormData
): Promise<SignUpResult> => {
  const data: SignUpUserData = {
    fullname: formData.get("fullname")?.toString() || "",
    username: formData.get("username")?.toString() || "",
    email: formData.get("email")?.toString() || "",
    dateOfBirth: formData.get("dateOfBirth")?.toString() || "",
    joinedOn: formData.get("joinedOn")?.toString() || "",
    group: formData.get("group")?.toString() || "",
    profileImage: formData.get("profileImage") as File,
  };

  const { isValid, errors } = await validateFormData(data, {
    fullname: fieldValidators.fullname,
    username: fieldValidators.username,
    email: fieldValidators.email,
    dateOfBirth: fieldValidators.dateOfBirth,
    joinedOn: fieldValidators.joinedOn,
    group: fieldValidators.group,
    profileImage: fieldValidators.profileImage,
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
