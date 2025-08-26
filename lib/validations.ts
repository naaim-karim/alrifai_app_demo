import { fetchGroups } from "@/services/groupService";
import {
  fetchStudentUsernames,
  fetchAdminUsernames,
  fetchTeacherUsernames,
} from "@/services/usernameService";
import type { ValidationResult, ValidationFunction, FormValue } from "@/types";

let groupOptionsCache: string[] | null = null;
let studentUsernamesCache: string[] | null = null;
let adminUsernamesCache: string[] | null = null;
let teacherUsernamesCache: string[] | null = null;

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

export const validations = {
  required:
    (fieldName: string): ValidationFunction =>
    (value: FormValue): ValidationResult => {
      if (typeof value === "string") {
        return !value?.trim() ? `${fieldName} is required` : null;
      }
      if (value instanceof File) {
        return null;
      }
      return `${fieldName} is required`;
    },

  minLength:
    (min: number, fieldName: string): ValidationFunction =>
    (value: FormValue) => {
      if (typeof value === "string" && value && value.length < min) {
        return `${fieldName} must be at least ${min} characters`;
      }
      return null;
    },

  fullname: (value: FormValue): ValidationResult => {
    if (typeof value !== "string") return null;
    const fullnameRegex = /^[a-zA-Z ]+$/;
    if (!fullnameRegex.test(value)) {
      return "Full name can only contain letters and spaces";
    }
    if (!value.includes(" ") || value.split(" ").length < 2) {
      return "Full name must be at least 2 words";
    }
    return null;
  },

  email: (value: FormValue): ValidationResult => {
    if (typeof value !== "string") return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return "Please enter a valid email address";
    }
    return null;
  },

  username: async (value: FormValue): Promise<ValidationResult> => {
    if (typeof value !== "string") return null;

    const studentUsernames = await getStudentUsernames();
    const adminUsernames = await getAdminUsernames();
    const teacherUsernames = await getTeacherUsernames();

    const studentUsername = studentUsernames.find(
      (username) => username.toLowerCase() === value.toLowerCase()
    );
    const adminUsername = adminUsernames.find(
      (username) => username.toLowerCase() === value.toLowerCase()
    );
    const teacherUsername = teacherUsernames.find(
      (username) => username.toLowerCase() === value.toLowerCase()
    );
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      return "Username can only contain letters, numbers, and underscores";
    }
    if (studentUsername || adminUsername || teacherUsername) {
      return "Username is already taken";
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
        return `You must be at least ${minAge} years old`;
      }
      return null;
    },

  date: (value: FormValue): ValidationResult => {
    if (typeof value !== "string") return null;

    const date = new Date(value);
    const today = new Date();

    if (date > today) {
      return "Date cannot be in the future";
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
        return `File size must be less than ${maxSizeMB}MB`;
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
        return `Only ${typeNames.join(", ")} files are allowed`;
      }
      return null;
    },

  fileRequired:
    (fieldName: string): ValidationFunction =>
    (value: FormValue) => {
      if (!(value instanceof File)) return `${fieldName} is required`;
      return null;
    },

  group: async (value: FormValue): Promise<ValidationResult> => {
    if (typeof value !== "string") return null;

    const groupOptions = await getGroupOptions();
    const selectedOption = groupOptions.find(
      (option) => option.toLowerCase() === value.toLowerCase()
    );
    return !selectedOption ? `${value} is not an option` : null;
  },

  role: (value: FormValue): ValidationResult => {
    if (typeof value !== "string") return null;

    const selectedOption = ["admin", "teacher"].find(
      (option) => option.toLowerCase() === value.toLowerCase()
    );
    return !selectedOption ? `${value} is not an option` : null;
  },
};

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

export const fieldValidators = {
  fullname: createValidator(
    validations.required("Full name"),
    validations.minLength(2, "Full name"),
    validations.fullname
  ),

  username: createValidator(
    validations.required("Username"),
    validations.minLength(3, "Username"),
    validations.username
  ),

  email: createValidator(validations.required("Email"), validations.email),

  dateOfBirth: createValidator(
    validations.required("Date of birth"),
    validations.date,
    validations.age(8)
  ),

  joinedOn: createValidator(
    validations.required("Joined On"),
    validations.date
  ),

  group: createValidator(validations.required("Group"), validations.group),

  role: createValidator(validations.required("Role"), validations.role),

  profileImage: createValidator(
    validations.fileSize(5),
    validations.fileType(["image/png", "image/jpeg", "image/webp"])
  ),
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
