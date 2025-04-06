import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { generateObject, createProviderRegistry } from "npm:ai";
import { createOpenAI } from "npm:@ai-sdk/openai";
import { z } from "npm:zod";
import { createClient } from "jsr:@supabase/supabase-js";
import { createId } from "npm:@paralleldrive/cuid2";
import { OpenAI } from "npm:openai";

const registry = createProviderRegistry({
  openai: createOpenAI({
    apiKey: Deno.env.get("OPENAI_API_KEY")
  })
});

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY")
});

const choiceSchema = z.object({
  label: z.string().min(1).max(150),
  description: z.string().min(1).max(200),
  consequence: z.string().min(1).max(200),
  next_scene_waiting_loader_message: z.string().min(1).max(200),
  impact_level: z.number().int().min(1).max(6),
  is_personalized: z.boolean().default(false),
  is_custom_choice: z.boolean().default(false),
  is_item_related: z.boolean().default(false),
  requires_item: z.string().optional(),
  consumes_item: z.boolean().optional().default(false)
});

function extractSceneImagePrompt(prompt) {
  return `Create a high-quality, detailed environmental illustration for a narrative game scene. 
The scene should depict the SETTING ONLY: ${prompt}
Style: Cinematic, detailed, high-quality digital art with proper lighting and depth.

Focus exclusively on the environment and setting, with NO CHARACTERS present.
Make sure to include elements that enhance the narrative aspect of the scene.
Consider the following details:
- Atmospheric lighting and mood
- Environmental details and textures
- Background elements that complement the story
- Color palette that matches the mood of the scene
- Depth and perspective to create an immersive setting

### IMPORTANT:
- DO NOT include any characters, people, or living beings in the image.
- Show ONLY the environment, location, and setting.
- The environment should be the main focus - create an evocative, empty scene.
- Do not include any text or UI elements in the image.
- The image should be suitable for a narrative game, focusing on storytelling through environments.
- Avoid any elements that could be considered inappropriate or offensive.
`;
}

function extractItemImagePrompt(description, itemName, itemType) {
  return `Create a high-quality, detailed illustration of a ${itemType.toLowerCase()} for a narrative game. 
The item is: ${itemName}
Description: ${description}

Style: Detailed, high-quality digital art with proper lighting and depth.
Make the item stand out against a simple, slightly blurred background that hints at the setting.

### IMPORTANT:
- Do not include any text or UI elements in the image.
- The image should focus solely on the item itself.
- The item should be centrally positioned and well-lit.
- Avoid any elements that could be considered inappropriate or offensive.
`;
}

async function uploadImageToSupabase(imageUrl, path) {
  const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SERVICE_ROLE_KEY"));
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
    const imageBuffer = await response.arrayBuffer();
    const { data, error } = await supabase.storage.from('images').upload(`${path}.png`, imageBuffer, {
      contentType: 'image/png',
      upsert: true
    });
    if (error) throw error;
    const { data: urlData } = supabase.storage.from('images').getPublicUrl(`${path}.png`);
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", {
      status: 405
    });
  }

  const { storyId, sceneId, choiceId, diceRoll = 3, gameSaveId, userId, customText, isPremium = false, isChildren = false, items = false } = await req.json();

  if (!storyId || !sceneId || !(choiceId || customText) || !userId) {
    return new Response(JSON.stringify({
      error: "Missing required fields: storyId, sceneId, choiceId/customText, and userId"
    }), {
      headers: {
        "Content-Type": "application/json"
      },
      status: 400
    });
  }

  const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SERVICE_ROLE_KEY"));

  try {
    const { data: userData, error: userError } = await supabase.from('User').select('*').eq('id', userId).single();
    if (userError || !userData) {
      throw new Error(`Utilisateur non trouvé: ${userError?.message || "ID invalide"}`);
    }

    const { data: story, error: storyError } = await supabase.from('Story').select(`
        id, title, synopsis, goal, possibleEndings, narrativeStyle, genre, max_scenes, current_scene, creatorId, hasItems,
        Character (
          id, name, description, personality, outfit, age, background, abilities, relationships, motivations, flaws, backstory, isMain
        ),
        Scene (
          id, title, content, order, 
          Choice (
            id, text, description, consequence, loadingMessage, isPersonalized, isCustomChoice, isItemRelated
          )
        ),
        Item (
          id, name, description, type, rarity, effect, useCount
        )
      `).eq('id', storyId).order('order', {
      foreignTable: 'Scene',
      ascending: true
    }).single();

    if (storyError || !story) {
      throw new Error(`Histoire non trouvée: ${storyError?.message || "ID invalide"}`);
    }

    console.log("Story data:", story.creatorId, userId);
    if (story.creatorId !== userId) {
      throw new Error("You do not have permission to access this story");
    }

    const useItemSystem = items && story.hasItems;
    
    let currentScene = story.Scene.find((s) => s.id === sceneId);
    if (!currentScene) {
      throw new Error("Not found current scene");
    }

    let playerInventory = [];
    if (useItemSystem && gameSaveId) {
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('InventoryItem')
        .select(`
          id, quantity, isEquipped,
          item:itemId (
            id, name, description, type, rarity, effect, useCount
          )
        `)
        .eq('gameSaveId', gameSaveId);

      if (!inventoryError && inventoryData) {
        playerInventory = inventoryData.map(invItem => ({
          id: invItem.item.id,
          name: invItem.item.name,
          description: invItem.item.description,
          type: invItem.item.type,
          rarity: invItem.item.rarity,
          effect: invItem.item.effect,
          useCount: invItem.item.useCount,
          quantity: invItem.quantity,
          isEquipped: invItem.isEquipped
        }));
      }
    }

    let availableSceneItems = [];
    if (useItemSystem) {
      const { data: sceneItems, error: sceneItemsError } = await supabase
        .from('SceneItem')
        .select(`
          id, isHidden,
          item:itemId (
            id, name, description, type, rarity, effect, useCount
          )
        `)
        .eq('sceneId', sceneId);

      availableSceneItems = !sceneItemsError && sceneItems ? 
        sceneItems.map(si => ({
          id: si.item.id,
          name: si.item.name,
          description: si.item.description,
          type: si.item.type,
          rarity: si.item.rarity,
          effect: si.item.effect,
          useCount: si.item.useCount,
          isHidden: si.isHidden
        })) : [];
    }

    let selectedChoice;

    if (customText) {
      const existingCustomChoice = currentScene.Choice.find(c => c.isCustomChoice);
      
      if (existingCustomChoice) {
        // Update the existing custom choice with the player's text
        const { data: updatedChoice, error: updateError } = await supabase
          .from('Choice')
          .update({
            text: customText,
            consequence: customText
          })
          .eq('id', existingCustomChoice.id)
          .select()
          .single();
          
        if (updateError) {
          throw new Error(`Erreur lors de la mise à jour du choix personnalisé: ${updateError.message}`);
        }
        
        selectedChoice = updatedChoice;
      } else {
        const { data: syntheticChoice, error: choiceError } = await supabase
          .from('Choice')
          .insert({
            id: createId(),
            text: customText,
            description: "Choix personnalisé du joueur",
            consequence: customText,
            loadingMessage: "L'histoire se développe selon votre action personnalisée...",
            isCustomChoice: true,
            sceneId: sceneId
          })
          .select()
          .single();
          
        if (choiceError) {
          throw new Error(`Erreur lors de la création du choix personnalisé: ${choiceError.message}`);
        }
        
        selectedChoice = syntheticChoice;
      }
    } else {
      selectedChoice = currentScene.Choice.find((c) => c.id === choiceId);
      if (!selectedChoice) {
        throw new Error("Choix sélectionné non trouvé");
      }

      if (useItemSystem && selectedChoice.isItemRelated) {
        const { data: choiceItemData, error: choiceItemError } = await supabase
          .from('ChoiceItem')
          .select(`
            id, consumed,
            item:itemId (id, name)
          `)
          .eq('choiceId', selectedChoice.id)
          .single();

        if (!choiceItemError && choiceItemData) {
          const hasRequiredItem = playerInventory.some(item => item.id === choiceItemData.item.id);
          
          if (!hasRequiredItem) {
            throw new Error(`Ce choix nécessite l'objet "${choiceItemData.item.name}" que vous ne possédez pas.`);
          }

          if (choiceItemData.consumed && gameSaveId) {
            const inventoryItem = playerInventory.find(item => item.id === choiceItemData.item.id);
            
            if (inventoryItem && inventoryItem.quantity > 1) {
              await supabase
                .from('InventoryItem')
                .update({ quantity: inventoryItem.quantity - 1 })
                .eq('gameSaveId', gameSaveId)
                .eq('itemId', choiceItemData.item.id);
            } else if (inventoryItem) {
              await supabase
                .from('InventoryItem')
                .delete()
                .eq('gameSaveId', gameSaveId)
                .eq('itemId', choiceItemData.item.id);
            }
          }
        }
      }
    }

    const sceneHistory = story.Scene.filter((s) => s.id !== currentScene.id && (s.order || 0) < (currentScene.order || 0)).sort((a, b) => (a.order || 0) - (b.order || 0)).slice(-5);
    const historyContext = sceneHistory.map((scene) => `Scene:: ${scene.title}\n${scene.content}\nSelected choice: ${scene.selected_choice_id ? scene.Choice?.find((c) => c.id === scene.selected_choice_id)?.text || "Aucun choix sélectionné" : "Aucun choix sélectionné"}`).join("\n\n");
    
    const mainCharacters = story.Character.filter((c) => c.isMain);
    const secondaryCharacters = story.Character.filter((c) => !c.isMain);
    
    const newSceneOrder = (currentScene.order || 0) + 1;
    const approachingEnd = newSceneOrder >= (story.max_scenes || 20) - 3;
    
    const prompt = `
You are the narrator of an interactive text-based game. Based on the following information, generate the next scene of the story.
    
You must respect the language, tone, and style of the story.
Only languages avaible to generates stories is French or English. If the user has written in French, you must respond in French. But every other language, you must respond in English.
    
## STORY
Title: ${story.title}
Synopsis: ${story.synopsis}
Goal: ${story.goal}
Possible Endings: ${story.possibleEndings.join(", ")}
Narrative Style: ${story.narrativeStyle}
Genre(s): ${story.genre.join(", ")}
Is for children: ${isChildren ? "Yes" : "No"}

${isChildren ? "The story should be suitable for children, avoiding any inappropriate content like violence, adult themes, or complex language." : ""}
    
## MAIN CHARACTERS
${mainCharacters.map((char) => `- Name: ${char.name}
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
${secondaryCharacters.map((char) => `- Name: ${char.name}
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
${story.Item.map(item => `- Name: ${item.name}
  Description: ${item.description}
  Type: ${item.type}
  Rarity: ${item.rarity}
  Effect: ${item.effect || "None"}
  Use Count: ${item.useCount || "Unlimited"}`).join("\n")}
      
## PLAYER'S INVENTORY
${playerInventory.length > 0 ? playerInventory.map(item => `- Name: ${item.name}
  Description: ${item.description}
  Type: ${item.type}
  Rarity: ${item.rarity}
  Effect: ${item.effect || "None"}
  Quantity: ${item.quantity}
  Equipped: ${item.isEquipped ? "Yes" : "No"}`).join("\n") : "The player has no items in their inventory."}

## ITEMS IN CURRENT SCENE
${availableSceneItems.length > 0 ? availableSceneItems.filter(item => !item.isHidden).map(item => `- Name: ${item.name}
  Description: ${item.description}
  Type: ${item.type}
  Rarity: ${item.rarity}
  Effect: ${item.effect || "None"}`).join("\n") : "No visible items in this scene."}` : ""}
  
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
    
## INSTRUCTIONS
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
7. Maintain the narrative style ${story.narrativeStyle}.
8. Include a visual description for scene image generation.
9. ${useItemSystem
    ? "FOCUS ON EXISTING ITEMS: Prioritize using items that already exist in the story. Only introduce a new item if it's absolutely necessary for the plot. You should mention and involve at least one existing item in this scene, allowing the player to interact with it."
    : "Focus on character interactions, environments, and emotional depth in your descriptions."}

Always keep in mind the characters' personalities, the player's inventory, and the player's previous choices when generating the new scene.
`;

    console.log("Generating new scene...");
    const model = registry.languageModel("openai:gpt-4o");
    const { object } = await generateObject({
      model,
      schema: z.object({
        title: z.string().min(1).max(100),
        content: z.string().min(100),
        visual_illustration_image_description: z.string().min(1),
        new_items: useItemSystem ? z.array(z.object({
          name: z.string().min(1).max(100),
          description: z.string().min(1).max(200),
          type: z.enum(["WEAPON", "ARMOR", "POTION", "KEY", "TOOL", "DOCUMENT", "QUEST", "MISC"]),
          rarity: z.enum(["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY"]),
          effect: z.string().min(1).max(200).optional(),
          useCount: z.number().int().optional(),
          is_hidden: z.boolean().default(false)
        })).max(1).optional().default([]) : z.array(z.any()).default([]),
        choices: z.array(choiceSchema).min(4).max(4),
        is_ending: z.boolean().default(false),
        ending_type: z.string().optional(),
        mentioned_items: z.array(z.string()).min(0).optional().default([])
      }),
      prompt
    });

    const isEnding = object.is_ending || newSceneOrder >= (story.max_scenes || 20);
    console.log("Scene generated, updating database...");

    await supabase.from('Scene').update({
      selected_choice_id: selectedChoice.id,
      diceRoll: diceRoll
    }).eq('id', currentScene.id);

    const { data: newScene, error: sceneError } = await supabase.from('Scene').insert({
      id: createId(),
      title: object.title,
      content: object.content,
      imagePrompt: object.visual_illustration_image_description,
      order: newSceneOrder,
      storyId: story.id
    }).select().single();

    if (sceneError) {
      throw new Error(`Erreur lors de la création de la scène: ${sceneError.message}`);
    }

    const newItemsMap = {};
    if (useItemSystem && object.new_items && object.new_items.length > 0) {
      for (const newItem of object.new_items) {
        const itemId = createId();
        newItemsMap[newItem.name] = itemId;
        
        let durability = null;
        
        if (["WEAPON", "ARMOR", "TOOL"].includes(newItem.type)) {
          const rarityMultiplier = {
            "COMMON": 1,
            "UNCOMMON": 2,
            "RARE": 3,
            "EPIC": 4,
            "LEGENDARY": 5
          };
          
          durability = 5 * (rarityMultiplier[newItem.rarity] || 1);
        } 
        else if (newItem.type === "POTION") {
          durability = 1;
        }
        
        await supabase.from('Item').insert({
          id: itemId,
          name: newItem.name,
          description: newItem.description,
          type: newItem.type,
          rarity: newItem.rarity,
          effect: newItem.effect,
          durability: durability,
          isBroken: false,
          storyId: story.id
        });
        
        await supabase.from('SceneItem').insert({
          id: createId(),
          sceneId: newScene.id,
          itemId: itemId,
          isHidden: newItem.is_hidden || false
        });
        
        if (!newItem.is_hidden && gameSaveId) {
          await supabase.from('InventoryItem').insert({
            id: createId(),
            gameSaveId: gameSaveId,
            itemId: itemId,
            quantity: 1,
            isEquipped: false,
            remainingUses: durability,
            isBroken: false
          });
        }
      }
      
      if (isPremium) {
        for (const [itemName, itemId] of Object.entries(newItemsMap)) {
          const newItem = object.new_items.find(item => item.name === itemName);
          if (!newItem) continue;
          
          try {
            const itemImagePrompt = extractItemImagePrompt(newItem.description, newItem.name, newItem.type);

            const imageResponse = await openai.images.generate({
              model: "dall-e-3",
              prompt: itemImagePrompt,
              n: 1,
              size: "1024x1024",
              quality: "standard",
              style: "vivid"
            });
            
            if (imageResponse.data.length > 0) {
              const itemImage = imageResponse.data[0];
              const itemImageUrl = await uploadImageToSupabase(itemImage.url ?? "", `${story.id}/items/${itemId}`);
              
              if (itemImageUrl) {
                await supabase.from('Item').update({
                  imageUrl: itemImageUrl
                }).eq('id', itemId);
              }
            }
          } catch (itemImageError) {
            console.error(`Error generating item image for ${itemName}:`, itemImageError);
          }
        }
      }
    }

    if (!isEnding) {
      for (const choice of object.choices) {
        const choiceId = createId();
        
        await supabase.from('Choice').insert({
          id: choiceId,
          text: choice.label,
          description: choice.description,
          consequence: choice.consequence,
          loadingMessage: choice.next_scene_waiting_loader_message,
          isPersonalized: choice.is_personalized,
          isCustomChoice: choice.is_custom_choice,
          isItemRelated: useItemSystem ? choice.is_item_related : false,
          sceneId: newScene.id
        });
        
        if (useItemSystem && choice.is_item_related && choice.requires_item) {
          let itemId = newItemsMap[choice.requires_item];
          
          if (!itemId) {
            const requiredItem = story.Item.find(item => item.name === choice.requires_item);
            if (requiredItem) {
              itemId = requiredItem.id;
            }
          }
          
          if (itemId) {
            await supabase.from('ChoiceItem').insert({
              id: createId(),
              choiceId: choiceId,
              itemId: itemId,
              consumed: choice.consumes_item || false
            });
          }
        }
      }
    }

    await supabase.from('SceneTransition').insert({
      id: createId(),
      sourceSceneId: currentScene.id,
      destinationSceneId: newScene.id,
      choiceId: selectedChoice.id
    });

    await supabase.from('Story').update({
      current_scene_id: newScene.id,
      current_scene: newSceneOrder
    }).eq('id', story.id);

    if (gameSaveId) {
      await supabase.from('GameSave').update({
        currentSceneId: newScene.id,
        progress: newSceneOrder,
        lastPlayed: new Date().toISOString()
      }).eq('id', gameSaveId);
      
      await supabase.from('SaveHistory').insert({
        id: createId(),
        gameSaveId: gameSaveId,
        sceneId: currentScene.id,
        choiceId: selectedChoice.id,
        timestamp: new Date().toISOString()
      });
    }

    console.log("Database updated successfully");

    if (isPremium) {
      console.log("Generating scene image for premium user...");
      try {
        const imageResponse = await openai.images.generate({
          model: "dall-e-3",
          prompt: extractSceneImagePrompt(object.visual_illustration_image_description),
          n: 1,
          size: "1792x1024",
          quality: "standard",
          style: "natural"
        });

        if (imageResponse.data.length > 0) {
          console.log("Uploading scene image...");
          const sceneImage = imageResponse.data[0];
          const sceneImageUrl = await uploadImageToSupabase(sceneImage.url ?? "", `${story.id}/scenes/${newScene.id}`);
          if (sceneImageUrl) {
            await supabase.from('Scene').update({
              imageUrl: sceneImageUrl
            }).eq('id', newScene.id);
          }
        }
      } catch (imageError) {
        console.error("Error generating scene image:", imageError);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      scene: {
        id: newScene.id,
        title: newScene.title,
        content: newScene.content,
        storyId: story.id,
        is_ending: isEnding,
        ending_type: object.ending_type,
        new_items: useItemSystem ? (object.new_items || []) : [],
        items_enabled: useItemSystem
      },
      redirect: gameSaveId ? `/${gameSaveId}/${newScene.id}` : `/${storyId}/${newScene.id}`
    }), {
      headers: {
        "Content-Type": "application/json"
      },
      status: 200
    });
  } catch (error) {
    console.error("Error generating next scene:", error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      headers: {
        "Content-Type": "application/json"
      },
      status: 400
    });
  }
});