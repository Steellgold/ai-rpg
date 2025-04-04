"use client"

import type { Session, User } from "@supabase/supabase-js"
import { useEffect, useState } from "react"
import { clientEnv } from "@/lib/env/env.client"
import { createClient } from "@/lib/supabase/client"

export const useSession = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false);
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return {
    session,
    user,
    loading,
    signIn: {
      discord: async (prompt?: string | null, selectedGenres?: string[] | null) => {
        setLoading(true)
        const encodedPrompt = prompt ? encodeURIComponent(prompt) : null;
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "discord",
          options: {
            redirectTo: `${clientEnv.NEXT_PUBLIC_BASE_URL}/continue` +
              (encodedPrompt ? `?prompt=${encodedPrompt}` : "") +
              (selectedGenres ? `${encodedPrompt ? "&" : "?"}genres=${selectedGenres.join(",")}` : "")
          },
        })
        return { error }
      },
    },
    signOut: async () => {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      return { error }
    },
  }
}