import { User } from "@supabase/supabase-js";

// Profile Page Types
export interface UserProfileProps {
  params: Promise<{
    username: string;
  }>;
}

// Auth Context Types
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithMagicLink: (
    userData: SignInUserData
  ) => Promise<{ success: boolean; error?: string }>;
  signUpWithMagicLink: (
    userData: SignUpUserData
  ) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<{ success: boolean; error?: string }>;
}

// Form Types
export type FormValue = string | File | null | undefined;
export type FormValues = Record<string, FormValue>;

export type ValidationResult = string | null;
export type ValidationFunction<T = FormValue> =
  | ((value: T) => ValidationResult)
  | ((value: T) => Promise<ValidationResult>);

export interface FormField<T = FormValue> {
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  id: string;
  options?: string[];
  autoFocus?: boolean;
  defaultValue?: string;
  validation?: ValidationFunction<T>;
}

export interface FormInputProps {
  field: FormField;
  value: string;
  error?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  onBlur: () => void;
  elementRef: React.RefObject<HTMLSelectElement | HTMLInputElement | null>;
}

export interface AuthFormProps {
  error: Error | null;
  submitAction: (formData: FormData) => void;
  isPending: boolean;
}

export interface SignUpUserData {
  email: string;
  fullname: string;
  username: string;
  joinedOn: string;
  group: string;
  dateOfBirth?: string;
  role?: string;
  profileImage?: File;
  [key: string]: FormValue;
}

export interface StudentData {
  fullname?: string;
  group?: string;
  date_of_birth?: string;
  error?: string;
}

export interface GroupData {
  group_name?: string;
  id?: string;
  error?: string;
}

export interface LessonContentsData {
  lesson_name?: string;
  lesson_book?: string;
  error?: string;
}

export interface SignInUserData {
  email: string;
  [key: string]: FormValue;
}

export type SignInResult =
  | {
      success: true;
      data: SignInUserData;
    }
  | {
      success: false;
      errors: Partial<Record<keyof SignInUserData, string>>;
    };

export type SignUpResult =
  | {
      success: true;
      data: SignUpUserData;
    }
  | {
      success: false;
      errors: Partial<Record<keyof SignUpUserData, string>>;
    };

export interface ImageUploadInputProps {
  name: string;
  label: string;
  id: string;
  value?: File | null;
  error?: string;
  disabled?: boolean;
  onChange: (file: File | null) => void;
  onBlur?: () => void;
  elementRef: React.RefObject<HTMLSelectElement | HTMLInputElement | null>;
}
