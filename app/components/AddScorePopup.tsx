import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getFieldValidators } from "@/lib/validations";
import { insertScore } from "@/services/scoresService";
import { getFriendlyErrorMessage } from "@/lib/utils";
import { ScoreData } from "@/types";
import { useLanguage } from "@/contexts/LanguageContext";

const AddScorePopup = ({
  groupName,
  setShowAddPopup,
  onAdded,
}: {
  groupName: string;
  setShowAddPopup: (value: boolean) => void;
  onAdded: (student: ScoreData) => void;
}) => {
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddStudent = useCallback(async () => {
    setIsSubmitting(true);
    const error = await getFieldValidators(t).scoreName(name);
    if (error) {
      toast.error(error, { duration: 5000 });
      setIsSubmitting(false);
      return;
    }
    try {
      const { error } = await insertScore(name.trim(), groupName);

      if (error) {
        toast.error(getFriendlyErrorMessage(error, t), { duration: 5000 });
      } else {
        toast.success(t("addScorePopup.successToast"), { duration: 5000 });
        onAdded({ name: name.trim().toLowerCase(), score: 0, group: groupName });
        setShowAddPopup(false);
      }
    } catch {
      toast.error(t("addScorePopup.unexpectedError"), { duration: 5000 });
    } finally {
      setIsSubmitting(false);
    }
  }, [name, groupName, setShowAddPopup, onAdded, t]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      handleAddStudent();
    },
    [handleAddStudent]
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (isSubmitting) return;
        event.preventDefault();
        setShowAddPopup(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [setShowAddPopup, isSubmitting]);

  return (
    <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl"
      >
        <h2 className="text-xl font-bold mb-4">{t("addScorePopup.title")}</h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder={t("addScorePopup.fullNamePlaceholder")}
            className="input w-full"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            required
            disabled={isSubmitting}
          />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            className="btn"
            onClick={() => setShowAddPopup(false)}
            disabled={isSubmitting}
          >
            {t("addScorePopup.cancel")}
          </button>
          <button type="submit" className="btn dark-btn" disabled={isSubmitting}>
            {t("addScorePopup.add")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddScorePopup;
