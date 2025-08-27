import supabase from "@/lib/supabaseClient";
import { getFriendlyErrorMessage } from "@/lib/utils";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { validations } from "@/lib/validations";

const CreatePopup = ({
  setShowCreatePopup,
}: {
  setShowCreatePopup: (value: boolean) => void;
}) => {
  const [groupName, setGroupName] = useState("");
  const [closed, setClosed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateGroup = useCallback(async () => {
    setIsSubmitting(true);
    console.log(groupName);
    const error = await validations.required("Group Name")(groupName);
    const error2 = await validations.minLength(3, "Group Name")(groupName);
    if (error || error2) {
      toast.error(error || error2, { duration: 5000 });
      setIsSubmitting(false);
      return;
    }
    try {
      const { data: nextId, error: idError } = await supabase.rpc(
        "get_next_groups_id"
      );

      if (idError) {
        toast.error("Failed to generate group ID. Please try again.", {
          duration: 5000,
        });
      }

      const { error } = await supabase.from("groups").insert({
        id: nextId,
        group_name: groupName.toLowerCase(),
        closed: closed,
      });

      if (error) {
        toast.error(getFriendlyErrorMessage(error), {
          duration: 5000,
        });
      } else {
        toast.success("Group created successfully!", {
          duration: 5000,
        });
        setShowCreatePopup(false);
      }
    } catch {
      toast.error("Unexpected error. Please try again.", {
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [groupName, closed, setShowCreatePopup]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      console.log("I'm running");
      e.preventDefault();
      handleCreateGroup();
    },
    [handleCreateGroup]
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (isSubmitting) return;
        event.preventDefault();
        setShowCreatePopup(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [setShowCreatePopup, isSubmitting]);

  return (
    <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl"
      >
        <h2 className="text-xl font-bold mb-4">Create New Group</h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Group Name"
            className="input w-full"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            autoFocus
            required
            disabled={isSubmitting}
          />
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="status"
              value="closed"
              className="input w-4"
              checked={closed}
              onChange={() => setClosed(true)}
              required
              disabled={isSubmitting}
            />
            Group is Closed
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="status"
              value="open"
              className="input w-4"
              checked={!closed}
              onChange={() => setClosed(false)}
              required
              disabled={isSubmitting}
            />
            Group is Open
          </label>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            className="btn"
            onClick={() => setShowCreatePopup(false)}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn dark-btn"
            disabled={isSubmitting}
          >
            Create
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePopup;
