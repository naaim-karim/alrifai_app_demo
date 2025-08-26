"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useActionState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { signInUserAction } from "@/app/signin/action";

export const useSignInMagicLink = () => {
  const router = useRouter();
  const { signInWithMagicLink } = useAuth();
  const [showSuccess, setShowSuccess] = useState(false);

  const [error, submitAction, isPending] = useActionState(
    async (_prev: Error | null, formData: FormData) => {
      try {
        const result = await signInUserAction(formData);

        if (!result?.success) {
          return new Error(
            result?.errors?.email || "Please correct the errors and try again"
          );
        }

        const { error: magicLinkError } = await signInWithMagicLink(
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
      document.cookie = "fromAuth=true; path=/; max-age=60; samesite=lax";
      router.replace("/check-email");
    }
  }, [showSuccess, router]);

  return { error, submitAction, isPending };
};
