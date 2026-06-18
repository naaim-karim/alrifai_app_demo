"use server";

import { cookies } from "next/headers";
import { getTranslator, type Locale } from "@/locales";
import { getFieldValidators, validateFormData } from "@/lib/validations";
import { SignInUserData, SignInResult } from "@/types";

export const signInUserAction = async (
  formData: FormData
): Promise<SignInResult> => {
  const locale = ((await cookies()).get("locale")?.value as Locale) || "en";
  const fieldValidators = getFieldValidators(getTranslator(locale));

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
