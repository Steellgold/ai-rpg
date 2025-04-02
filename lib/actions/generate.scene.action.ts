"use server"

import { redirect } from "next/navigation"
import { prisma } from "@/lib/db/prisma"
import { createClient } from "@/lib/supabase/server"
import { env } from "@/lib/env/env"

export const generateNextScene = async (
  storyId: string,
  sceneId: string,
  choiceId: string,
  diceRoll?: number,
  gameSaveId?: string
) => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const user_data = await prisma.user.findUnique({ where: { id: user.id } });
  if (!user_data) throw new Error("User not found");

  try {
    const { data, error } = await supabase.functions.invoke("generate-scene-story", {
      body: {
        storyId,
        sceneId,
        choiceId,
        diceRoll: diceRoll || 3,
        gameSaveId,
        userId: user.id,
        isPremium: user_data.premium
      }
    })

    if (!data || error) {
      throw new Error(error?.message || "Error generating next scene");
    }
    
    if (data.success) {
      redirect(`${env.NEXT_PUBLIC_BASE_URL}${data.redirect}`);
    }
  } catch (error) {
    console.error("Error generating next scene:", error);
    throw error;
  }
};

export const handleCustomChoice = async (
  storyId: string,
  sceneId: string,
  customText: string,
  diceRoll?: number,
  gameSaveId?: string
) => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const user_data = await prisma.user.findUnique({ where: { id: user.id } });
  if (!user_data) throw new Error("User not found");

  try {
    const { data, error } = await supabase.functions.invoke("generate-scene-story", {
      body: {
        storyId,
        sceneId,
        customText,
        diceRoll: diceRoll || 3,
        gameSaveId,
        userId: user.id,
        isPremium: user_data.premium
      }
    })

    if (!data || error) {
      throw new Error(error?.message || "Error handling custom choice");
    }

    if (data.success) {
      redirect(`${env.NEXT_PUBLIC_BASE_URL}${data.redirect}`);
    }
  } catch (error) {
    console.error("Error handling custom choice:", error);
    throw error;
  }
};