"use client";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/prisma";

export const updateGameSaveNotes = async (
  gameSaveId: string,
  notes: string
) => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  try {
    await prisma.gameSave.update({
      where: { 
        id: gameSaveId,
        userId: user.id
      },
      data: {
        notes: notes
      }
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error updating game save notes:", error);
    throw error;
  }
};