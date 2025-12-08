'use client';
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Import translation JSON files
import en from "@/locales/en.json";
import fr from "@/locales/fr.json";
import es from "@/locales/es.json";

const getUserLanguage = () => {
    if (typeof navigator === "undefined") {
        return "en";
    }
    const lang = navigator.language || (navigator as any).userLanguage || "en";
    // fallback to English if unsupported
    return lang.split("-")[0];
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      fr: { translation: fr },
      es: { translation: es },
    },
    lng: getUserLanguage(), // auto-detect
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
