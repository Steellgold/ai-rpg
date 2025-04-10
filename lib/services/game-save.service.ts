"use server"

import { prisma } from "@/lib/db/prisma"
import { createClient } from "@/lib/supabase/server"
import { createId } from "@paralleldrive/cuid2"

export const createGameSave = async (storyId: string, characterName: string = "Player") => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error("User not authenticated")
  }

  const story = await prisma.story.findUnique({
    where: { id: storyId },
    select: { 
      id: true, 
      current_scene_id: true,
      title: true
    }
  })

  if (!story) {
    throw new Error("Story not found")
  }

  let scene: string | null = story.current_scene_id;

  if (!scene) {
    const latestScene = await prisma.scene.findFirst({
      where: { storyId: story.id },
      orderBy: { createdAt: "desc" }
    })

    if (latestScene) {
      scene = latestScene.id
    }

    throw new Error("No scenes found for this story")
  }

  const existingSave = await prisma.gameSave.findFirst({
    where: {
      storyId: storyId,
      userId: user.id
    }
  })

  if (existingSave) {
    return {
      success: true,
      gameSaveId: existingSave.id,
      message: "Existing game save found"
    }
  }

  const gameSave = await prisma.gameSave.create({
    data: {
      id: createId(),
      characterName,
      storyId: story.id,
      userId: user.id,
      currentSceneId: scene,
      progress: 1,
      name: `${story.title} - Save`,
      lastPlayed: new Date().toISOString()
    }
  })

  return {
    success: true,
    gameSaveId: gameSave.id,
    message: "Game save created successfully"
  }
}

export const updateGameSave = async (
  gameSaveId: string, 
  updates: {
    currentSceneId?: string
    progress?: number
    notes?: string
    characterName?: string
    characterClass?: string
  }
) => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error("User not authenticated")
  }

  const existingSave = await prisma.gameSave.findFirst({
    where: {
      id: gameSaveId,
      userId: user.id
    }
  })

  if (!existingSave) {
    throw new Error("Game save not found or does not belong to the user")
  }

  const updatedSave = await prisma.gameSave.update({
    where: { id: gameSaveId },
    data: {
      ...updates,
      lastPlayed: new Date().toISOString()
    }
  })

  return {
    success: true,
    gameSaveId: updatedSave.id,
    message: "Game save updated successfully"
  }
}

export const recordChoice = async (
  gameSaveId: string,
  sceneId: string,
  choiceId: string | null
) => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error("User not authenticated")
  }

  const existingSave = await prisma.gameSave.findFirst({
    where: {
      id: gameSaveId,
      userId: user.id
    }
  })

  if (!existingSave) {
    throw new Error("Game save not found or does not belong to the user")
  }

  await prisma.saveHistory.create({
    data: {
      id: createId(),
      gameSaveId,
      sceneId,
      choiceId,
      timestamp: new Date().toISOString()
    }
  })

  return {
    success: true,
    message: "Choice recorded successfully"
  }
}

export const addItemToInventory = async (
  gameSaveId: string,
  itemId: string,
  quantity: number = 1
) => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error("User not authenticated")
  }

  const existingSave = await prisma.gameSave.findFirst({
    where: {
      id: gameSaveId,
      userId: user.id
    }
  })

  if (!existingSave) {
    throw new Error("Game save not found or does not belong to the user")
  }

  const item = await prisma.item.findUnique({
    where: { id: itemId }
  })

  if (!item) {
    throw new Error("Item not found")
  }

  const existingInventoryItem = await prisma.inventoryItem.findFirst({
    where: {
      gameSaveId,
      itemId
    }
  })

  if (existingInventoryItem) {
    await prisma.inventoryItem.update({
      where: { id: existingInventoryItem.id },
      data: {
        quantity: existingInventoryItem.quantity + quantity
      }
    })

    return {
      success: true,
      inventoryItemId: existingInventoryItem.id,
      message: "Item quantity updated in inventory"
    }
  }

  let remainingUses = null
  if (item.durability !== null) {
    remainingUses = item.durability
  }

  const inventoryItem = await prisma.inventoryItem.create({
    data: {
      id: createId(),
      gameSaveId,
      itemId,
      quantity,
      isEquipped: false,
      remainingUses,
      isBroken: false
    }
  })

  return {
    success: true,
    inventoryItemId: inventoryItem.id,
    message: "Item added to inventory successfully"
  }
}

export const getGameSaves = async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error("User not authenticated")
  }

  const gameSaves = await prisma.gameSave.findMany({
    where: {
      userId: user.id
    },
    include: {
      story: {
        select: {
          title: true,
          synopsis: true,
          coverImageUrl: true,
          max_scenes: true
        }
      }
    },
    orderBy: {
      lastPlayed: "desc"
    }
  })

  return gameSaves
}

export const getGameSave = async (gameSaveId: string) => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error("User not authenticated")
  }

  const gameSave = await prisma.gameSave.findFirst({
    where: {
      id: gameSaveId,
      userId: user.id
    },
    include: {
      story: {
        select: {
          id: true,
          title: true,
          synopsis: true,
          coverImageUrl: true,
          current_scene: true,
          max_scenes: true,
          hasItems: true
        }
      }
    }
  })

  if (!gameSave) {
    throw new Error("Game save not found or does not belong to the user")
  }

  return gameSave
}

export const getInventoryItems = async (gameSaveId: string) => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error("User not authenticated")
  }

  const inventoryItems = await prisma.inventoryItem.findMany({
    where: {
      gameSaveId,
      gameSave: {
        userId: user.id
      }
    },
    include: {
      item: true
    }
  })

  return inventoryItems
}

export const equipItem = async (inventoryItemId: string, shouldEquip: boolean) => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error("User not authenticated")
  }

  const inventoryItem = await prisma.inventoryItem.findFirst({
    where: {
      id: inventoryItemId,
      gameSave: {
        userId: user.id
      }
    }
  })

  if (!inventoryItem) {
    throw new Error("Inventory item not found or does not belong to user")
  }

  if (shouldEquip) {
    const item = await prisma.inventoryItem.findUnique({
      where: { id: inventoryItemId },
      include: { item: true }
    });
  
    if (!item) {
      throw new Error("Item not found")
    }

    const isEquipmentType = ["WEAPON", "ARMOR"].includes(item.item.type)

    if (isEquipmentType) {
      await prisma.inventoryItem.updateMany({
        where: {
          gameSaveId: inventoryItem.gameSaveId,
          item: {
            type: item.item.type
          },
          id: {
            not: inventoryItemId
          },
          isEquipped: true
        },
        data: {
          isEquipped: false
        }
      })
    }
  }

  await prisma.inventoryItem.update({
    where: { id: inventoryItemId },
    data: {
      isEquipped: shouldEquip
    }
  })

  return {
    success: true,
    isEquipped: shouldEquip
  }
}