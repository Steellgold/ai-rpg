export const SUPPORTED_LANGUAGES = ["en", "fr", "es", "it", "de"] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

export type StoryLanguage = SupportedLanguage | "auto";

export function isSupportedLanguage(lang: string): lang is SupportedLanguage {
  return SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage);
}

export function getDefaultLanguage(): SupportedLanguage {
  return "en";
}

export const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  en: "English",
  fr: "Français",
  es: "Español",
  it: "Italiano",
  de: "Deutsch"
};

export const LANGUAGE_INSTRUCTIONS: Record<SupportedLanguage, string> = {
  en: "Write the story in English.",
  fr: "Écrivez l'histoire en français.",
  es: "Escriba la historia en español.",
  it: "Scrivere la storia in italiano.",
  de: "Schreiben Sie die Geschichte auf Deutsch."
};