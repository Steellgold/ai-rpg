"use server";

import { prisma } from "@/lib/db/prisma";

export const checkCredits = async (userId: string) => {
  const user_data = await prisma.user.findUnique({ where: { id: userId } });
  if (!user_data) throw new Error("User not found");
  
  const credits = user_data.credits || 0;

  if (credits <= 0) {
    throw new Error("No credits available. Please purchase more credits.");
  }
    
  return { credits };
}

export const deductCredits = async (
  userId: string, amount: number,
  description: string, referenceId?: string
) => {
  const user_data = await prisma.user.findUnique({ where: { id: userId } });
  if (!user_data) throw new Error("User not found");
  
  const credits = user_data.credits || 0;

  if (credits < amount) {
    throw new Error(`Insufficient credits. This action requires ${amount} credits, but you only have ${credits}.`);
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { credits: credits - amount }
  });

  const transaction = await prisma.creditTransaction.create({
    data: {
      id: crypto.randomUUID(),
      userId,
      amount: -amount,
      balanceAfter: updatedUser.credits,
      description,
      transactionType: "USAGE",
      ...(referenceId && { jobId: referenceId })
    }
  });

  return {
    success: true,
    remainingCredits: updatedUser.credits,
    transactionId: transaction.id
  };
}

export const addCredits = async (
  userId: string, amount: number,
  description: string, transactionType: "PURCHASE" | "SUBSCRIPTION" | "BONUS" | "ADMIN_ADJUST",
  paymentId?: string
) => {
  const user_data = await prisma.user.findUnique({ where: { id: userId } });
  if (!user_data) throw new Error("User not found");
  
  const credits = user_data.credits || 0;

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { credits: credits + amount }
  });

  const transaction = await prisma.creditTransaction.create({
    data: {
      id: crypto.randomUUID(),
      userId,
      amount: amount,
      balanceAfter: updatedUser.credits,
      description,
      transactionType,
      ...(paymentId && { paymentId })
    }
  });

  return {
    success: true,
    newBalance: updatedUser.credits,
    transactionId: transaction.id
  };
}