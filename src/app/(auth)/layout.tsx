"use client";

import { languages, LanguageCode } from "@/lib/i18n";
import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";

function AuthLanguageSwitcher() {
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
            className="fixed top-4 end-4 z-50 flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/80"
            title={t("language.title")}
        >
            <Globe className="h-4 w-4" />
            <span>{targetLangName}</span>
        </button>
    );
}

export default function AuthLayout({
    children,
}: {
  children: React.ReactNode;
}) {
    return (
        <>
            <AuthLanguageSwitcher />
            {children}
        </>
    );
}
