"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/prisma";

export const checkDailyLimit = async (userId: string) => {
  const user_data = await prisma.user.findUnique({ where: { id: userId } });
  if (!user_data) throw new Error("User not found");
  
  const isPremium = user_data.premium;
  const dailyLimit = user_data.daily_limit_messages ?? 15;
  
  if (dailyLimit <= 0 && !isPremium) {
    throw new Error("Daily limit reached. Please try again later.");
  }
    
  if (dailyLimit > 0 && !isPremium) {
    await prisma.user.update({
      where: { id: userId },
      data: { daily_limit_messages: dailyLimit - 1 }
    });
  }

  return { isPremium, dailyLimit };
}