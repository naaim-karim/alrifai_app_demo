"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { CircleChevronDown, CircleUser } from "lucide-react";
import { useState } from "react";
import Loading from "./Loading";

const DesktopNavbar = () => {
  const { user, loading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRotated, setIsRotated] = useState(false);

  if (loading) {
    return <Loading />;
  }

  return (
    <nav className="main-container py-4 justify-between items-center relative hidden md:flex">
      <Link href="/" className="text-primary font-bold text-2xl">
        Alrifai
      </Link>
      <div className="flex items-center gap-6">
        <ul className="flex items-center gap-6 font-medium">
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/contact">Contact</Link>
          </li>
          {user && (
            <li>
              <Link
                href={
                  user.user_metadata.role === "admin"
                    ? `/groups`
                    : `/group/${user.user_metadata.group}`
                }
              >
                {user.user_metadata.role === "admin" ? "Groups" : "Group"}
              </Link>
            </li>
          )}
          {user && user.user_metadata.role === "admin" && (
            <li>
              <Link href={`/students`}>Students</Link>
            </li>
          )}
          {user && user.user_metadata.role === "admin" && (
            <li
              className="mega-menu"
              onClick={() => {
                setIsMenuOpen(!isMenuOpen);
                setIsRotated(!isRotated);
              }}
            >
              <button className="flex items-center gap-1 cursor-pointer">
                <CircleChevronDown
                  className={`text-black size-5 transition-all duration-300 ${
                    isRotated ? "arrow-rotated" : ""
                  }`}
                />
                Add New
              </button>
              <ul
                id="mega-menu"
                className={`absolute right-20 flex flex-col bg-white rounded-b-xl border border-gray-200 p-3 gap-3 transition-all duration-300 ease-in-out ${
                  isMenuOpen ? "mega-menu-opened" : "mega-menu-closed"
                }`}
              >
                <li>
                  <Link href={`/new-user/admin`} className="btn dark-btn block">
                    New Admin
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/new-user/student`}
                    className="btn dark-btn block"
                  >
                    New Student
                  </Link>
                </li>
              </ul>
            </li>
          )}
        </ul>
        {user ? (
          <Link
            href={`/u/${
              user.user_metadata.role ? user.user_metadata.role : "student"
            }/${user.user_metadata.username}`}
            className=""
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
          <Link href="/signin" className="btn dark-btn">
            Sign in
          </Link>
        )}
      </div>
    </nav>
  );
};

export default DesktopNavbar;
