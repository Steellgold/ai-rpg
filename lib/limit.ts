"use server";

import { prisma } from "@/lib/db/prisma";

export const checkCredits = async (userId: string) => {
  const user_data = await prisma.user.findUnique({ where: { id: userId } });
  if (!user_data) throw new Error("User not found");
  
  const isPremium = user_data.subscription_status === "active";
  const credits = user_data.credits || 0;

  if (credits <= 0) {
    throw new Error("No credits available. Please purchase more credits.");
  }
    
  return { isPremium, credits };
}