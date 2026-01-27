"use client";

import i18n, { LanguageCode, languages } from "@/lib/i18n";
import { useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";

interface I18nProviderProps {
    children: React.ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        // set initial direction based on current language. gotta respect the rtl gang
        const currentLang = i18n.language as LanguageCode;
        const dir = languages[currentLang]?.dir || "ltr";
        document.documentElement.setAttribute("dir", dir);
        document.documentElement.setAttribute("lang", currentLang || "en");

        // listen for language changes. lowkey important for switching vibes
        const handleLanguageChange = (lng: string) => {
            const langCode = lng as LanguageCode;
            const direction = languages[langCode]?.dir || "ltr";
            document.documentElement.setAttribute("dir", direction);
            document.documentElement.setAttribute("lang", langCode);
        };

        i18n.on("languageChanged", handleLanguageChange);
        setIsInitialized(true);

        return () => {
            i18n.off("languageChanged", handleLanguageChange);
        };
    }, []);

    if (!isInitialized) {
        return null; // or a loading spinner idk
    }

    return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
