import { createBrowserClient } from "@supabase/ssr";
import { env } from "@/lib/env";
import { Database } from "./supabase";

export const createClient = () =>
  createBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );