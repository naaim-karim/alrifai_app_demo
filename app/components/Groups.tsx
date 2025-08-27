"use client";

import { useAuth } from "@/contexts/AuthContext";
import { capitalize } from "@/lib/utils";
import { GroupData } from "@/types";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Loading from "./Loading";
import { notFound, redirect } from "next/navigation";
import { fetchGroups } from "@/services/groupService";
import Image from "next/image";
import CreatePopup from "./CreatePopup";
import supabase from "@/lib/supabaseClient";

const Groups = () => {
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    const loadGroups = async () => {
      try {
        const data = await fetchGroups();
        setGroups(
          data.filter((group) => group.group_name?.toLowerCase() !== "admin")
        );
      } catch {
      } finally {
        setLoading(false);
      }
    };
    loadGroups();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("groups-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "groups",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setGroups((prev) => [payload.new, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setGroups((prev) =>
              prev.map((group) =>
                group.id === payload.new.id ? payload.new : group
              )
            );
          } else if (payload.eventType === "DELETE") {
            setGroups((prev) =>
              prev.filter((group) => group.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredGroups = useMemo(() => {
    if (!searchTerm.trim()) return groups;

    return groups.filter((group) => {
      const name = group.group_name?.toLowerCase() || "";
      const search = searchTerm.toLowerCase() || "";

      return name.includes(search);
    });
  }, [searchTerm, groups]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  if (authLoading) {
    return <Loading />;
  }

  if (!user) redirect("/signin?m=sr");
  if (user.user_metadata.role !== "admin") notFound();

  if (loading) {
    return (
      <main className="main-container flex-grow-1 py-8">
        <h1 className="text-3xl font-bold mb-6">Groups</h1>
        <p className="text-center text-gray-500">Loading groups...</p>
      </main>
    );
  }

  return (
    <main className="main-container flex-grow-1 py-8">
      <h1 className="text-3xl font-bold mb-6">Groups</h1>
      <div className="relative mb-4">
        <Search className="absolute top-1/2 left-3 transform -translate-y-1/2 text-secondary size-5" />
        <input
          type="search"
          className="input pl-10 placeholder:text-secondary bg-[#ededed]"
          name="search"
          id="search"
          placeholder="Search for groups"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>
      {searchTerm && (
        <p className="text-sm text-gray-600 mb-4">
          {filteredGroups.length} group
          {filteredGroups.length !== 1 ? "s" : ""} found
          {searchTerm && ` for "${searchTerm}"`}
        </p>
      )}
      {filteredGroups.length === 0 && !loading && (
        <p className="text-center text-gray-500">
          {searchTerm
            ? "No groups found matching your search"
            : "No groups found"}
        </p>
      )}
      {filteredGroups.length > 0 && (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => (
            <div
              key={group.id}
              className="border border-gray-200 rounded-lg p-4 bg-white shadow-2xl hover:scale-105 transition-transform duration-200"
            >
              <Image
                src="/group.png"
                alt="Group Image"
                width={1536}
                height={1024}
                className="max-w-full h-auto mb-4"
              />
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-right">
                  {capitalize(group.group_name || "")}
                </h2>
                <span>{group.closed ? "Closed" : "Open"}</span>
              </div>
            </div>
          ))}
        </section>
      )}
      <button
        className="btn dark-btn mt-8 block mx-auto lg:ml-auto lg:mx-0"
        onClick={() => setShowCreatePopup(true)}
      >
        Create New Group
      </button>
      {showCreatePopup && (
        <CreatePopup setShowCreatePopup={setShowCreatePopup} />
      )}
    </main>
  );
};

export default Groups;
