"use client";

import { languages, LanguageCode } from "@/lib/i18n";
import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";

export function LanguageSwitcher() {
    const { i18n, t } = useTranslation();
    const currentLang = i18n.language as LanguageCode;

    const toggleLanguage = () => {
        const newLang = currentLang === "en" ? "ar" : "en";
        i18n.changeLanguage(newLang);
    };

    const targetLang = currentLang === "en" ? "ar" : "en";
    const targetLangName = languages[targetLang]?.nativeName || targetLang;

    return (
        <button
            onClick={toggleLanguage}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            title={t("language.title")}
        >
            <Globe className="h-5 w-5" />
            <span>{targetLangName}</span>
        </button>
    );
}
