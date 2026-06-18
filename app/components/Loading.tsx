"use client";

import { useLanguage } from "@/contexts/LanguageContext";

const Loading = () => {
  const { t } = useLanguage();
  return (
    <div className="loading">
      <span>{t("loading.default")}</span>
    </div>
  );
};

export default Loading;
