import Form from "next/form";
import { useFormFields } from "@/app/hooks/useFormFields";
import {
  getAdminSignUpFormConfig,
  getStudentSignUpFormConfig,
} from "@/app/new-user/signUpFormConfig";
import Link from "next/link";
import FormInput from "./FormInput";
import { useSignUpMagicLink } from "@/app/hooks/useSignUpMagicLink";
import { useEffect, useState } from "react";
import { FormField } from "@/types";
import ImageUploadInput from "./ImageUploadInput";
import { CookingPot, Send } from "lucide-react";
import { notFound, redirect, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Loading from "./Loading";

const SignUpForm = () => {
  const [signUpFormConfig, setSignUpFormConfig] = useState<FormField[]>([]);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);
  const pathname = usePathname();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    const loadFormConfig = async () => {
      try {
        const signUpFormConfig = pathname.includes("admin")
          ? await getAdminSignUpFormConfig()
          : await getStudentSignUpFormConfig();
        setSignUpFormConfig(signUpFormConfig);
      } catch {
        setSignUpFormConfig([]);
      } finally {
        setLoading(false);
      }
    };

    loadFormConfig();
  }, [pathname]);
  const {
    values,
    errors,
    refs,
    handleFieldChange,
    handleFieldBlur,
    validateAllFields,
    clearErrors,
    resetForm,
  } = useFormFields(signUpFormConfig, setServerError);
  const { error, submitAction, isPending } = useSignUpMagicLink(resetForm);
  useEffect(() => {
    if (error) {
      setServerError(error.message);
    }
  }, [error]);

  const handleSubmit = async (formData: FormData) => {
    clearErrors();

    const isValid = validateAllFields();

    if (!isValid) return;

    await submitAction(formData);
  };

  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated || loading || authLoading) {
    return <Loading />;
  }

  if (!user) redirect("/signin?m=sr");
  if (user.user_metadata.role !== "admin") notFound();

  return (
    <main className="main-container flex-grow-1 py-16">
      <h1 className="text-xl text-center mb-8 font-bold md:text-3xl">
        Sign Up New {pathname.includes("admin") ? "Admin/Teacher" : "Student"}
      </h1>
      <Form
        action={handleSubmit}
        className="flex flex-col mx-auto max-w-md relative"
        formMethod="post"
        aria-label="Sign Up Form"
        aria-describedby="form-description"
      >
        <p className="sr-only" id="form-description">
          {
            "Enter your details to create a new account and we'll send you a secure sign-in link."
          }
        </p>

        {signUpFormConfig.map((field) =>
          field.type === "file" ? (
            <ImageUploadInput
              key={field.name}
              name={field.name}
              label={field.label}
              id={field.id}
              value={values[field.name] as File | null}
              error={errors[field.name]}
              disabled={isPending}
              onChange={(file) => handleFieldChange(field, file)}
              onBlur={() => handleFieldBlur(field)}
              elementRef={refs[field.name]}
            />
          ) : (
            <FormInput
              key={field.name}
              field={field}
              value={(values[field.name] as string) || ""}
              error={errors[field.name]}
              disabled={isPending}
              onChange={(value) => handleFieldChange(field, value)}
              onBlur={() => handleFieldBlur(field)}
              elementRef={refs[field.name]}
            />
          )
        )}
        <button
          type="reset"
          className="btn bg-gray-200 text-primary flex justify-center items-center"
          disabled={isPending}
          onClick={() => {
            resetForm();
            setServerError(null);
          }}
        >
          Reset Form
          <CookingPot className="ml-2 size-5" />
        </button>

        {serverError && (
          <p
            id="signup-error"
            className="text-red-500 text-sm p-1 text-center"
            role="alert"
          >
            {serverError ||
              "An error occurred while signing up. Please try again."}
          </p>
        )}
        <button
          type="submit"
          className="btn dark-btn mt-2 flex justify-center items-center"
          disabled={isPending}
          aria-busy={isPending}
        >
          {isPending ? "Signing up..." : "Sign Up New User"}
          <Send className="ml-2 size-5" />
        </button>
      </Form>
      <p className="text-gray-500 text-center mt-4">
        {"Having trouble signing in? "}
        <Link href="/contact" className="text-primary font-semibold">
          Get Help
        </Link>
      </p>
    </main>
  );
};

export default SignUpForm;
