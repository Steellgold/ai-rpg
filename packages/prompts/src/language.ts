import { LANGUAGE_INSTRUCTIONS, SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, SupportedLanguage } from './constants';

export function getLanguageDetectionPrompt(text: string): string {
  return `
Analyze the following text and determine which language it is written in.
Text: "${text.substring(0, 500)}"

Respond with ONLY one of these language codes:
${SUPPORTED_LANGUAGES.map(lang => `- ${lang}`).join("\n")}

If the language is not one of these, or if you are unsure, respond with "${DEFAULT_LANGUAGE}".
`;
}

export function getLanguageInstructions(languageCode: string): string {
  if (SUPPORTED_LANGUAGES.includes(languageCode as any)) {
    return LANGUAGE_INSTRUCTIONS[languageCode as SupportedLanguage];
  }
  return LANGUAGE_INSTRUCTIONS[DEFAULT_LANGUAGE];
}