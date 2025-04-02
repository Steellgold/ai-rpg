"use server"

import { redirect } from "next/navigation"
import { prisma } from "@/lib/db/prisma"
import { createClient } from "@/lib/supabase/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { serverEnv } from "@/lib/env/env.server"

const supabase = createSupabaseClient(
  serverEnv.NEXT_PUBLIC_SUPABASE_URL,
  serverEnv.SUPABASE_SERVICE_ROLE_KEY
);

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
    // const response = await fetch(
    //   `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/generate-scene`,
    //   {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
    //     },
    //     body: JSON.stringify({
    //       storyId,
    //       sceneId,
    //       choiceId,
    //       diceRoll: diceRoll || 3,
    //       gameSaveId,
    //       userId: user.id,
    //       isPremium: user_data.premium
    //     })
    //   }
    // );

    console.log("Generating next scene with params:", {
      storyId,
      sceneId,
      choiceId,
      diceRoll: diceRoll || 3,
      gameSaveId,
      userId: user.id,
      isPremium: user_data.premium
    });

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
    
    console.log("Response from Edge Function:", data);
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
    // const response = await fetch(
    //   `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/generate-scene`,
    //   {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
    //     },
    //     body: JSON.stringify({
    //       storyId,
    //       sceneId,
    //       customText,
    //       diceRoll: diceRoll || 3,
    //       gameSaveId,
    //       userId: user.id,
    //       isPremium: user_data.premium
    //     })
    //   }
    // );

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

    // if (!response.ok) {
    //   const errorData = await response.json();
    //   throw new Error(errorData.error || "Error handling custom choice");
    // }

    // const result = await response.json();
    
    // // Rediriger vers la nouvelle scène
    // if (result.redirect) {
    //   redirect(result.redirect);
    // } else {
    //   // Fallback au cas où la redirection n'est pas fournie par l'API
    //   redirect(gameSaveId ? `/${gameSaveId}/${result.scene.id}` : `/${storyId}/${result.scene.id}`);
    // }

    if (!data || error) {
      throw new Error(error?.message || "Error handling custom choice");
    }

    console.log("Response from Edge Function:", data);
    // Rediriger vers la nouvelle scène    
  } catch (error) {
    console.error("Error handling custom choice:", error);
    throw error;
  }
};