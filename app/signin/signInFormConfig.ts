import { getFieldValidators } from "@/lib/validations";
import { FormField } from "@/types";

export const getSignInFormConfig = (t: (key: string) => string): FormField[] => {
  const fieldValidators = getFieldValidators(t);
  return [
    {
      name: "email",
      label: t("formFields.email"),
      type: "email",
      placeholder: t("formFields.emailPlaceholder"),
      id: "email",
      autoFocus: true,
      validation: fieldValidators.email,
    },
  ];
};
