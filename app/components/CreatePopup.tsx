import supabase from "@/lib/supabaseClient";
import { getFriendlyErrorMessage } from "@/lib/utils";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getValidations } from "@/lib/validations";
import { useLanguage } from "@/contexts/LanguageContext";

const CreatePopup = ({
  setShowCreatePopup,
}: {
  setShowCreatePopup: (value: boolean) => void;
}) => {
  const { t } = useLanguage();
  const [groupName, setGroupName] = useState("");
  const [closed, setClosed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateGroup = useCallback(async () => {
    setIsSubmitting(true);
    const validations = getValidations(t);
    const groupNameLabel = t("createPopup.groupNamePlaceholder");
    const error = await validations.required(groupNameLabel)(groupName);
    const error2 = await validations.minLength(3, groupNameLabel)(groupName);
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
        toast.error(t("createPopup.idError"), {
          duration: 5000,
        });
      }

      const { error } = await supabase.from("groups").insert({
        id: nextId,
        group_name: groupName.toLowerCase(),
        closed: closed,
      });

      if (error) {
        toast.error(getFriendlyErrorMessage(error, t), {
          duration: 5000,
        });
      } else {
        toast.success(t("createPopup.successToast"), {
          duration: 5000,
        });
        setShowCreatePopup(false);
      }
    } catch {
      toast.error(t("createPopup.unexpectedError"), {
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [groupName, closed, setShowCreatePopup, t]);

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
        <h2 className="text-xl font-bold mb-4">{t("createPopup.title")}</h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder={t("createPopup.groupNamePlaceholder")}
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
            {t("createPopup.closedLabel")}
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
            {t("createPopup.openLabel")}
          </label>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            className="btn"
            onClick={() => setShowCreatePopup(false)}
            disabled={isSubmitting}
          >
            {t("createPopup.cancel")}
          </button>
          <button
            type="submit"
            className="btn dark-btn"
            disabled={isSubmitting}
          >
            {t("createPopup.create")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePopup;
