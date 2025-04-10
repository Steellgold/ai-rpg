import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { generateObject } from "npm:ai";
import { createClient } from "npm:@supabase/supabase-js";
import { createId } from "npm:@paralleldrive/cuid2";
import { logger, updateJob, createItem, createChoice, createChoiceItemRelation, addItemToScene, addItemToInventory, createDialogue } from "../shared/utils.ts";
import { generateSceneImage, generateItemImage } from "../shared/ai-services.ts";
import { getNextScenePrompt, getLanguageInstructions } from "../shared/prompts.ts";
import { nextSceneSchema } from "../shared/schemas.ts";
import { registry } from "../shared/registry.ts";

interface RequestParams {
  storyId: string;
  sceneId: string;
  choiceId?: string;
  customText?: string;
  diceRoll: number;
  userId: string;
  items: boolean;
  activeItem?: any;
  gameSaveId?: string;
  language?: string;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", {
      status: 405
    });
  }

  const { 
    storyId, 
    sceneId, 
    choiceId, 
    customText, 
    diceRoll = 3, 
    userId, 
    items = false, 
    activeItem,
    gameSaveId,
    language
  } = await req.json() as RequestParams;

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

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SERVICE_ROLE_KEY")!);

  const generationId = createId();

  try {
    logger.info(generationId, "Starting scene generation...");
    
    const { data: userData, error: userError } = await supabase.from('User').select('*').eq('id', userId).single();
    if (userError || !userData) {
      throw new Error(`User not found: ${userError?.message || "Invalid ID"}`);
    }

    const { data: story, error: storyError } = await supabase.from('Story').select(`
        id, title, synopsis, goal, possibleEndings, narrativeStyle, genre, max_scenes, current_scene, creatorId, hasItems, language,
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
      throw new Error(`Story not found: ${storyError?.message || "Invalid ID"}`);
    }

    logger.info(generationId, "Story data retrieved:", story.id, userId);
    if (story.creatorId !== userId) {
      throw new Error("You do not have permission to access this story");
    }

    const outputLanguage = language || story.language || "en";
    const languageInstructions = getLanguageInstructions(outputLanguage);
    
    const useItemSystem = items && story.hasItems;
    
    let currentScene = story.Scene.find((s) => s.id === sceneId);
    if (!currentScene) {
      throw new Error("Current scene not found");
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
        sceneItems.filter(si => !si.isHidden).map(si => si.item) : [];
    }

    let selectedChoice;

    if (customText) {
      const existingCustomChoice = currentScene.Choice.find(c => c.isCustomChoice);
      
      if (existingCustomChoice) {
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
          throw new Error(`Error updating custom choice: ${updateError.message}`);
        }
        
        selectedChoice = updatedChoice;
      } else {
        const { data: syntheticChoice, error: choiceError } = await supabase
          .from('Choice')
          .insert({
            id: createId(),
            text: customText,
            description: "Custom player choice",
            consequence: customText,
            loadingMessage: "The story unfolds according to your custom action...",
            isCustomChoice: true,
            sceneId: sceneId
          })
          .select()
          .single();
          
        if (choiceError) {
          throw new Error(`Error creating custom choice: ${choiceError.message}`);
        }
        
        selectedChoice = syntheticChoice;
      }
    } else {
      selectedChoice = currentScene.Choice.find((c) => c.id === choiceId);
      if (!selectedChoice) {
        throw new Error("Selected choice not found");
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
            throw new Error(`This choice requires the item "${choiceItemData.item.name}" which you don't have.`);
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

    if (gameSaveId && selectedChoice) {
      try {
        await supabase.from('SaveHistory').insert({
          id: createId(),
          gameSaveId: gameSaveId,
          sceneId: sceneId,
          choiceId: selectedChoice.id,
          timestamp: new Date().toISOString()
        });
      } catch (historyError) {
        logger.error(generationId, "Error recording save history:", historyError);
      }
    }

    const sceneHistory = story.Scene
      .filter((s) => s.id !== currentScene.id && (s.order || 0) < (currentScene.order || 0))
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .slice(-5);

    const historyContext = sceneHistory
      .map((scene) => `Scene:: ${scene.title}\n${scene.content}\nSelected choice: ${scene.selected_choice_id ? scene.Choice?.find((c) => c.id === scene.selected_choice_id)?.text || "No choice selected" : "No choice selected"}`)
      .join("\n\n");
    
    const mainCharacters = story.Character.filter((c) => c.isMain);
    const secondaryCharacters = story.Character.filter((c) => !c.isMain);
    
    const newSceneOrder = (currentScene.order || 0) + 1;
    const approachingEnd = newSceneOrder >= (story.max_scenes || 20) - 3;
    
    const storyData = {
      title: story.title,
      synopsis: story.synopsis,
      goal: story.goal,
      possibleEndings: story.possibleEndings,
      narrativeStyle: story.narrativeStyle,
      genre: story.genre,
      isChildrenStory: !!story.isChildrenStory,
      mainCharacters,
      secondaryCharacters,
      items: story.Item
    };
    
    logger.info(generationId, "Generating new scene...");
    const model = registry.languageModel("openai:gpt-4o-mini");
    
    const prompt = getNextScenePrompt(
      storyData,
      currentScene,
      selectedChoice,
      historyContext,
      diceRoll,
      playerInventory,
      approachingEnd,
      useItemSystem,
      activeItem,
      languageInstructions
    );

    const { object } = await generateObject({
      model,
      schema: nextSceneSchema,
      prompt
    });

    const isEnding = object.is_ending || newSceneOrder >= (story.max_scenes || 20);
    logger.info(generationId, "Scene generated, updating database...");

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
      throw new Error(`Error creating scene: ${sceneError.message}`);
    }

    if (object.dialogues && object.dialogues.length > 0) {
      for (let i = 0; i < object.dialogues.length; i++) {
        await createDialogue(supabase, object.dialogues[i], newScene.id, i);
      }
    }
    
    const { data: sceneWithDialogues, error: dialoguesError } = await supabase
      .from('Scene')
      .select(`
        id, title, content, imageUrl, imagePrompt,
        dialogues (id, speaker, text, emotion, order)
      `)
      .eq('id', newScene.id)
      .single();

    let updatedScene = newScene;
    if (!dialoguesError && sceneWithDialogues) {
      updatedScene = { ...newScene, dialogues: sceneWithDialogues.dialogues };
    }

    const newItemsMap = {};
    if (useItemSystem && object.new_items && object.new_items.length > 0) {
      for (const newItem of object.new_items) {
        const itemId = await createItem(supabase, newItem, story.id);
        newItemsMap[newItem.name] = itemId;
        
        await addItemToScene(supabase, newScene.id, itemId, newItem.is_hidden || false);
        
        if (!newItem.is_hidden && gameSaveId) {
          await addItemToInventory(supabase, gameSaveId, itemId);
        }
        
        // Générer une image pour l'item si nécessaire
        const shouldGenerateImage = userData.credits > 0;
        if (shouldGenerateImage) {
          const itemImageUrl = await generateItemImage(story.id, itemId, newItem, generationId);
          if (itemImageUrl) {
            await supabase.from('Item').update({
              imageUrl: itemImageUrl
            }).eq('id', itemId);
          }
        }
      }
    }

    if (!isEnding) {
      for (const choice of object.choices) {
        const choiceId = await createChoice(supabase, choice, newScene.id);
        
        if (useItemSystem && choice.is_item_related && choice.requires_item) {
          let itemId = newItemsMap[choice.requires_item];
          
          if (!itemId) {
            const requiredItem = story.Item.find(item => item.name === choice.requires_item);
            if (requiredItem) {
              itemId = requiredItem.id;
            }
          }
          
          if (itemId) {
            await createChoiceItemRelation(supabase, choiceId, itemId, choice.consumes_item || false);
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
    }

    logger.info(generationId, "Database updated successfully");

    // Générer une image pour la scène si l'utilisateur a des crédits
    const shouldGenerateSceneImage = userData.credits > 0;
    if (shouldGenerateSceneImage) {
      logger.info(generationId, "Generating scene image...");
      try {
        const sceneImageUrl = await generateSceneImage(
          story.id,
          newScene.id,
          object.visual_illustration_image_description,
          generationId
        );
        
        if (sceneImageUrl) {
          await supabase.from('Scene').update({
            imageUrl: sceneImageUrl
          }).eq('id', newScene.id);
        }
      } catch (imageError) {
        logger.error(generationId, "Error generating scene image:", imageError);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      scene: {
        id: updatedScene.id,
        title: updatedScene.title,
        content: updatedScene.content,
        storyId: story.id,
        is_ending: isEnding,
        ending_type: object.ending_type,
        new_items: useItemSystem ? (object.new_items || []) : [],
        dialogues: updatedScene.dialogues || [],
        items_enabled: useItemSystem,
        progress: newSceneOrder
      },
      redirect: gameSaveId ? `/${gameSaveId}/${newScene.id}` : `/${storyId}/${newScene.id}`,
      gameSaveId: gameSaveId
    }), {
      headers: {
        "Content-Type": "application/json"
      },
      status: 200
    });
  } catch (error) {
    logger.error(generationId, "Error generating next scene:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "An unexpected error occurred"}),
      { headers: { "Content-Type": "application/json" }, status: 400 }
    );
  }
});