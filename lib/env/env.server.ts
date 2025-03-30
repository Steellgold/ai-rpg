import { z } from "zod"
import { clientEnv } from "./env.client"

const serverEnvSchema = z.object({
  ...Object.keys(clientEnv).reduce((acc, key) => ({ ...acc, [key]: z.string() }), {}),
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url(),
})

export const serverEnv = {
  ...clientEnv,
  DATABASE_URL: process.env.DATABASE_URL || "",
  DIRECT_URL: process.env.DIRECT_URL || "",
}

if (typeof window === "undefined") {
  try {
    serverEnvSchema.parse(serverEnv)
  } catch (error) {
    console.error("❌ Invalid server environment variables:", error)
  }
}

