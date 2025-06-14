import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import { ISOLang, SupportedLangs, supportedLanguages } from "@workspace/ui/types/lang";

const FILES = ["navigation", "home", "errors"] as const;

const detectLanguage = (
  acceptLanguage: string | null,
  supportedLanguages: SupportedLangs = { en: "en" },
  defaultLang: ISOLang = "en"
): ISOLang => {
  if (!acceptLanguage) return defaultLang;

  const browserLang = ((acceptLanguage ?? "").split(",")[0] ?? "").toLowerCase();

  const exactMatch = Object.entries(supportedLanguages).find(
    ([key]) => browserLang === key || browserLang.startsWith(`${key}-`)
  );
  if (exactMatch) return exactMatch[1];

  const partialMatch = Object.entries(supportedLanguages).find(
    ([key]) => browserLang.startsWith(key)
  );
  if (partialMatch) return partialMatch[1];

  return defaultLang;
};

export default getRequestConfig(async () => {
  const store = await cookies();

  const storedLanguage = store.get("language")?.value;
  const fallbackLocale = store.get("locale")?.value;
  const browserLocale = detectLanguage(store.get("accept-language")?.value ?? null, supportedLanguages);

  const locale = (storedLanguage || fallbackLocale || browserLocale) as ISOLang;

  const messages = await Promise.all(
    FILES.map(async (file) => {
      try {
        return await import(`./messages/${locale}/${file}.json`);
      } catch (error) {
        console.error(`Error loading messages for locale "${locale}" and file "${file}":`, error);
        // If the file does not exist, we can return an empty object or handle it as needed
        return null;
      }
    })
  ).then((results) =>
    results.filter(Boolean).reduce((acc, curr) => ({ ...acc, ...curr }), {})
  );

  return {
    locale,
    messages
  };
});
