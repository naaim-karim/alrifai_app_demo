import Form from "next/form";
import Link from "next/link";
import { useFormFields } from "@/app/hooks/useFormFields";
import { getSignInFormConfig } from "@/app/signin/signInFormConfig";
import FormInput from "./FormInput";
import { useSignInMagicLink } from "../hooks/useSignInMagicLink";
import { Send } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";

const SignInForm = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useLanguage();
  const [message, setMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    const msg = searchParams.get("m");
    if (msg) {
      setMessage(msg);

      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete("m");

      router.replace(`?${newParams.toString()}`);
    }
  }, [searchParams, router]);

  const signInFormConfig = useMemo(() => getSignInFormConfig(t), [t]);
  const { error, isPending, submitAction } = useSignInMagicLink();
  useEffect(() => {
    if (error) {
      setServerError(error.message);
    }
  }, [error]);
  const {
    values,
    errors,
    refs,
    handleFieldChange,
    handleFieldBlur,
    validateAllFields,
    clearErrors,
  } = useFormFields(signInFormConfig, setServerError);

  const handleSubmit = async (formData: FormData) => {
    clearErrors();

    const isValid = validateAllFields();

    if (!isValid) return;

    await submitAction(formData);
  };

  return (
    <main className="main-container py-16 flex-grow-1">
      <h1 className="text-xl text-center mb-8 font-bold md:text-3xl">
        {t("signin.title")}
      </h1>
      {message === "sr" && (
        <p
          id="signin-error"
          className="text-red-500 text-md p-1 text-center"
          role="alert"
        >
          {t("signin.needSignIn")}
        </p>
      )}
      <Form
        action={handleSubmit}
        className="flex flex-col mx-auto max-w-md relative"
        formMethod="post"
        aria-label="Sign In Form"
        aria-describedby="form-description"
      >
        <p className="sr-only" id="form-description">
          {t("signin.formDescription")}
        </p>

        {signInFormConfig.map((field) => (
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
        ))}
        {serverError && (
          <p
            id="signup-error"
            className="text-red-500 text-sm p-1 text-center"
            role="alert"
          >
            {serverError || t("signin.errorFallback")}
          </p>
        )}
        <button
          type="submit"
          className="btn dark-btn py-3 mt-4 flex justify-center items-center"
          disabled={isPending}
          aria-busy={isPending}
        >
          {isPending ? t("signin.sending") : t("signin.sendLink")}
          <Send className="ms-2 size-5" />
        </button>
      </Form>
      <p className="text-gray-500 text-center mt-4">
        {t("signin.troubleSigningIn")}
        <Link href="/contact" className="text-primary font-semibold">
          {t("signin.getHelp")}
        </Link>
      </p>
    </main>
  );
};

export default SignInForm;
