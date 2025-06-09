import { StoryPromptOptions } from './types';
import { getLanguageInstructions } from './language';
import { MAX_TOKENS } from './constants';

export function getStoryGenerationPrompt(options: StoryPromptOptions): string {
  const {
    textContent = '',
    genres = [],
    isChildSafe = false,
    hasItems = false,
    language = 'en',
    maxTokens = MAX_TOKENS.STORY
  } = options;

  const languageInstructions = getLanguageInstructions(language);
  const genresText = genres.length > 0 ? `Adapt it to the following genre(s): ${genres.join(", ")}` : "";
  const childSafeText = isChildSafe 
    ? "Make it suitable for children, avoiding any inappropriate content, violence, or adult themes." 
    : "";
  const itemsText = hasItems 
    ? `
Create 3-5 significant items/objects that will play important roles throughout the story. Each item should:
  - Have a clear purpose or function within the narrative
  - Be relevant to the plot, setting, or character development
  - Be interesting enough to be used multiple times across different scenes
  - Vary in rarity and usefulness
Do not create items that will only be used in a single scene.
` 
    : "";

  return `
Improve this text for a narrative game. Make it more captivating, descriptive and immersive, while preserving the main ideas. ${genresText}
        
${childSafeText}
${languageInstructions}

${itemsText}

Text: ${textContent}
`;
}