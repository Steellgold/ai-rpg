"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { StickyNote, ChevronDown } from "lucide-react"
import { saveNotes } from "@/lib/actions/notes.action"
import type { Component } from "@/lib/types"
import { useTranslations } from "next-intl"

type NotesButtonProps = {
  notes: string
  storyId: string
  userId: string
}

export const NotesButton: Component<NotesButtonProps> = ({ notes: ogNotes, storyId, userId }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [notes, setNotes] = useState(ogNotes || "");
  const [isSaving, setIsSaving] = useState(false);
  const lastSavedNotes = useRef(ogNotes || "");
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const t = useTranslations("Pages.Story.Notes")

  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    if (notes !== lastSavedNotes.current && !isSaving) {
      saveTimeoutRef.current = setTimeout(async () => {
        setIsSaving(true)
        try {
          await saveNotes(notes, storyId, userId)
          lastSavedNotes.current = notes
        } catch (error) {
          console.error("Error saving notes:", error)
        } finally {
          setIsSaving(false)
        }
      }, 1000)
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [notes, isSaving, storyId, userId])

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-start">
      <div
        className={`rounded-lg shadow-lg transition-all duration-300 overflow-hidden ${isExpanded ? "w-80 h-64" : "w-auto h-auto"}`}
      >
        {isExpanded && (
          <div className="p-4 w-full h-full flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">
                {t("Title")}
              </h3>
              <div className="flex items-center gap-2">
                {isSaving && (
                  <span className="text-xs text-muted-foreground">
                    {t("Saving")}
                  </span>
                )}
                <Button variant="ghost" size="sm" onClick={() => setIsExpanded(false)} className="h-8 w-8 p-0">
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Textarea
              className="flex-1 resize-none"
              placeholder="Type your notes here..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        )}

        {!isExpanded && (
          <Button onClick={() => setIsExpanded(true)} className="flex items-center gap-2 px-4 py-2" variant="outline">
            <StickyNote className="h-4 w-4" />
            {t(notes.length === 0 ? "NoNotes" : "Notes", { count: notes.length === 0 ? 0 : notes.split(" ").length })}
          </Button>
        )}
      </div>
    </div>
  )
}

