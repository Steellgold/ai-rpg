export const DEFAULT_LANGUAGE = "en";

export const SUPPORTED_LANGUAGES = ["en", "fr", "es", "it", "de"] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

export const LANGUAGE_INSTRUCTIONS: Record<SupportedLanguage, string> = {
  en: "Write the story in English.",
  fr: "Écrivez l'histoire en français.",
  es: "Escriba la historia en español.",
  it: "Scrivere la storia in italiano.",
  de: "Schreiben Sie die Geschichte auf Deutsch."
};

export const MAX_TOKENS = {
  STORY: 4000,
  SCENE: 2000,
  CHARACTER: 1000,
  ITEM: 500,
  IMAGE: 300
};

export const IMAGE_STYLES = {
  SCENE: "vivid",
  CHARACTER: "natural",
  ITEM: "vintage"
};