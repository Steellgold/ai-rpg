"use client"

import { createContext, useContext, useState, useEffect, useCallback, PropsWithChildren } from "react"
import { toast } from "sonner"

export type PREFERENCES = "levitate"

interface PreferencesState {
  levitate: boolean
}

const defaultPreferences: PreferencesState = {
  levitate: true,
}

interface PreferencesContextType {
  isEnabled: (preference: PREFERENCES) => boolean
  toggle: (preference: PREFERENCES) => void
  preferences: PreferencesState
  isLoaded: boolean
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined)

const STORAGE_KEY = "user-preferences"

export const PreferencesProvider = ({ children }: PropsWithChildren) => {
  const [preferences, setPreferences] = useState<PreferencesState>(defaultPreferences)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    try {
      const savedPreferences = localStorage.getItem(STORAGE_KEY)
      if (savedPreferences) {
        const parsed = JSON.parse(savedPreferences)
        setPreferences({ ...defaultPreferences, ...parsed })
      }
    } catch (error) {
      toast.error("Failed to load user preferences from localStorage. Using default preferences.")
      console.error("Error loading user preferences:", error)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  const savePreferences = useCallback((newPreferences: PreferencesState) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newPreferences))
      setPreferences(newPreferences)
    } catch (error) {
      toast.error("Failed to save user preferences to localStorage.")
      console.error("Error saving user preferences:", error)
    }
  }, [])

  const isEnabled = useCallback(
    (preference: PREFERENCES): boolean => {
      return preferences[preference]
    },
    [preferences],
  )

  const toggle = useCallback(
    (preference: PREFERENCES) => {
      const newPreferences = {
        ...preferences,
        [preference]: !preferences[preference],
      }
      savePreferences(newPreferences)
    },
    [preferences, savePreferences],
  )

  const value: PreferencesContextType = {
    isEnabled,
    toggle,
    preferences,
    isLoaded,
  }

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
}

export const usePreferences = () => {
  const context = useContext(PreferencesContext)
  if (context === undefined) {
    throw new Error("usePreferences must be used within a PreferencesProvider")
  }
  return context
}