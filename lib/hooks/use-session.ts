"use client"

import type { Session, User } from "@supabase/supabase-js"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { dayJS } from "@/lib/day-js"

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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false);

      if (session) {
        supabase.from("User").select("*").eq("id", session.user.id).then(({ data }) => {
          if (data && data.length === 0) {
            supabase.from("User").insert({
              id: session.user.id,
              email: session.user.email || "",
              updatedAt: dayJS().toISOString(),
              createdAt: dayJS().toISOString()
            })
          }
        })
      }
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