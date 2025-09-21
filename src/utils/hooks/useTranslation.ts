import { useCallback, useEffect, useState } from "react";
import en from "@/utils/i18n/en.json";
import pt from "@/utils/i18n/pt.json";
import {
  enUS as fnsEn,
  Locale as FnsLocale,
  pt as fnsPt,
} from "date-fns/locale";

type Locale = "en-us" | "pt-pt";
const DEFAULT_LOCALE: Locale = "en-us";

const translations: Record<Locale, any> = { "en-us": en, "pt-pt": pt };

export function useTranslate() {
  const [locale, setLocaleState] = useState<Locale>();

  // Initialize locale from localStorage
  useEffect(() => {
    const stored = (localStorage.getItem("locale") as Locale) || DEFAULT_LOCALE;
    if (!["en-us", "pt-pt"].includes(stored)) {
      localStorage.setItem("locale", DEFAULT_LOCALE);
    }
    setLocaleState(stored);
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    localStorage.setItem("locale", newLocale);
    setLocaleState(newLocale);
    window.location.reload(); // refresh app to apply new translations
  }, []);

  const getFnsLocale = useCallback((): FnsLocale | undefined => {
    if (!locale) return undefined;
    return locale === "pt-pt" ? fnsPt : fnsEn;
  }, [locale]);

  const translate = useCallback(
    (translationKey: string): string => {
      if (!locale) return "";

      const keys = translationKey.split(".");

      const getFromDict = (dict: any) => {
        let current = dict;
        for (const key of keys) {
          if (current == null) return undefined;
          current = current[key];
        }
        return typeof current === "string" ? current : undefined;
      };

      return (
        getFromDict(translations[locale]) ??
        getFromDict(translations[DEFAULT_LOCALE]) ??
        translationKey
      );
    },
    [locale]
  );

  return {
    t: translate,
    locale,
    setLocale,
    getFnsLocale,
  };
}
