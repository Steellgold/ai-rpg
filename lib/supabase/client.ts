import { createClient } from "@supabase/supabase-js"
import { clientEnv } from "@/lib/env/env.client"
import { Database } from "./database.types"

export const supabase = createClient<Database>(clientEnv.NEXT_PUBLIC_SUPABASE_URL, clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY)