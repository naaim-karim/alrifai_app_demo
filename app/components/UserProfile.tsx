"use client";

import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { notFound, redirect } from "next/navigation";
import { capitalize } from "@/lib/utils";
import { LogOut } from "lucide-react";
import Loading from "./Loading";

const UserProfile = ({ username }: { username: string }) => {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (!user) redirect("/signin?m=sr");
  if (user.user_metadata.username !== username.toLowerCase()) notFound();

  return (
    <main className="main-container flex-grow-1">
      {/* Personal info */}
      <section className="py-8 flex flex-col gap-1 items-center">
        <Image
          src={user?.user_metadata.profileImageUrl}
          alt="Profile Image"
          width={112}
          height={112}
          className="w-28 h-28 object-cover rounded-full mb-2"
        />
        <span className="font-bold">
          {capitalize(`${user?.user_metadata.fullname}`)}
        </span>
        <span className="text-sm text-gray-500">
          @{user?.user_metadata.username}
        </span>
        <span className="text-sm text-gray-500">
          Joined {user?.user_metadata.joinedOn.replaceAll("-", "/")}
        </span>
        <span className="text-sm text-gray-500">
          Group {user?.user_metadata.group}
        </span>
      </section>
      {/* Enrolled Groups */}
      <section className="py-8">
        <h1 className="font-bold mb-4">Enrolled Groups</h1>
        <div className="flex gap-4">
          <span className="bg-gray-200 py-1.5 px-3 rounded-xl">
            {user.user_metadata.group}
          </span>
        </div>
      </section>
      {/* Sign Out */}
      <section className="py-8">
        <button
          onClick={signOut}
          className="btn bg-gray-200 text-primary w-full flex justify-center items-center"
        >
          {loading ? "Signing Out..." : "Sign Out"}
          <LogOut className="ml-2 size-5" />
        </button>
      </section>
    </main>
  );
};

export default UserProfile;
