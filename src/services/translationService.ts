import en from "@/utils/i18n/en.json";

export function translate(translationKey?: string): string | undefined {
  if (!translationKey) return undefined;

  const keys = translationKey.split(".");
  let current: any = en;

  for (const key of keys) {
    if (current === undefined || current === null) return undefined;
    current = current[key];
  }

  if (typeof current === "string") return current;

  return undefined;
}
