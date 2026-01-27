import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import ar from "./locales/ar.json";
import en from "./locales/en.json";

// language configuration with rtl support. n-not like i spent time on accessibility or anything
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
            escapeValue: false, // react already handles xss so we dont need to double escape. efficiency
        },

        detection: {
            // order of language detection. bruh it checks like everything
            order: ["querystring", "localStorage", "navigator", "htmlTag"],
            lookupQuerystring: "lang",
            lookupLocalStorage: "i18nextLng",
            caches: ["localStorage"],
        },

        // react-specific options. ts hits different with proper config
        react: {
            useSuspense: false, // disable suspense for ssr compatibility. lowkey annoying but necessary
        },
    });

export default i18n;
