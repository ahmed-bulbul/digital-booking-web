"use client";

import { useI18n } from "./I18nProvider";

export default function LanguageToggle() {
  const { locale, setLocale, t } = useI18n();

  return (
    <div className="flex items-center gap-1 rounded-full border border-outline-variant/40 p-1">
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={`px-3 py-1 rounded-full text-xs font-semibold ${
          locale === "en" ? "bg-primary text-white" : "text-on-surface-variant"
        }`}
      >
        {t("lang.english")}
      </button>
      <button
        type="button"
        onClick={() => setLocale("bn")}
        className={`px-3 py-1 rounded-full text-xs font-semibold ${
          locale === "bn" ? "bg-primary text-white" : "text-on-surface-variant"
        }`}
      >
        {t("lang.bangla")}
      </button>
    </div>
  );
}
