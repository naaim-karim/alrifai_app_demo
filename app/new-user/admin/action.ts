"use server";

import { cookies } from "next/headers";
import { getTranslator, type Locale } from "@/locales";
import { getFieldValidators, validateFormData } from "@/lib/validations";
import { SignUpUserData, SignUpResult } from "@/types";

export const signUpNewAdminAction = async (
  formData: FormData
): Promise<SignUpResult> => {
  const locale = ((await cookies()).get("locale")?.value as Locale) || "en";
  const fieldValidators = getFieldValidators(getTranslator(locale));

  const firstName = formData.get("firstName")?.toString() || "";
  const lastName = formData.get("lastName")?.toString() || "";

  const { isValid: isNameValid, errors: nameErrors } = await validateFormData(
    { firstName, lastName },
    { firstName: fieldValidators.firstName, lastName: fieldValidators.lastName }
  );

  const data: SignUpUserData = {
    fullname: `${firstName.replace(/\s+/g, "")} ${lastName.replace(
      /\s+/g,
      ""
    )}`,
    username: formData.get("username")?.toString() || "",
    email: formData.get("email")?.toString() || "",
    joinedOn: formData.get("joinedOn")?.toString() || "",
    group: formData.get("group")?.toString() || "",
    profileImage: formData.get("profileImage") as File,
    role: formData.get("role")?.toString() || "",
  };

  const { isValid, errors } = await validateFormData(data, {
    username: fieldValidators.username,
    email: fieldValidators.email,
    joinedOn: fieldValidators.joinedOn,
    profileImage: fieldValidators.profileImage,
    role: fieldValidators.role,
  });

  if (!isNameValid || !isValid) {
    return {
      success: false,
      errors: { ...nameErrors, ...errors },
    };
  }

  return {
    success: true,
    data,
  };
};
