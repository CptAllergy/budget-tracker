import en from "@/utils/i18n/en.json";

// TODO review if there is a better way to handle translations, but maybe this is fine for my use case
export function translate(translationKey: string): string | undefined {
  const keys = translationKey.split(".");
  let current: any = en;

  for (const key of keys) {
    if (current === undefined || current === null) return undefined;
    current = current[key];
  }

  if (typeof current === "string") return current;

  return undefined;
}
