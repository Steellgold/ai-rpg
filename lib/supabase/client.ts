import { createClient } from "@supabase/supabase-js"
import { clientEnv } from "@/lib/env/env.client"

export const supabase = createClient(clientEnv.NEXT_PUBLIC_SUPABASE_URL, clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY)