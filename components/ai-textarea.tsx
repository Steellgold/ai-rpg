"use client"

import { useState, useRef, ChangeEvent } from "react"
import { Button } from "@/components/ui/button"
import { PaperclipIcon, ArrowUpIcon } from "lucide-react"

export const AiTextarea = () => {
  const [inputValue, setInputValue] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value)
  }

  const handleGenerate = () => {
    if (!inputValue.trim()) return

    setIsGenerating(true)
    setTimeout(() => {
      setIsGenerating(false)
    }, 1500)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion)
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }

  const suggestions = [
    "Generate Character Backstory",
    "Create Fantasy Kingdom",
    "Design Magic System",
    "Craft Epic Quest",
    "Build Villain Origin",
  ]

  return (
    <div className="mt-3">
      <div className="relative border border-gray-700 rounded-lg p-4 mb-6">
        <div className="relative w-full">
          <textarea
            ref={textareaRef}
            placeholder="Describe your character or world..."
            value={inputValue}
            onChange={handleInputChange}
            className="w-full min-h-[100px] bg-transparent border-0 focus:ring-0 focus:outline-none p-0 text-white placeholder-gray-500 resize-none"
            style={{ outline: "none", boxShadow: "none" }}
          />
        </div>

        <div className="flex justify-end items-center gap-2 mt-2">
          <Button
            onClick={handleGenerate}
            disabled={!inputValue.trim() || isGenerating}
            className={`rounded-full bg-white text-black hover:bg-gray-200 ${!inputValue.trim() ? "opacity-50" : ""}`}
            size="icon"
          >
            {isGenerating ? (
              <div className="h-5 w-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <ArrowUpIcon className="h-5 w-5" />
            )}
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        {suggestions.map((suggestion, index) => (
          <Button
            key={index}
            variant="outline"
            className="bg-transparent border border-gray-700 text-white hover:bg-gray-800 rounded-full text-sm"
            onClick={() => handleSuggestionClick(suggestion)}
          >
            {suggestion}
          </Button>
        ))}
      </div>
    </div>
  )
}

