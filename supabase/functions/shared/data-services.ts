import { logger, createGameSave, createCharacter, createItem, createScene, createChoice, createChoiceItemRelation, addItemToScene, addItemToInventory } from "./utils.ts";
import { generateBannerImage, generateSceneImage, generateItemImage, generateCharacterAvatar } from "./ai-services.ts";

export const createStoryFromData = async (supabase: any, storyObject: any, userId: string, jobId: string, isPremium: boolean, hasItems: boolean, language: string) => {
  logger.info(jobId, "Creating story record...");
  const storyId = crypto.randomUUID();
  
  const { data: story, error: storyError } = await supabase.from('Story').insert({
    id: storyId,
    title: storyObject.title,
    synopsis: storyObject.synopsis,
    goal: storyObject.goal,
    possibleEndings: storyObject.how_story_can_end,
    narrativeStyle: storyObject.narrative_style,
    max_scenes: storyObject.max_story_scenes,
    creatorId: userId,
    isChildrenStory: storyObject.is_children || false,
    genre: storyObject.genres || [],
    hasItems: hasItems,
    language: language,
    v: "V3"
  }).select().single();

  if (storyError) {
    throw new Error(`Failed to create story: ${storyError.message}`);
  }

  logger.info(jobId, "Creating principal characters...");
  const principalCharIds = [];
  for (const character of storyObject.principal_characters) {
    const charId = await createCharacter(supabase, character, storyId, true);
    principalCharIds.push(charId);
    
    if (isPremium) {
      const avatarUrl = await generateCharacterAvatar(storyId, charId, character, jobId);
      if (avatarUrl) {
        await supabase.from('Character').update({
          imageUrl: avatarUrl
        }).eq('id', charId);
      }
    }
  }

  logger.info(jobId, "Creating secondary characters...");
  for (const character of storyObject.secondary_characters) {
    await createCharacter(supabase, character, storyId, false);
  }

  const itemsMap: Record<string, string> = {};
  if (hasItems && storyObject.items.length > 0) {
    logger.info(jobId, "Creating items...");
    
    for (const item of storyObject.items) {
      const itemId = await createItem(supabase, item, storyId);
      itemsMap[item.name] = itemId;
      
      if (isPremium) {
        const itemImageUrl = await generateItemImage(storyId, itemId, item, jobId);
        if (itemImageUrl) {
          await supabase.from('Item').update({
            imageUrl: itemImageUrl
          }).eq('id', itemId);
        }
      }
    }
  }

  logger.info(jobId, "Creating first scene...");
  let firstSceneId = null;
  let firstSceneData = null;

  if (storyObject.first_scene.length > 0) {
    firstSceneData = storyObject.first_scene[0];
    const scene = await createScene(supabase, firstSceneData, storyId, 1);
    firstSceneId = scene.id;

    if (hasItems && firstSceneData.found_items && firstSceneData.found_items.length > 0) {
      for (const itemName of firstSceneData.found_items) {
        const itemId = itemsMap[itemName];
        if (itemId) {
          await addItemToScene(supabase, firstSceneId, itemId, false);
        }
      }
    }

    for (const choice of firstSceneData.user_choices) {
      const choiceId = await createChoice(supabase, choice, firstSceneId);
      
      if (hasItems && choice.requires_item) {
        const itemId = itemsMap[choice.requires_item];
        if (itemId) {
          await createChoiceItemRelation(supabase, choiceId, itemId, choice.consumes_item || false);
        }
      }
    }
  }

  if (isPremium) {
    logger.info(jobId, "Generating banner image...");
    const bannerImageUrl = await generateBannerImage(storyId, storyObject.banner_image_visual_description, jobId);
    if (bannerImageUrl) {
      await supabase.from('Story').update({
        coverImageUrl: bannerImageUrl,
        current_scene_id: firstSceneId ?? ""
      }).eq('id', storyId);
    }

    if (firstSceneId && firstSceneData) {
      logger.info(jobId, "Generating scene image (premium user)...");
      const sceneImageUrl = await generateSceneImage(storyId, firstSceneId, firstSceneData.visual_illustration_image_description, jobId);
      if (sceneImageUrl) {
        await supabase.from('Scene').update({
          imageUrl: sceneImageUrl
        }).eq('id', firstSceneId);
      }
    }
  }

  logger.info(jobId, "Creating game save...");
  let gameSaveId = null;
  if (firstSceneId) {
    try {
      gameSaveId = await createGameSave(supabase, userId, storyId, firstSceneId);
      
      if (hasItems && firstSceneData?.found_items && firstSceneData.found_items.length > 0) {
        for (const itemName of firstSceneData.found_items) {
          const itemId = itemsMap[itemName];
          if (!itemId) continue;
          
          await addItemToInventory(supabase, gameSaveId, itemId);
        }
      }
    } catch (saveError) {
      logger.error(jobId, "Error creating game save:", saveError);
    }
  }

  return {
    storyId,
    firstSceneId,
    gameSaveId,
    language
  };
};