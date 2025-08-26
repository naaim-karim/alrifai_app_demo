"use server";

import { fieldValidators, validateFormData } from "@/lib/validations";
import { SignInUserData, SignInResult } from "@/types";

export const signInUserAction = async (
  formData: FormData
): Promise<SignInResult> => {
  const data: SignInUserData = {
    email: formData.get("email")?.toString() || "",
  };

  const { isValid, errors } = await validateFormData(data, {
    email: fieldValidators.email,
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
