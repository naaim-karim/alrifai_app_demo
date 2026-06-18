"use client";

import Image from "next/image";
import Link from "next/link";
import { CircleUser } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Loading from "./Loading";
import { Bars3BottomLeftIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { capitalize, getProfileRole } from "@/lib/utils";

const MobileNavbar = () => {
  const { user, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (loading) {
    return <Loading />;
  }

  return (
    <nav className="main-container grid grid-cols-3 items-center md:hidden">
      <button
        className="cursor-pointer mr-auto"
        onClick={() => setIsOpen(true)}
      >
        <Bars3BottomLeftIcon className="size-8" />
      </button>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 cursor-pointer z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="mobile-nav">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold">
                {user ? capitalize(user.user_metadata.fullname) : "Menu"}
              </h2>
              <button
                className="cursor-pointer"
                onClick={() => setIsOpen(false)}
              >
                <XMarkIcon className="size-8" />
              </button>
            </div>
            <ul className="flex flex-col gap-4">
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>
                <Link href="/contact">Contact</Link>
              </li>
              <li>
                <Link href="/scores">Scores</Link>
              </li>
              {user && (
                <li>
                  <Link
                    href={
                      user.user_metadata.role === "admin" ||
                      user.user_metadata.role === "teacher_assistant"
                        ? `/groups`
                        : `/group/${user.user_metadata.group}`
                    }
                  >
                    {user.user_metadata.role === "admin" ||
                    user.user_metadata.role === "teacher_assistant"
                      ? "Groups"
                      : "Group"}
                  </Link>
                </li>
              )}
              {user && user.user_metadata.role === "admin" && (
                <li>
                  <Link href={`/students`}>Students</Link>
                </li>
              )}
              {user && user.user_metadata.role === "teacher" && (
                <li>
                  <Link href={`/scores/manage/${user.user_metadata.group}`}>
                    Edit Scores
                  </Link>
                </li>
              )}
              {user && user.user_metadata.role === "admin" && (
                <>
                  <li className="btn dark-btn">
                    <Link href={`/new-user/admin`}>New Admin</Link>
                  </li>
                  <li className="btn dark-btn">
                    <Link href={`/new-user/student`}>New Student</Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </>
      )}
      <Link href="/" className="m-auto w-20">
        <Image
          src="/alrifai_logo.png"
          alt="Alrifai Logo"
          width={500}
          height={481}
        />
      </Link>
      {user ? (
        <Link
          href={`/u/${getProfileRole(user.user_metadata.role)}/${
            user.user_metadata.username
          }`}
          className="ml-auto"
        >
          {user.user_metadata.profileImageUrl ? (
            <Image
              src={user.user_metadata.profileImageUrl}
              alt="Profile Image"
              width={40}
              height={40}
              className="w-10 h-10 object-cover rounded-full"
            />
          ) : (
            <CircleUser className="size-6 btn dark-btn" />
          )}
        </Link>
      ) : (
        <Link href="/signin" className="btn dark-btn ml-auto">
          Sign in
        </Link>
      )}
    </nav>
  );
};

export default MobileNavbar;
