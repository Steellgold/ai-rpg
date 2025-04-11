import type { Database } from "./types";
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient<Database>(
  "https://hlgbvamtpepxbrxspfax.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsZ2J2YW10cGVweGJyeHNwZmF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjYyNDkwMjksImV4cCI6MjA0MTgyNTAyOX0.SWyZMciMHP0lUwZ1sb5a3WZw2BRJxAHyfn3Bb8tG2eA"
);