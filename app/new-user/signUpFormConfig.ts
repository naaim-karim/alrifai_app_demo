import { fieldValidators } from "@/lib/validations";
import { fetchGroups } from "@/services/groupService";
import type { FormField } from "@/types";

export const getStudentSignUpFormConfig = async (): Promise<FormField[]> => {
  const groups = await fetchGroups();
  const groupOptions = groups
    .map((group) => group.group_name)
    .filter((name): name is string => name !== undefined);

  return [
    {
      name: "fullname",
      label: "Full Name",
      type: "text",
      placeholder: "e.g Mohammad Sadik",
      id: "fullname",
      autoFocus: true,
      validation: fieldValidators.fullname,
    },
    {
      name: "username",
      label: "Username",
      type: "text",
      placeholder: "e.g sadik123",
      id: "username",
      validation: fieldValidators.username,
    },
    {
      name: "dateOfBirth",
      label: "Date of birth",
      type: "date",
      id: "date-of-birth",
      validation: fieldValidators.dateOfBirth,
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      placeholder: "user@example.com",
      id: "email",
      validation: fieldValidators.email,
    },
    {
      name: "joinedOn",
      label: "Joined On",
      type: "date",
      id: "joined-on",
      defaultValue: new Date().toISOString().split("T")[0],
      validation: fieldValidators.joinedOn,
    },
    {
      name: "group",
      label: "Group",
      type: "datalist",
      id: "group",
      options: groupOptions,
      placeholder: "Select Group",
      validation: fieldValidators.group,
    },
    {
      name: "profileImage",
      label: "Profile Image",
      type: "file",
      id: "profile-image",
      validation: fieldValidators.profileImage,
    },
  ];
};

export const getAdminSignUpFormConfig = async (): Promise<FormField[]> => {
  const groups = await fetchGroups();
  const groupOptions = groups
    .map((group) => group.group_name)
    .filter((name): name is string => name !== undefined);

  return [
    {
      name: "fullname",
      label: "Full Name",
      type: "text",
      placeholder: "e.g Mohammad Sadik",
      id: "fullname",
      autoFocus: true,
      validation: fieldValidators.fullname,
    },
    {
      name: "username",
      label: "Username",
      type: "text",
      placeholder: "e.g sadik123",
      id: "username",
      validation: fieldValidators.username,
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      placeholder: "user@example.com",
      id: "email",
      validation: fieldValidators.email,
    },
    {
      name: "role",
      label: "Role",
      type: "datalist",
      id: "role",
      options: ["admin", "teacher"],
      validation: fieldValidators.role,
    },
    {
      name: "joinedOn",
      label: "Joined On",
      type: "date",
      id: "joined-on",
      defaultValue: new Date().toISOString().split("T")[0],
      validation: fieldValidators.joinedOn,
    },
    {
      name: "group",
      label: "Group",
      type: "datalist",
      id: "group",
      options: groupOptions,
      placeholder: "Select Group",
      validation: fieldValidators.group,
    },
    {
      name: "profileImage",
      label: "Profile Image",
      type: "file",
      id: "profile-image",
      validation: fieldValidators.profileImage,
    },
  ];
};
