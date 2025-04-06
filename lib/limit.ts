"use server";

import { prisma } from "@/lib/db/prisma";

export const checkMonthlyLimit = async (userId: string) => {
  const user_data = await prisma.user.findUnique({ where: { id: userId } });
  if (!user_data) throw new Error("User not found");
  
  const isPremium = user_data.premium;
  const monthlyLimit = user_data.limit_messages ?? 15;

  if (monthlyLimit <= 0) {
    throw new Error("Daily limit reached. Please try again later.");
  }
    
  if (monthlyLimit > 0) {
    await prisma.user.update({
      where: { id: userId },
      data: { limit_messages: monthlyLimit - 1 }
    });
  }

  return { isPremium, monthlyLimit };
}