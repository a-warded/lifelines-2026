import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";

// Add more language imports here as needed
// import es from "./locales/es.json";
// import fr from "./locales/fr.json";

const resources = {
    en: { translation: en },
    // es: { translation: es },
    // fr: { translation: fr },
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: "en",
        supportedLngs: ["en"], // Add more as needed: ["en", "es", "fr"]
        
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
