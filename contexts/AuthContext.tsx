"use client";

import { createContext, useContext, useEffect, useState } from "react";
import supabase from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";
import { getFriendlyErrorMessage } from "@/lib/utils";
import type { AuthContextType, SignInUserData, SignUpUserData } from "@/types";
import { uploadProfileImage } from "@/services/storageService";

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({
  children,
}: Readonly<{ children: React.ReactNode }>) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const doesEmailExist = async (email: string) => {
    const emailLower = email.toLowerCase();

    // Check student_profiles
    const { data: students, error: studentError } = await supabase
      .from("student_profiles")
      .select("id")
      .eq("email", emailLower);

    if (studentError) {
      return { success: false, error: studentError.message };
    }

    // Check teacher_profiles
    const { data: teachers, error: teacherError } = await supabase
      .from("teacher_profiles")
      .select("id")
      .eq("email", emailLower);

    if (teacherError) {
      return { success: false, error: teacherError.message };
    }

    if (
      (students && students.length > 0) ||
      (teachers && teachers.length > 0)
    ) {
      return {
        success: false,
        error: "An account with this email already exists.",
      };
    }

    return { success: true };
  };

  const signInWithMagicLink = async (userData: SignInUserData) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: userData.email,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/`,
          shouldCreateUser: false,
        },
      });

      if (error) {
        return { success: false, error: getFriendlyErrorMessage(error) };
      }
      return { success: true };
    } catch {
      return {
        success: false,
        error: "An unexpected error occurred. Please try again later.",
      };
    }
  };

  const signUpWithMagicLink = async (userData: SignUpUserData) => {
    try {
      const { success: doesntExist, error: emailError } = await doesEmailExist(
        userData.email.toLowerCase()
      );

      if (!doesntExist) {
        return { success: false, error: emailError };
      }

      let profileImageUrl = null;

      if (userData.profileImage && userData.profileImage.size > 0) {
        profileImageUrl = await uploadProfileImage(userData.profileImage);
        if (!profileImageUrl) {
          return { success: false, error: "Failed to upload profile image" };
        }
      }

      const { error } = await supabase.auth.signInWithOtp({
        email: userData.email.toLowerCase(),
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/`,
          shouldCreateUser: true,
          data: {
            fullname: userData.fullname.toLowerCase(),
            username: userData.username.toLowerCase(),
            dateOfBirth: userData.dateOfBirth,
            joinedOn: userData.joinedOn,
            group: userData.group.toLowerCase(),
            profileImageUrl: profileImageUrl,
            role: userData.role?.toLowerCase(),
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch {
      return {
        success: false,
        error: "An unexpected error occurred. Please try again later.",
      };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return { success: false, error: getFriendlyErrorMessage(error) };
      }
      return { success: true };
    } catch {
      return {
        success: false,
        error: "An unexpected error occurred. Please try again later.",
      };
    }
  };

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (error) {
          throw error;
        }
        setUser(session?.user ?? null);
        setLoading(false);
      } catch {}
    };
    getInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const value = {
    user,
    loading,
    signInWithMagicLink,
    signUpWithMagicLink,
    signOut,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
