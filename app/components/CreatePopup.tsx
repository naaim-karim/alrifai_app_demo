import Modal from "./Modal";
import supabase from "@/lib/supabaseClient";
import { getFriendlyErrorMessage } from "@/lib/utils";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { getValidations } from "@/lib/validations";
import { useLanguage } from "@/contexts/LanguageContext";

const CreatePopup = ({
  setShowCreatePopup,
  onCreated,
}: {
  setShowCreatePopup: (value: boolean) => void;
  onCreated: () => void;
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
      const { data: nextId, error: idError } =
        await supabase.rpc("get_next_groups_id");

      if (idError || nextId == null) {
        toast.error(t("createPopup.idError"), {
          duration: 5000,
        });
        return;
      }

      const { error } = await supabase.from("groups").insert({
        id: nextId,
        group_name: groupName.trim().toLowerCase(),
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
        onCreated();
        setShowCreatePopup(false);
      }
    } catch {
      toast.error(t("createPopup.unexpectedError"), {
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [groupName, closed, setShowCreatePopup, onCreated, t]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      handleCreateGroup();
    },
    [handleCreateGroup],
  );

  return (
    <Modal
      titleId="create-group-title"
      onClose={() => setShowCreatePopup(false)}
      busy={isSubmitting}
    >
      <form onSubmit={handleSubmit} className="bg-white p-6 w-full">
        <h2 id="create-group-title" className="text-xl font-bold mb-4">
          {t("createPopup.title")}
        </h2>
        <div className="space-y-4">
          <input
            type="text"
            aria-label={t("createPopup.groupNamePlaceholder")}
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
    </Modal>
  );
};

export default CreatePopup;
