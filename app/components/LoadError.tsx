"use client";
import { useLanguage } from "@/contexts/LanguageContext";
export default function LoadError({ retry }: { retry: () => void }) {
  const { t } = useLanguage();
  return (
    <div className="state-panel" role="alert">
      <p>{t("polish.loadError")}</p>
      <button type="button" className="btn dark-btn mt-4" onClick={retry}>
        {t("polish.retry")}
      </button>
    </div>
  );
}
