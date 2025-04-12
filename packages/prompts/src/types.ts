export interface PromptOptions {
  language?: string;
  isChildSafe?: boolean;
  maxTokens?: number;
}

export interface StoryPromptOptions extends PromptOptions {
  genres?: string[];
  hasItems?: boolean;
  textContent?: string;
}

export interface ScenePromptOptions extends PromptOptions {
  storyData: any;
  currentScene: any;
  selectedChoice: any;
  historyContext: string;
  diceRoll: number;
  playerInventory: any[];
  approachingEnd: boolean;
  useItemSystem: boolean;
  activeItem?: any;
}

export interface CharacterPromptOptions extends PromptOptions {
  characterType: 'main' | 'secondary';
}

export interface ItemPromptOptions extends PromptOptions {
  itemType: string;
  itemName: string;
  description?: string;
}

export interface ImagePromptOptions extends PromptOptions {
  description: string;
  style?: 'realistic' | 'cartoon' | 'vintage';
  size?: '1024x1024' | '1792x1024';
  quality?: 'standard' | 'hd';
}