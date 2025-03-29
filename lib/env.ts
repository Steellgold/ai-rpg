import { z } from "zod";

const zEnv = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
  DATABASE_URL: z.string(),
});

export const env = zEnv.parse(process.env);