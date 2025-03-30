"use client"

import type { Session, User } from "@supabase/supabase-js"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"

export const useSession = () => {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
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
      discord: async () => {
        setLoading(true)
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "discord",
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