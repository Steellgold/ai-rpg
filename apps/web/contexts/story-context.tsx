"use client"

import type React from "react"
import { createContext, useContext } from "react"
import { useStory } from "@/hooks/use-story"

type StoryContextType = ReturnType<typeof useStory>

const StoryContext = createContext<StoryContextType | null>(null)

export const StoryProvider = ({ children }: { children: React.ReactNode }) => {
  const storyHook = useStory()

  return <StoryContext.Provider value={storyHook}>{children}</StoryContext.Provider>
}

export const useStoryContext = () => {
  const context = useContext(StoryContext)
  if (!context) {
    throw new Error("useStoryContext must be used within a StoryProvider")
  }
  return context
}