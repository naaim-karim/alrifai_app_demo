import Modal from "./Modal";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { getFieldValidators, getValidations } from "@/lib/validations";
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
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddStudent = useCallback(async () => {
    setIsSubmitting(true);
    const validations = getValidations(t);

    const firstNameError =
      (await validations.required(t("formFields.firstName"))(firstName)) ||
      (await validations.fullname(firstName));
    const lastNameError =
      (await validations.required(t("formFields.lastName"))(lastName)) ||
      (await validations.fullname(lastName));
    if (firstNameError || lastNameError) {
      toast.error(firstNameError || lastNameError, { duration: 5000 });
      setIsSubmitting(false);
      return;
    }

    const combinedName = `${firstName.trim().replace(/\s+/g, " ")} ${lastName.trim().replace(/\s+/g, " ")}`;

    const error = await getFieldValidators(t).scoreName(combinedName);
    if (error) {
      toast.error(error, { duration: 5000 });
      setIsSubmitting(false);
      return;
    }
    try {
      const { error } = await insertScore(combinedName, groupName);

      if (error) {
        toast.error(getFriendlyErrorMessage(error, t), { duration: 5000 });
      } else {
        toast.success(t("addScorePopup.successToast"), { duration: 5000 });
        onAdded({
          name: combinedName.toLowerCase(),
          score: 0,
          group: groupName,
        });
        setShowAddPopup(false);
      }
    } catch {
      toast.error(t("addScorePopup.unexpectedError"), { duration: 5000 });
    } finally {
      setIsSubmitting(false);
    }
  }, [firstName, lastName, groupName, setShowAddPopup, onAdded, t]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      handleAddStudent();
    },
    [handleAddStudent],
  );

  return (
    <Modal
      titleId="add-student-title"
      onClose={() => setShowAddPopup(false)}
      busy={isSubmitting}
    >
      <form onSubmit={handleSubmit} className="bg-white p-6 w-full">
        <h2 id="add-student-title" className="text-xl font-bold mb-4">
          {t("addScorePopup.title")}
        </h2>
        <div className="space-y-4">
          <input
            type="text"
            aria-label={t("formFields.firstName")}
            placeholder={t("formFields.firstName")}
            className="input w-full"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            autoFocus
            required
            disabled={isSubmitting}
          />
          <input
            type="text"
            aria-label={t("formFields.lastName")}
            placeholder={t("formFields.lastName")}
            className="input w-full"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
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
          <button
            type="submit"
            className="btn dark-btn"
            disabled={isSubmitting}
          >
            {t("addScorePopup.add")}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddScorePopup;
