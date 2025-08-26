import { fieldValidators } from "@/lib/validations";
import { FormField } from "@/types";

export const getSignInFormConfig = (): FormField[] => {
  return [
    {
      name: "email",
      label: "Email",
      type: "email",
      placeholder: "user@example.com",
      id: "email",
      autoFocus: true,
      validation: fieldValidators.email,
    },
  ];
};
