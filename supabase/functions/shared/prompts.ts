/**
 * @description Prompts for AI language model to generate text, images, and other content.
 * @param text - The text to analyze for language detection.
 * @returns 
 */
export const getLanguageDetectionPrompt = (text: string): string => {
  return `
Analyze the following text and determine which language it is written in.
Text: "${text.substring(0, 500)}"

Respond with ONLY one of these language codes:
- en: English
- fr: French
- es: Spanish
- it: Italian
- de: German

If the language is not one of these, or if you are unsure, respond with "en" (English).
`;
};

/**
 * @description Provides instructions for writing a story in a specific language.
 * @param languageCode - The language code to get instructions for.
 * @returns 
 */
export const getLanguageInstructions = (languageCode: string): string => {
  const languageInstructions: Record<string, string> = {
    "en": "Write the story in English.",
    "fr": "Écrivez l'histoire en français.",
    "es": "Escriba la historia en español.",
    "it": "Scrivere la storia in italiano.",
    "de": "Schreiben Sie die Geschichte auf Deutsch.",
  };
  
  return languageInstructions[languageCode] || "Write the story in English.";
};

/**
 * @description Generates a prompt for creating a scene image for a narrative game.
 * @param prompt - The prompt to extract the scene image from.
 * @returns 
 */
export const extractSceneImagePrompt = (prompt: string): string => {
  return `Create a high-quality, detailed illustration for a narrative game scene.
The scene should depict: ${prompt}
Style: Cinematic, detailed, high-quality digital art with proper lighting and depth.

Focus on the individuals and the environment, ensuring a captivating atmosphere.
Make sure to include elements that enhance the narrative aspect of the scene.
Consider the following details:
- Expressions and poses of the individuals
- Background elements that complement the story
- Color palette that matches the mood of the scene
- Lighting that highlights the individuals and setting
Ensure the image is visually striking and immersive, drawing the viewer into the narrative.

### IMPORTANT:
- DO NOT include ANY text, words, letters, numbers, or written elements in the image.
- DO NOT include any UI elements, buttons, menus, or overlays in the image.
- The image must be completely free of any textual content.
- The image should be suitable for a narrative game, focusing on storytelling through visuals only.
- Avoid any elements that could be considered inappropriate or offensive.
`;
};

/**
 * @description Generates a prompt for creating an item image for a narrative game.
 * @param description - The description of the item.
 * @param itemName - The name of the item.
 * @param itemType - The type of the item.
 * @returns 
 */
export const extractItemImagePrompt = (description: string, itemName: string, itemType: string): string => {
  return `Create a high-quality 2D illustration of a ${itemType.toLowerCase()} named "${itemName}" for a fantasy narrative RPG, in a **vintage cartoon style** reminiscent of 1930s animation.

Description: ${description}

🎨 Style & Visual Guidelines:
- Artistic style: Hand-drawn cartoon with clean black linework, soft sepia tones, and subtle paper texture
- Background: Aged parchment with light wear, faint stains, and slightly torn edges — no harsh contrasts
- Materials and surfaces should feel worn, magical, or medieval, depending on the item
- Use gentle shading and textured coloring, no gradients or modern effects
- Give the object a stylized, slightly exaggerated fantasy look — like something out of a magical world

❌ Do NOT include:
- Any text, names, stats, numbers, symbols, labels, or UI elements
- Any modern design elements or polished/glossy effects

✅ Focus:
- Center the object clearly on the canvas
- Showcase its purpose and magical/fantasy nature through visual storytelling alone
- Make the object readable at a glance with rich textures and expressive silhouette

The result should look like a magical illustration from an old fantasy book or animated film.`;
};

/**
 * @description Generates a prompt for creating a character avatar for a narrative game.
 * @param character - The character object containing details for the avatar.
 * @returns
 */
export const extractCharacterAvatarPrompt = (character: any): string => {
  return `Create a detailed portrait in **vintage cartoon style** (1930s animation aesthetic) for a fantasy narrative RPG.

Details:
- Name: ${character.name}
- Description: ${character.description}
${character.personality ? `- Personality: ${character.personality}` : ''}
${character.outfit ? `- Outfit: ${character.outfit}` : ''}
${character.age ? `- Age: ${character.age}` : ''}

🎨 Style & Visual Guidelines:
- Head and shoulders only, centered
- Drawn in a soft vintage cartoon style with hand-inked lines and warm, muted sepia/brown tones
- Background: Plain or faded parchment-style, neutral and non-distracting
- Expression should reflect the individual's personality (e.g., mysterious, bold, cheerful)
- Use stylized proportions, classic cartoon exaggeration, and textured shading

❌ Do NOT include:
- Names, text, stats, borders, numbers, or any game UI
- Overly modern design elements or effects

✅ Focus:
- Communicate the individual’s identity and mood through face, posture, and outfit details
- Keep the portrait expressive, charming, and timeless — like a magical storybook illustration

The final result should evoke a nostalgic fantasy world through a unique, handcrafted cartoon look.`;
};

/**
 * @description Generates a prompt for improving text for a narrative game.
 * @param text - The text to improve for a narrative game.
 * @param genres - The genres to adapt the text to.
 * @param isChildren - Whether the text should be suitable for children.
 * @param items - Whether to create significant items for the story.
 * @param languageInstructions - Instructions for the language of the text.
 * @returns 
 */
export const getStoryGenerationPrompt = (
  text: string, 
  genres: string[],
  isChildren: boolean,
  items: boolean,
  languageInstructions: string
): string => {
  return `
Improve this text for a narrative game. Make it more captivating, descriptive and immersive, while preserving the main ideas. ${genres.length > 0 ? "Adapt it to the following genre(s): " + genres.join(", ") : ""}
        
${isChildren ? "Make it suitable for children, avoiding any inappropriate content, violence, or adult themes." : ""}
${languageInstructions}

${items ? `
Create 3-5 significant items/objects that will play important roles throughout the story. Each item should:
  - Have a clear purpose or function within the narrative
  - Be relevant to the plot, setting, or character development
  - Be interesting enough to be used multiple times across different scenes
  - Vary in rarity and usefulness
Do not create items that will only be used in a single scene.
` : ""}

Text: ${text}
`;
};

/**
 * @description Generates a prompt for creating the next scene in a narrative game.
 * @param storyData - The story data object containing details about the story.
 * @param currentScene - The current scene object containing details about the scene.
 * @param selectedChoice - The selected choice object containing details about the choice made by the player.
 * @param historyContext - The recent history context string.
 * @param diceRoll - The result of the dice roll.
 * @param playerInventory - The player's inventory array containing items.
 * @param approachingEnd - A boolean indicating if the story is approaching its end.
 * @param useItemSystem - A boolean indicating if the item system is being used.
 * @param activeItem - The active item object containing details about the currently equipped item.
 * @param languageInstructions - Instructions for the language of the text.
 * @returns 
 */

export const getNextScenePrompt = (
  storyData: any, 
  currentScene: any, 
  selectedChoice: any,
  historyContext: string,
  diceRoll: number,
  playerInventory: any[],
  approachingEnd: boolean,
  useItemSystem: boolean,
  activeItem: any,
  languageInstructions: string
): string => {
  return `
You are the narrator of an interactive text-based game. Based on the following information, generate the next scene of the story.
    
You must respect the language, tone, and style of the story.

### IMPORTANT - Language (localization):
${languageInstructions}
    
## STORY
Title: ${storyData.title}
Synopsis: ${storyData.synopsis}
Goal: ${storyData.goal}
Possible Endings: ${storyData.possibleEndings.join(", ")}
Narrative Style: ${storyData.narrativeStyle}
Genre(s): ${storyData.genre.join(", ")}
Is for children: ${storyData.isChildrenStory ? "Yes" : "No"}

${storyData.isChildrenStory ? "The story should be suitable for children, avoiding any inappropriate content like violence, adult themes, or complex language." : ""}
    
## MAIN CHARACTERS
${storyData.mainCharacters.map((char: any) => `- Name: ${char.name}
    Description: ${char.description}
    Personality: ${char.personality || "Undefined"}
    Outfit: ${char.outfit || "Undefined"}
    Age: ${char.age || "Undefined"}
    Background: ${char.background || "Undefined"}
    Abilities: ${char.abilities?.join(", ") || "Undefined"}
    Relationships: ${char.relationships?.join(", ") || "Undefined"}
    Motivations: ${char.motivations || "Undefined"}
    Flaws: ${char.flaws || "Undefined"}
    Backstory: ${char.backstory || "Undefined"}`).join("\n")}
    
## SECONDARY CHARACTERS
${storyData.secondaryCharacters.map((char: any) => `- Name: ${char.name}
    Description: ${char.description}
    Personality: ${char.personality || "Undefined"}
    Outfit: ${char.outfit || "Undefined"}
    Age: ${char.age || "Undefined"}
    Background: ${char.background || "Undefined"}
    Abilities: ${char.abilities?.join(", ") || "Undefined"}
    Relationships: ${char.relationships?.join(", ") || "Undefined"}
    Motivations: ${char.motivations || "Undefined"}
    Flaws: ${char.flaws || "Undefined"}
    Backstory: ${char.backstory || "Undefined"}`).join("\n")}

${useItemSystem ? `## AVAILABLE ITEMS IN STORY
  ${storyData.items.map((item: any) => `- Name: ${item.name}
    Description: ${item.description}
    Type: ${item.type}
    Rarity: ${item.rarity}
    Effect: ${item.effect || "None"}
    Use Count: ${item.useCount || "Unlimited"}`).join("\n")}
        
  ## PLAYER'S INVENTORY
  ${playerInventory.length > 0 ? playerInventory.map((item: any) => `- Name: ${item.name}
    Description: ${item.description}
    Type: ${item.type}
    Rarity: ${item.rarity}
    Effect: ${item.effect || "None"}
    Quantity: ${item.quantity}
    Equipped: ${item.isEquipped ? "Yes" : "No"}`).join("\n") : "The player has no items in their inventory."}

  ${activeItem ? `## ACTIVE ITEM
  - Name: ${activeItem.name}
  - Description: ${activeItem.description}
  - Type: ${activeItem.type}
  - Rarity: ${activeItem.rarity}
  - Effect: ${activeItem.effect || "None"}` : ""}`
: ""}
  
## CURRENT SCENE
Title: ${currentScene.title}
Content: ${currentScene.content}
    
## PLAYER'S CHOICE
Choice: "${selectedChoice.text}"
Description: ${selectedChoice.description || "No description available"}
Consequence: ${selectedChoice.consequence || "No consequence defined"}

## DICE ROLL RESULT
The player rolled a ${diceRoll} (on a scale of 1 to 6).
- 1-2: Minimal impact on the story, the choice action/consequence fails.
- 3-4: Moderate impact, the choice action/consequence succeeds but with complications or drawbacks.
- 5-6: Major impact, the choice action/consequence succeeds spectacularly, leading to significant changes in the story.

## RECENT HISTORY
${historyContext}
    
## DIALOGUE INSTRUCTIONS
Include 2-4 realistic dialogues between characters in key moments of the scene.
When placing a dialogue in the content, place the placeholder "__DIALOGUE__" on its own line where you want the dialogue to appear.
For each dialogue, specify:
1. The speaking character's name
2. The actual dialogue text
3. The emotion of the speaker (choose from: happy, sad, angry, surprised, confused, afraid, neutral)

Example format for returned dialogues array:
[
  {
    "speaker": "Character Name",
    "text": "What the character says",
    "emotion": "happy"
  },
  {
    "speaker": "Second Character Name",
    "text": "What the second character says",
    "emotion": "happy"
  },
  ...
]

## MAIN INSTRUCTIONS
1. Create an exciting new scene that naturally follows from the player's choice.
2. The impact of the choice must match the dice roll result (${diceRoll}/6).
3. The scene must be immersive, with sensory descriptions.
4. ${useItemSystem ? "You can introduce new items in the scene that the player might find or interact with." : "Focus on character development and plot advancement."}
5. Offer the player 4 distinct choices:
  ${useItemSystem ? "- Include a choice related to using an item from the player's inventory (if they have items). Mark this with is_item_related = true, requires_item = [item name], and consumes_item = true/false." : ""}
  - Include a thematic choice related to a character. Mark this with is_personalized = true.
  - Include a choice allowing the player to write their own action. Mark this with is_custom_choice = true.
  - Include a choice that is unexpected or surprising.
  ${!useItemSystem ? "- Include a choice that advances the plot in a meaningful way." : ""}
6. ${approachingEnd ? "Consider that the story is approaching its end, you can start steering towards a conclusion." : "Do not end the story unless it is a natural culmination point."}
7. Maintain the narrative style ${storyData.narrativeStyle}.
8. Include a visual description for scene image generation.
9. ${useItemSystem
    ? "FOCUS ON EXISTING ITEMS: Prioritize using items that already exist in the story. Only introduce a new item if it's absolutely necessary for the plot. You should mention and involve at least one existing item in this scene, allowing the player to interact with it."
    : "Focus on character interactions, environments, and emotional depth in your descriptions."}

Always keep in mind the characters' personalities, the player's inventory, and the player's previous choices when generating the new scene.
IMPORTANT: Ensure that dialogues are generated within the dialogue object and not within the scene content.
`;
};