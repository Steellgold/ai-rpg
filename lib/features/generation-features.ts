export enum GenerationFeatureType {
  // Base features
  BASIC_STORY = "basic_story",
  CHILD_MODE = "child_mode",

  // Visual features
  ITEM_SYSTEM = "item_system",

  // Visaul elements
  BANNER_IMAGE = "banner_image",
  SCENE_IMAGE = "scene_image",
  CHARACTER_AVATAR = "character_avatar",
  ITEM_IMAGE = "item_image", 

  // Advanced features
  LONG_STORY = "long_story",
  COMPLEX_CHARACTERS = "complex_characters",

  // Special features
  CUSTOM_THEME = "custom_theme",
  BRANCHING_PATHS = "branching_paths",
}

export interface FeatureDefinition {
  id: GenerationFeatureType;
  name: string;
  description: string;
  creditCost: number;
  isActiveByDefault: boolean;
  category: FeatureCategory;
  iconName?: string;
}

export enum FeatureCategory {
  BASIC = "basic",
  VISUAL = "visual",
  ADVANCED = "advanced",
  SPECIAL = "special"
}

export const GENERATION_FEATURES: Record<GenerationFeatureType, FeatureDefinition> = {
  [GenerationFeatureType.BASIC_STORY]: {
    id: GenerationFeatureType.BASIC_STORY,
    name: "Utils.Features.BasicStory.Name",
    description: "Utils.Features.BasicStory.Description",
    creditCost: 5,
    isActiveByDefault: true,
    category: FeatureCategory.BASIC,
    iconName: "BookOpen"
  },
  
  [GenerationFeatureType.CHILD_MODE]: {
    id: GenerationFeatureType.CHILD_MODE,
    name: "Utils.Features.ChildMode.Name",
    description: "Utils.Features.ChildMode.Description",
    creditCost: 0, // Free to encourage family use
    isActiveByDefault: false,
    category: FeatureCategory.BASIC,
    iconName: "Baby"
  },
  
  [GenerationFeatureType.ITEM_SYSTEM]: {
    id: GenerationFeatureType.ITEM_SYSTEM,
    name: "Utils.Features.ItemSystem.Name",
    description: "Utils.Features.ItemSystem.Description",
    creditCost: 3,
    isActiveByDefault: false,
    category: FeatureCategory.ADVANCED,
    iconName: "Backpack"
  },
  
  [GenerationFeatureType.BANNER_IMAGE]: {
    id: GenerationFeatureType.BANNER_IMAGE,
    name: "Utils.Features.BannerImage.Name",
    description: "Utils.Features.BannerImage.Description",
    creditCost: 2,
    isActiveByDefault: true,
    category: FeatureCategory.VISUAL,
    iconName: "Image"
  },
  
  [GenerationFeatureType.SCENE_IMAGE]: {
    id: GenerationFeatureType.SCENE_IMAGE,
    name: "Utils.Features.SceneImage.Name",
    description: "Utils.Features.SceneImage.Description",
    creditCost: 2, // Par scène
    isActiveByDefault: false,
    category: FeatureCategory.VISUAL,
    iconName: "Mountains"
  },
  
  [GenerationFeatureType.CHARACTER_AVATAR]: {
    id: GenerationFeatureType.CHARACTER_AVATAR,
    name: "Utils.Features.CharacterAvatar.Name",
    description: "Utils.Features.CharacterAvatar.Description",
    creditCost: 1, // Par personnage
    isActiveByDefault: false,
    category: FeatureCategory.VISUAL,
    iconName: "User"
  },
  
  [GenerationFeatureType.ITEM_IMAGE]: {
    id: GenerationFeatureType.ITEM_IMAGE,
    name: "Utils.Features.ItemImage.Name",
    description: "Utils.Features.ItemImage.Description",
    creditCost: 1, // Par objet
    isActiveByDefault: false,
    category: FeatureCategory.VISUAL,
    iconName: "Package"
  },
  
  [GenerationFeatureType.LONG_STORY]: {
    id: GenerationFeatureType.LONG_STORY,
    name: "Utils.Features.LongStory.Name",
    description: "Utils.Features.LongStory.Description",
    creditCost: 10,
    isActiveByDefault: false,
    category: FeatureCategory.ADVANCED,
    iconName: "BookMarked"
  },
  
  [GenerationFeatureType.COMPLEX_CHARACTERS]: {
    id: GenerationFeatureType.COMPLEX_CHARACTERS,
    name: "Utils.Features.ComplexCharacters.Name",
    description: "Utils.Features.ComplexCharacters.Description",
    creditCost: 5,
    isActiveByDefault: false,
    category: FeatureCategory.ADVANCED,
    iconName: "Users"
  },
  
  [GenerationFeatureType.CUSTOM_THEME]: {
    id: GenerationFeatureType.CUSTOM_THEME,
    name: "Utils.Features.CustomTheme.Name",
    description: "Utils.Features.CustomTheme.Description",
    creditCost: 3,
    isActiveByDefault: false,
    category: FeatureCategory.SPECIAL,
    iconName: "Palette"
  },
  
  [GenerationFeatureType.BRANCHING_PATHS]: {
    id: GenerationFeatureType.BRANCHING_PATHS,
    name: "Utils.Features.BranchingPaths.Name",
    description: "Utils.Features.BranchingPaths.Description",
    creditCost: 8,
    isActiveByDefault: false,
    category: FeatureCategory.SPECIAL,
    iconName: "GitBranch"
  }
};

export function calculateTotalCreditCost(activeFeatures: GenerationFeatureType[]): number {
  return activeFeatures.reduce((total, featureId) => {
    return total + GENERATION_FEATURES[featureId].creditCost;
  }, 0);
}

export function canUseFeature(
  featureId: GenerationFeatureType, 
  availableCredits: number
): boolean {
  const feature = GENERATION_FEATURES[featureId];
  return availableCredits >= feature.creditCost;
}

export function getAvailableFeatures(availableCredits: number): GenerationFeatureType[] {
  return Object.values(GENERATION_FEATURES)
    .filter(feature => feature.creditCost <= availableCredits)
    .map(feature => feature.id);
}

export function getDefaultActiveFeatures(availableCredits: number): GenerationFeatureType[] {
  return Object.values(GENERATION_FEATURES)
    .filter(feature => 
      feature.isActiveByDefault && 
      feature.creditCost <= availableCredits
    )
    .map(feature => feature.id);
}

export function getDefaultFeatures(
  isChildMode?: boolean, 
  hasItems?: boolean
): GenerationFeatureType[] {
  const features = [GenerationFeatureType.BASIC_STORY, GenerationFeatureType.BANNER_IMAGE];
  
  if (isChildMode) {
    features.push(GenerationFeatureType.CHILD_MODE);
  }
  
  if (hasItems) {
    features.push(GenerationFeatureType.ITEM_SYSTEM);
  }
  
  return features;
}

export function formatFeatureCost(featureId: GenerationFeatureType): string {
  const feature = GENERATION_FEATURES[featureId];
  
  return feature.creditCost === 0
    ? "Utils.Features.Cost.Free"
    : `Utils.Features.Cost.Credits|credits=${feature.creditCost}`;
}