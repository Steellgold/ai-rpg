import { ScenePromptOptions } from './types';
import { getLanguageInstructions } from './language';
import { MAX_TOKENS } from './constants';

export function getNextScenePrompt(options: ScenePromptOptions): string {
  const {
    storyData,
    currentScene,
    selectedChoice,
    historyContext,
    diceRoll,
    playerInventory,
    approachingEnd,
    useItemSystem,
    activeItem,
    language = 'en',
    isChildSafe = false,
    maxTokens = MAX_TOKENS.SCENE
  } = options;

  const languageInstructions = getLanguageInstructions(language);
  
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
Is for children: ${isChildSafe ? "Yes" : "No"}

${isChildSafe ? "The story should be suitable for children, avoiding any inappropriate content like violence, adult themes, or complex language." : ""}
    
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
}