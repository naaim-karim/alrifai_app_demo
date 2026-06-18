import { fetchGroups } from "@/services/groupService";
import {
  fetchStudentUsernames,
  fetchAdminUsernames,
  fetchTeacherUsernames,
  fetchTeacherAssistantUsernames,
} from "@/services/usernameService";
import { fetchScoreNames } from "@/services/scoresService";
import type { ValidationResult, ValidationFunction, FormValue } from "@/types";

let groupOptionsCache: string[] | null = null;
let studentUsernamesCache: string[] | null = null;
let adminUsernamesCache: string[] | null = null;
let teacherUsernamesCache: string[] | null = null;
let teacherAssistantUsernamesCache: string[] | null = null;
let scoreNamesCache: string[] | null = null;

const getGroupOptions = async (): Promise<string[]> => {
  if (!groupOptionsCache) {
    const groups = await fetchGroups();
    groupOptionsCache = groups
      .map((group) => group.group_name)
      .filter((name): name is string => name !== undefined);
  }
  return groupOptionsCache;
};

const getStudentUsernames = async (): Promise<string[]> => {
  if (!studentUsernamesCache) {
    studentUsernamesCache = await fetchStudentUsernames();
  }
  return studentUsernamesCache;
};

const getAdminUsernames = async (): Promise<string[]> => {
  if (!adminUsernamesCache) {
    adminUsernamesCache = await fetchAdminUsernames();
  }
  return adminUsernamesCache;
};

const getTeacherUsernames = async (): Promise<string[]> => {
  if (!teacherUsernamesCache) {
    teacherUsernamesCache = await fetchTeacherUsernames();
  }
  return teacherUsernamesCache;
};

const getTeacherAssistantUsernames = async (): Promise<string[]> => {
  if (!teacherAssistantUsernamesCache) {
    teacherAssistantUsernamesCache = await fetchTeacherAssistantUsernames();
  }
  return teacherAssistantUsernamesCache;
};

const getScoreNames = async (): Promise<string[]> => {
  if (!scoreNamesCache) {
    scoreNamesCache = await fetchScoreNames();
  }
  return scoreNamesCache;
};

export const getValidations = (t: (key: string) => string) => ({
  required:
    (fieldName: string): ValidationFunction =>
    (value: FormValue): ValidationResult => {
      const message = t("validationMessages.required").replace(
        "{field}",
        fieldName
      );
      if (typeof value === "string") {
        return !value?.trim() ? message : null;
      }
      if (value instanceof File) {
        return null;
      }
      return message;
    },

  minLength:
    (min: number, fieldName: string): ValidationFunction =>
    (value: FormValue) => {
      if (typeof value === "string" && value && value.length < min) {
        return t("validationMessages.minLength")
          .replace("{field}", fieldName)
          .replace("{min}", String(min));
      }
      return null;
    },

  fullname: (value: FormValue): ValidationResult => {
    if (typeof value !== "string") return null;
    const fullnameRegex = /^[a-zA-Z؀-ۿ ]+$/;
    if (!fullnameRegex.test(value)) {
      return t("validationMessages.fullnameLetters");
    }
    return null;
  },

  email: (value: FormValue): ValidationResult => {
    if (typeof value !== "string") return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return t("validationMessages.emailInvalid");
    }
    return null;
  },

  username: async (value: FormValue): Promise<ValidationResult> => {
    if (typeof value !== "string") return null;

    const studentUsernames = await getStudentUsernames();
    const adminUsernames = await getAdminUsernames();
    const teacherUsernames = await getTeacherUsernames();
    const teacherAssistantUsernames = await getTeacherAssistantUsernames();

    const studentUsername = studentUsernames.find(
      (username) => username.toLowerCase() === value.toLowerCase()
    );
    const adminUsername = adminUsernames.find(
      (username) => username.toLowerCase() === value.toLowerCase()
    );
    const teacherUsername = teacherUsernames.find(
      (username) => username.toLowerCase() === value.toLowerCase()
    );
    const teacherAssistantUsername = teacherAssistantUsernames.find(
      (username) => username.toLowerCase() === value.toLowerCase()
    );
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      return t("validationMessages.usernameChars");
    }
    if (
      studentUsername ||
      adminUsername ||
      teacherUsername ||
      teacherAssistantUsername
    ) {
      return t("validationMessages.usernameTaken");
    }
    return null;
  },

  age:
    (minAge: number): ValidationFunction =>
    (value: FormValue) => {
      if (typeof value !== "string") return null;

      const date = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - date.getFullYear();

      if (age < minAge) {
        return t("validationMessages.ageMin").replace("{min}", String(minAge));
      }
      return null;
    },

  date: (value: FormValue): ValidationResult => {
    if (typeof value !== "string") return null;

    const date = new Date(value);
    const today = new Date();

    if (date > today) {
      return t("validationMessages.dateFuture");
    }
    return null;
  },

  fileSize:
    (maxSizeMB: number): ValidationFunction =>
    (value: FormValue) => {
      if (!(value instanceof File)) {
        return null;
      }

      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      if (value.size > maxSizeBytes) {
        return t("validationMessages.fileSizeMax").replace(
          "{max}",
          String(maxSizeMB)
        );
      }
      return null;
    },

  fileType:
    (allowedTypes: string[]): ValidationFunction =>
    (value: FormValue) => {
      if (!(value instanceof File)) return null;
      else if (!value || value.size === 0) return null;
      else if (!allowedTypes.includes(value.type)) {
        const typeNames = allowedTypes.map((type) =>
          type.split("/")[1].toUpperCase()
        );
        return t("validationMessages.fileTypeAllowed").replace(
          "{types}",
          typeNames.join(", ")
        );
      }
      return null;
    },

  fileRequired:
    (fieldName: string): ValidationFunction =>
    (value: FormValue) => {
      if (!(value instanceof File)) {
        return t("validationMessages.required").replace("{field}", fieldName);
      }
      return null;
    },

  group: async (value: FormValue): Promise<ValidationResult> => {
    if (typeof value !== "string") return null;

    const groupOptions = await getGroupOptions();
    const selectedOption = groupOptions.find(
      (option) => option.toLowerCase() === value.toLowerCase()
    );
    return !selectedOption
      ? t("validationMessages.notOption").replace("{value}", value)
      : null;
  },

  role: (value: FormValue): ValidationResult => {
    if (typeof value !== "string") return null;

    const selectedOption = ["admin", "teacher", "teacher_assistant"].find(
      (option) => option.toLowerCase() === value.toLowerCase()
    );
    return !selectedOption
      ? t("validationMessages.notOption").replace("{value}", value)
      : null;
  },

  scoreName: async (value: FormValue): Promise<ValidationResult> => {
    if (typeof value !== "string") return null;

    if (!/^[a-zA-Z؀-ۿ ]+$/.test(value)) {
      return t("validationMessages.scoreNameLetters");
    }

    const scoreNames = await getScoreNames();
    const existingName = scoreNames.find(
      (name) => name.toLowerCase() === value.trim().toLowerCase()
    );
    if (existingName) {
      return t("validationMessages.scoreNameTaken");
    }
    return null;
  },
});

export const createValidator = <T>(
  ...validators: (
    | ValidationFunction<T>
    | ((value: T) => Promise<ValidationResult>)
  )[]
) => {
  return async (value: T): Promise<ValidationResult> => {
    for (const validator of validators) {
      const error = await validator(value);
      if (error) return error;
    }
    return null;
  };
};

export const getFieldValidators = (t: (key: string) => string) => {
  const validations = getValidations(t);

  return {
    firstName: createValidator(
      validations.required(t("formFields.firstName")),
      validations.minLength(2, t("formFields.firstName")),
      validations.fullname
    ),

    lastName: createValidator(
      validations.required(t("formFields.lastName")),
      validations.minLength(2, t("formFields.lastName")),
      validations.fullname
    ),

    username: createValidator(
      validations.required(t("formFields.username")),
      validations.minLength(3, t("formFields.username")),
      validations.username
    ),

    email: createValidator(
      validations.required(t("formFields.email")),
      validations.email
    ),

    dateOfBirth: createValidator(
      validations.required(t("formFields.dateOfBirth")),
      validations.date,
      validations.age(8)
    ),

    joinedOn: createValidator(
      validations.required(t("formFields.joinedOn")),
      validations.date
    ),

    group: createValidator(
      validations.required(t("formFields.group")),
      validations.group
    ),

    role: createValidator(
      validations.required(t("formFields.role")),
      validations.role
    ),

    profileImage: createValidator(
      validations.fileSize(5),
      validations.fileType(["image/png", "image/jpeg", "image/webp"])
    ),

    scoreName: createValidator(
      validations.required(t("formFields.name")),
      validations.minLength(2, t("formFields.name")),
      validations.scoreName
    ),
  };
};

export const validateFormData = async <T extends Record<string, FormValue>>(
  data: T,
  schema: { [K in keyof T]?: ValidationFunction }
): Promise<{ isValid: boolean; errors: Partial<Record<keyof T, string>> }> => {
  const errors: Partial<Record<keyof T, string>> = {};

  for (const key in schema) {
    const validator = schema[key];
    if (validator) {
      const error = await validator(data[key]);
      if (error && typeof error === "string") {
        errors[key] = error;
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
