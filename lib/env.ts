import { z } from "zod";

const zEnv = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url()
});

export const env = zEnv.parse(process.env);