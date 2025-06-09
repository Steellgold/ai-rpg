import { MAX_TOKENS } from './constants';

export const TOKEN_PRICES = {
  // Texts
  GPT4_INPUT: 0.03,
  GPT4_OUTPUT: 0.06,
  GPT4_MINI_INPUT: 0.015,
  GPT4_MINI_OUTPUT: 0.03,
  
  // Images
  DALLE3_1024: 2,
  DALLE3_1792: 3,
};

export function estimateStoryCost(
  options: {
    textLength: number;
    hasItems: boolean;
    withImages: boolean;
    characters: {
      principal: number;
      secondary: number;
      // 
      brainstorming: boolean;
    }
  }
): number {
  const {
    textLength,
    hasItems,
    withImages,
    characters = {
      principal: 1,
      secondary: 1,
      brainstorming: false
    }
  } = options;
  
  const inputTokens = Math.ceil(textLength / 4);
  
  const outputTokens = hasItems ? MAX_TOKENS.STORY : Math.ceil(MAX_TOKENS.STORY * 0.8);

  let cost = (inputTokens / 1000) * TOKEN_PRICES.GPT4_INPUT + 
             (outputTokens / 1000) * TOKEN_PRICES.GPT4_OUTPUT;

  if (withImages) {
    cost += TOKEN_PRICES.DALLE3_1792;
    if (characters.principal > 0) cost += characters.principal * TOKEN_PRICES.DALLE3_1024;
    if (characters.secondary > 0) cost += characters.secondary * TOKEN_PRICES.DALLE3_1024;
    if (hasItems) cost += TOKEN_PRICES.DALLE3_1024;
  }

  if (characters.brainstorming) {
    cost += (inputTokens / 1000) * TOKEN_PRICES.GPT4_MINI_INPUT +
            (outputTokens / 1000) * TOKEN_PRICES.GPT4_MINI_OUTPUT;
  }
  
  return Math.ceil(cost);
}

export function estimateSceneCost(
  options: {
    withImage: boolean;
    withDialogues: boolean;
    newItemCount?: number;
  }
): number {
  const { withImage, withDialogues, newItemCount = 0 } = options;

  let cost = 0;

  cost = (MAX_TOKENS.SCENE / 1000) * TOKEN_PRICES.GPT4_OUTPUT;
  if (withImage) cost += TOKEN_PRICES.DALLE3_1792;
  if (newItemCount > 0) cost += newItemCount * TOKEN_PRICES.DALLE3_1024;
  if (withDialogues) cost += 0.5; 
  
  return Math.ceil(cost);
}