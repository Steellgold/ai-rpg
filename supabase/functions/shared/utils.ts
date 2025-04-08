import { createClient } from "@supabase/supabase-js";

export const logger = {
  info: (jobId: string, message: string, ...args: any[]) => {
    console.log(`[${jobId}] INFO: ${message}`, ...args);
  },
  warn: (jobId: string, message: string, ...args: any[]) => {
    console.warn(`[${jobId}] WARN: ${message}`, ...args);
  },
  error: (jobId: string, message: string, ...args: any[]) => {
    console.error(`[${jobId}] ERROR: ${message}`, ...args);
  }
};

export const uploadImageToSupabase = async (imageUrl: string, path: string): Promise<string | null> => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SERVICE_ROLE_KEY")!
  );
  
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
};

export const updateJob = async (supabase: any, jobId: string, updates: any) => {
  try {
    const { error } = await supabase.from('Job').update({
      ...updates,
      updatedAt: new Date().toISOString()
    }).eq('id', jobId);
    
    if (error) {
      console.error(`Error updating job ${jobId}:`, error);
      throw error;
    }
  } catch (error) {
    console.error(`Failed to update job ${jobId}:`, error);
  }
};

export const calculateItemDurability = (itemType: string, itemRarity: string): number | null => {
  if (!["WEAPON", "ARMOR", "TOOL", "POTION"].includes(itemType)) {
    return null;
  }
  
  const rarityMultiplier: Record<string, number> = {
    "COMMON": 1,
    "UNCOMMON": 2,
    "RARE": 3,
    "EPIC": 4,
    "LEGENDARY": 5
  };
  
  if (itemType === "POTION") {
    return 1;
  }
  
  return 5 * (rarityMultiplier[itemRarity] || 1);
};

export const createItem = async (supabase: any, item: any, storyId: string) => {
  const itemId = crypto.randomUUID();
  const durability = calculateItemDurability(item.type, item.rarity);
  
  await supabase.from('Item').insert({
    id: itemId,
    name: item.name,
    description: item.description,
    type: item.type,
    rarity: item.rarity,
    effect: item.effect,
    useCount: item.useCount,
    durability: durability,
    isBroken: false,
    storyId: storyId
  });
  
  return itemId;
};

export const createCharacter = async (supabase: any, character: any, storyId: string, isMain: boolean) => {
  const characterId = crypto.randomUUID();
  
  await supabase.from('Character').insert({
    id: characterId,
    name: character.name,
    description: character.description,
    personality: character.personality,
    outfit: character.outfit,
    age: character.age,
    background: character.background,
    abilities: character.abilities || [],
    relationships: character.relationships || [],
    motivations: character.motivations,
    flaws: character.flaws,
    backstory: character.backstory,
    isMain: isMain,
    storyId: storyId
  });
  
  return characterId;
};

export const createScene = async (supabase: any, sceneData: any, storyId: string, order: number = 1) => {
  const sceneId = crypto.randomUUID();
  
  const { data: scene, error } = await supabase.from('Scene').insert({
    id: sceneId,
    title: sceneData.title,
    content: sceneData.text || sceneData.content,
    imagePrompt: sceneData.visual_illustration_image_description,
    order: order,
    storyId: storyId
  }).select().single();
  
  if (error) {
    throw new Error(`Failed to create scene: ${error.message}`);
  }
  
  if (sceneData.dialogues && sceneData.dialogues.length > 0) {
    for (let i = 0; i < sceneData.dialogues.length; i++) {
      await createDialogue(supabase, sceneData.dialogues[i], sceneId, i);
    }
  }
  
  return scene;
};

export const createChoice = async (supabase: any, choice: any, sceneId: string) => {
  const choiceId = crypto.randomUUID();
  
  await supabase.from('Choice').insert({
    id: choiceId,
    text: choice.label || choice.text,
    description: choice.description,
    consequence: choice.consequence,
    loadingMessage: choice.next_scene_waiting_loader_message || choice.loadingMessage,
    isPersonalized: choice.is_personalized || false,
    isCustomChoice: choice.is_custom_choice || false,
    isItemRelated: choice.is_item_related || false,
    sceneId: sceneId
  });
  
  return choiceId;
};

export const createChoiceItemRelation = async (supabase: any, choiceId: string, itemId: string, consumed: boolean = false) => {
  const relationId = crypto.randomUUID();
  
  await supabase.from('ChoiceItem').insert({
    id: relationId,
    choiceId: choiceId,
    itemId: itemId,
    consumed: consumed
  });
  
  return relationId;
};

export const addItemToScene = async (supabase: any, sceneId: string, itemId: string, isHidden: boolean = false) => {
  const sceneItemId = crypto.randomUUID();
  
  await supabase.from('SceneItem').insert({
    id: sceneItemId,
    sceneId: sceneId,
    itemId: itemId,
    isHidden: isHidden
  });
  
  return sceneItemId;
};

export const addItemToInventory = async (supabase: any, gameSaveId: string, itemId: string, quantity: number = 1) => {
  const inventoryItemId = crypto.randomUUID();
  const durability = await getDurabilityForItem(supabase, itemId);
  
  await supabase.from('InventoryItem').insert({
    id: inventoryItemId,
    gameSaveId: gameSaveId,
    itemId: itemId,
    quantity: quantity,
    isEquipped: false,
    remainingUses: durability,
    isBroken: false
  });
  
  return inventoryItemId;
};

export const getDurabilityForItem = async (supabase: any, itemId: string): Promise<number | null> => {
  const { data, error } = await supabase
    .from('Item')
    .select('durability')
    .eq('id', itemId)
    .single();
    
  if (error || !data) return null;
  return data.durability;
};

export const createGameSave = async (supabase: any, userId: string, storyId: string, firstSceneId: string) => {
  const gameSaveId = crypto.randomUUID();
  
  const { data: story } = await supabase
    .from('Story')
    .select('title')
    .eq('id', storyId)
    .single();
    
  await supabase.from('GameSave').insert({
    id: gameSaveId,
    characterName: "Aventurier",
    storyId: storyId,
    userId: userId,
    currentSceneId: firstSceneId,
    progress: 1,
    name: `${story?.title || 'Histoire'} - Sauvegarde`,
    lastPlayed: new Date().toISOString()
  });
  
  return gameSaveId;
};

export const createDialogue = async (supabase: any, dialogue: any, sceneId: string, order: number) => {
  const dialogueId = crypto.randomUUID();
  
  await supabase.from('Dialogue').insert({
    id: dialogueId,
    speaker: dialogue.speaker,
    text: dialogue.text,
    emotion: dialogue.emotion || "neutral",
    sceneId: sceneId,
    order: order
  });
  
  return dialogueId;
};