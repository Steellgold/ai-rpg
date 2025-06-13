"use client"

import type { Session, User } from "@supabase/supabase-js"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export const useSession = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [simplifiedUser, setSimplifiedUser] = useState<{
    id: string | null;
    name: string | null;
    display_name: string | null;
    avatar_url: string | null;
    email: string | null;
  } | null>(null);

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

      if (session) {
        setSimplifiedUser({
          id: session.user.id,
          name: session.user.user_metadata?.full_name,
          avatar_url: session.user.user_metadata.avatar_url,
          display_name: session.user.user_metadata?.custom_claims.global_name || null,
          email: session.user.email || null
        })
      } else {
        setSimplifiedUser(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return {
    session,
    user,
    simplifiedUser,
    loading,
    signIn: {
      discord: async () => {
        setLoading(true)
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "discord",
          options: {
            redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`
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