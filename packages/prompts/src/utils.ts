import { SUPPORTED_LANGUAGES } from './constants';

export function isSupportedLanguage(lang: string): boolean {
  return SUPPORTED_LANGUAGES.includes(lang as any);
}

export function preparePromptText(text: string, maxLength: number = 2000): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

export function prepareSceneWithDialogues(content: string, dialogues: any[]): string {
  if (!dialogues || dialogues.length === 0) {
    return content;
  }

  let processedContent = content;
  const dialogueMarker = "__DIALOGUE__";
  
  let i = 0;
  while (processedContent.includes(dialogueMarker)) {
    if (i < dialogues.length) {
      processedContent = processedContent.replace(dialogueMarker, `__DIALOGUE:${i}__`);
      i++;
    } else {
      processedContent = processedContent.replace(dialogueMarker, "");
    }
  }

  return processedContent;
}