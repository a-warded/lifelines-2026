import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import ar from "./locales/ar.json";
import en from "./locales/en.json";

// Language configuration with RTL support
export const languages = {
    en: { name: "English", nativeName: "English", dir: "ltr" as const },
    ar: { name: "Arabic", nativeName: "العربية", dir: "rtl" as const },
};

export type LanguageCode = keyof typeof languages;

const resources = {
    en: { translation: en },
    ar: { translation: ar },
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: "en",
        supportedLngs: ["en", "ar"],
        
        interpolation: {
            escapeValue: false, // React already handles XSS
        },

        detection: {
            // Order of language detection
            order: ["querystring", "localStorage", "navigator", "htmlTag"],
            lookupQuerystring: "lang",
            lookupLocalStorage: "i18nextLng",
            caches: ["localStorage"],
        },

        // React-specific options
        react: {
            useSuspense: false, // Disable suspense for SSR compatibility
        },
    });

export default i18n;
