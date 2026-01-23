"use client";

import i18n from "@/lib/i18n";
import { useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";

interface I18nProviderProps {
    children: React.ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        // i18n is already initialized in the import
        setIsInitialized(true);
    }, []);

    if (!isInitialized) {
        return null; // Or a loading spinner
    }

    return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
