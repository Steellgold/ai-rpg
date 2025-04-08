"use server"

import { createClient } from "@/lib/supabase/server";
import { prisma } from "../db/prisma";
import { serverEnv } from "@/lib/env/env.server";
import OpenAI from "openai";
import { uploadImageToSupabase } from "@/lib/ai/generate.scene-image";
import { checkCredits } from "@/lib/credits"

const openai = new OpenAI({
  apiKey: serverEnv.OPENAI_API_KEY,
});

export const useItem = async (itemId: string, inventoryItemId: string) => {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const user_data = await prisma.user.findUnique({ where: { id: user.id } });
  if (!user_data) throw new Error("User not found");

  const { credits } = await checkCredits(user.id);
  if (credits <= 0) {
    throw new Error("No credits available. Please purchase more credits.");
  }

  try {
    const inventoryItem = await prisma.inventoryItem.findUnique({
      where: { id: inventoryItemId },
      include: {
        item: true
      }
    });

    if (!inventoryItem) {
      throw new Error("Item not found in inventory");
    }

    if (inventoryItem.isBroken) {
      throw new Error("This item is broken and cannot be used");
    }

    const item = inventoryItem.item;
    
    if (item.durability !== null) {
      const currentUses = inventoryItem.remainingUses ?? item.durability;
      const newRemainingUses = currentUses - 1;
      const isBroken = newRemainingUses <= 0;
      
      await prisma.inventoryItem.update({
        where: { id: inventoryItemId },
        data: {
          remainingUses: Math.max(0, newRemainingUses),
          isBroken: isBroken
        }
      });
      
      if (isBroken) {
        if (user_data?.subscription_id == "active" && !item.brokenImageUrl) {
          try {
            const imageResponse = await openai.images.generate({
              model: "dall-e-3",
              prompt: `Create a high-quality, detailed illustration of a broken, damaged ${item.type.toLowerCase()} for a narrative game. 
              The item is: ${item.name}
              Description: ${item.description}
              
              Style: Detailed, high-quality digital art showing the item in a broken, unusable state.
              The item should appear damaged, cracked, or otherwise visibly broken.
              Make the broken item stand out against a simple background.
              
              ### IMPORTANT:
              - Focus on showing the item in a clearly damaged state
              - The image should focus solely on the broken item itself
              - The item should be centrally positioned and well-lit
              - Avoid any elements that could be considered inappropriate or offensive`,
              n: 1,
              size: "1024x1024",
              quality: "standard",
              style: "vivid"
            });
            
            if (imageResponse.data.length > 0) {
              const brokenItemImage = imageResponse.data[0];
              const brokenItemUrl = await uploadImageToSupabase(brokenItemImage.url ?? "", `${item.storyId}/items/${item.id}_broken`);
              
              if (brokenItemUrl) {
                await prisma.item.update({
                  where: { id: item.id },
                  data: {
                    brokenImageUrl: brokenItemUrl
                  }
                });
              }
            }
          } catch (itemImageError) {
            console.error(`Error generating broken item image:`, itemImageError);
          }
        }
      }
    }
    
    return { success: true, isBroken: inventoryItem.isBroken };
  } catch (error: any) {
    console.error("Error using item:", error);
    return { success: false, error: error.message };
  }
}