import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@/generated/prisma";
 
const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  socialProviders: {
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID as string, 
      clientSecret: process.env.DISCORD_CLIENT_SECRET as string, 
    }
  },
  user: {
    additionalFields: {
      credits: {
        type: "number",
        default: 5,
        description: "The number of credits the user has.",
      }
    }
  }
});