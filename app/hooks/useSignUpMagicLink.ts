"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useActionState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { signUpNewStudentAction } from "@/app/new-user/student/action";
import { signUpNewAdminAction } from "@/app/new-user/admin/action";
import toast from "react-hot-toast";

export const useSignUpMagicLink = (resetForm: () => void) => {
  const { signUpWithMagicLink } = useAuth();
  const [showSuccess, setShowSuccess] = useState(false);
  const pathname = usePathname();
  const isAdmin = pathname.includes("admin");

  const [error, submitAction, isPending] = useActionState(
    async (_prev: Error | null, formData: FormData) => {
      try {
        const result = isAdmin
          ? await signUpNewAdminAction(formData)
          : await signUpNewStudentAction(formData);

        if (!result?.success) {
          return new Error(
            result?.errors?.fullname ||
              result?.errors?.username ||
              result?.errors?.dateOfBirth ||
              result?.errors?.email ||
              result?.errors?.joinedOn ||
              result?.errors?.group ||
              result?.errors?.profileImage ||
              "Please correct the errors and try again"
          );
        }

        const { error: magicLinkError } = await signUpWithMagicLink(
          result.data
        );

        if (magicLinkError) {
          return new Error(magicLinkError);
        }

        setShowSuccess(true);
        return null;
      } catch {
        return new Error("An unexpected error occurred. Please try again.");
      }
    },
    null
  );

  useEffect(() => {
    if (showSuccess) {
      toast.success("User created successfully!", {
        duration: 5000,
      });
      resetForm();
      setShowSuccess(false);
    }
  }, [showSuccess, resetForm]);

  return { error, submitAction, isPending };
};
