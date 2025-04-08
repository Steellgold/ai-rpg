"use server"

import { redirect } from "next/navigation"
import { prisma } from "@/lib/db/prisma"
import { createClient } from "@/lib/supabase/server"
import { env } from "@/lib/env/env"
import { checkCredits } from "@/lib/credits"
import { updateGameSave, recordChoice, addItemToInventory } from "@/lib/services/game-save.service"

export const generateNextScene = async (
  storyId: string,
  sceneId: string,
  choiceId?: string,
  customText?: string,
  diceRoll: number = 3,
  gameSaveId?: string,
  activeItemId?: string
) => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const user_data = await prisma.user.findUnique({ where: { id: user.id } });
  if (!user_data) throw new Error("User not found");

  const { credits } = await checkCredits(user.id);

  const story = await prisma.story.findUnique({
    where: { id: storyId },
    select: { hasItems: true }
  });

  if (!story) throw new Error("Story not found");

  if (gameSaveId && choiceId) {
    try {
      await recordChoice(gameSaveId, sceneId, choiceId);
    } catch (error) {
      console.error("Error recording choice:", error);
    }
  }

  try {
    let activeItem = null;
    if (activeItemId && gameSaveId) {
      const { data: inventoryItemData } = await supabase
        .from('InventoryItem')
        .select('*, item:itemId(*)')
        .eq('gameSaveId', gameSaveId)
        .eq('itemId', activeItemId)
        .single();

      if (inventoryItemData) {
        activeItem = inventoryItemData.item;
      }
    }

    const body: any = {
      storyId,
      sceneId,
      diceRoll,
      gameSaveId,
      userId: user.id,
      items: story.hasItems,
      activeItem
    };

    if (choiceId) body.choiceId = choiceId;
    if (customText) body.customText = customText;

    const { data, error } = await supabase.functions.invoke("generate-scene-story-v3", { body });

    if (!data || error) {
      throw new Error(error?.message || "Error generating next scene");
    }

    if (data.success && data.scene?.new_items && gameSaveId) {
      for (const newItem of data.scene.new_items) {
        if (newItem.is_hidden) continue;

        const itemRecord = await prisma.item.findFirst({
          where: {
            name: newItem.name,
            storyId: storyId
          }
        });
        
        if (itemRecord) {
          try {
            await addItemToInventory(gameSaveId, itemRecord.id);
          } catch (itemError) {
            console.error(`Error adding item ${newItem.name} to inventory:`, itemError);
          }
        }
      }
    }

    if (data.success && gameSaveId && data.scene?.id) {
      try {
        await updateGameSave(gameSaveId, {
          currentSceneId: data.scene.id,
          progress: (story.hasItems && data.scene?.progress) || undefined
        });
      } catch (saveError) {
        console.error("Error updating game save:", saveError);
      }
    }

    if (data.success) {
      const redirectUrl = gameSaveId 
        ? `${env.NEXT_PUBLIC_BASE_URL}/${gameSaveId}/${data.scene.id}`
        : `${env.NEXT_PUBLIC_BASE_URL}/${storyId}/${data.scene.id}`;
        
      redirect(redirectUrl);
    }
  } catch (error) {
    console.error("Error generating next scene:", error);
    throw error;
  }
};