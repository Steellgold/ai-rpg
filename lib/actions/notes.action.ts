"use server"

import { prisma } from "@/lib/db/prisma"
import { createClient } from "@/lib/supabase/server"

export const saveNotes = async (notes: string, storyId: string, userId: string) => {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) return { success: false, error: "Failed to fetch user" }
  if (!user || user.id !== userId) return { success: false, error: "User not found" }

  try {
    await prisma.story.update({
      where: { creatorId: userId, id: storyId },
      data: { notes: notes || null }
    })

    console.log("Saving notes:", notes)
    return { success: true }
  } catch (error) {
    console.error("Error saving notes:", error)
    return { success: false, error: "Failed to save notes" }
  }
}

