import { getFieldValidators } from "@/lib/validations";
import { fetchGroups } from "@/services/groupService";
import type { FormField } from "@/types";

export const getStudentSignUpFormConfig = async (
  t: (key: string) => string
): Promise<FormField[]> => {
  const fieldValidators = getFieldValidators(t);
  const groups = await fetchGroups();
  const groupOptions = groups
    .map((group) => group.group_name)
    .filter((name): name is string => name !== undefined);

  return [
    {
      name: "firstName",
      label: t("formFields.firstName"),
      type: "text",
      placeholder: t("formFields.firstNamePlaceholder"),
      id: "first-name",
      autoFocus: true,
      validation: fieldValidators.firstName,
    },
    {
      name: "lastName",
      label: t("formFields.lastName"),
      type: "text",
      placeholder: t("formFields.lastNamePlaceholder"),
      id: "last-name",
      validation: fieldValidators.lastName,
    },
    {
      name: "username",
      label: t("formFields.username"),
      type: "text",
      placeholder: t("formFields.usernamePlaceholder"),
      id: "username",
      validation: fieldValidators.username,
    },
    {
      name: "dateOfBirth",
      label: t("formFields.dateOfBirth"),
      type: "date",
      id: "date-of-birth",
      validation: fieldValidators.dateOfBirth,
    },
    {
      name: "email",
      label: t("formFields.email"),
      type: "email",
      placeholder: t("formFields.emailPlaceholder"),
      id: "email",
      validation: fieldValidators.email,
    },
    {
      name: "joinedOn",
      label: t("formFields.joinedOn"),
      type: "date",
      id: "joined-on",
      defaultValue: new Date().toISOString().split("T")[0],
      validation: fieldValidators.joinedOn,
    },
    {
      name: "group",
      label: t("formFields.group"),
      type: "datalist",
      id: "group",
      options: groupOptions,
      placeholder: t("formFields.groupPlaceholder"),
      validation: fieldValidators.group,
    },
    {
      name: "profileImage",
      label: t("formFields.profileImage"),
      type: "file",
      id: "profile-image",
      validation: fieldValidators.profileImage,
    },
  ];
};

export const getAdminSignUpFormConfig = async (
  t: (key: string) => string,
  role?: string
): Promise<FormField[]> => {
  const fieldValidators = getFieldValidators(t);
  const groups = await fetchGroups();
  const groupOptions = groups
    .map((group) => group.group_name)
    .filter((name): name is string => name !== undefined);

  const fields: FormField[] = [
    {
      name: "firstName",
      label: t("formFields.firstName"),
      type: "text",
      placeholder: t("formFields.firstNamePlaceholder"),
      id: "first-name",
      autoFocus: true,
      validation: fieldValidators.firstName,
    },
    {
      name: "lastName",
      label: t("formFields.lastName"),
      type: "text",
      placeholder: t("formFields.lastNamePlaceholder"),
      id: "last-name",
      validation: fieldValidators.lastName,
    },
    {
      name: "username",
      label: t("formFields.username"),
      type: "text",
      placeholder: t("formFields.usernamePlaceholder"),
      id: "username",
      validation: fieldValidators.username,
    },
    {
      name: "email",
      label: t("formFields.email"),
      type: "email",
      placeholder: t("formFields.emailPlaceholder"),
      id: "email",
      validation: fieldValidators.email,
    },
    {
      name: "role",
      label: t("formFields.role"),
      type: "datalist",
      id: "role",
      options: ["admin", "teacher", "teacher_assistant"],
      validation: fieldValidators.role,
    },
    {
      name: "joinedOn",
      label: t("formFields.joinedOn"),
      type: "date",
      id: "joined-on",
      defaultValue: new Date().toISOString().split("T")[0],
      validation: fieldValidators.joinedOn,
    },
  ];

  if (role === "teacher") {
    fields.push({
      name: "group",
      label: t("formFields.group"),
      type: "datalist",
      id: "group",
      options: groupOptions,
      placeholder: t("formFields.groupPlaceholder"),
      validation: fieldValidators.group,
    });
  }

  fields.push({
    name: "profileImage",
    label: t("formFields.profileImage"),
    type: "file",
    id: "profile-image",
    validation: fieldValidators.profileImage,
  });

  return fields;
};
