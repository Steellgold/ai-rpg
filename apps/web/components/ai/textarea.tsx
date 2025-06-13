"use client"

import type { Component } from "@workspace/ui/types/component"
import { Textarea } from "@workspace/ui/components/textarea"
import { Levitate } from "@workspace/ui/components/levitate"
import { Button } from "@workspace/ui/components/button"
import { ArrowUp, Type, Loader2 } from "lucide-react"
import { VoiceRecorder } from "../ui/voice-recorder"
import { Card } from "@workspace/ui/components/card"
import { useEffect, useRef, useState } from "react"
import { cn } from "@workspace/ui/lib/utils"
import type React from "react"
import Image from "next/image"

type StoryInputProps = {
  value?: string
  onChange?: (value: string) => void
  disabled?: boolean
}

export const StoryInput: Component<StoryInputProps> = ({ value = "", onChange, disabled = false }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [charCount, setCharCount] = useState(0)
  const maxChars = 500

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
    setCharCount(value.length)
  }, [value])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault()
    }
  }

  return (
    <div className="relative">
      <div
        className={cn(
          "relative rounded-xl border-2 transition-all duration-300",
          isFocused
            ? "border-indigo-500/50 shadow-lg shadow-indigo-500/10"
            : "border-gray-700/50 hover:border-gray-600/50",
        )}
      >
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-gray-800/30 to-gray-900/50 backdrop-blur-sm" />

        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => {
            if (onChange && e.target.value.length <= maxChars) {
              onChange(e.target.value)
            }
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder="Décrivez votre histoire... Que voulez-vous créer aujourd'hui ?"
          className={cn(
            "relative z-10 min-h-[140px] resize-none bg-transparent border-0",
            "text-gray-100 placeholder:text-gray-400/70",
            "focus:ring-0 focus:outline-none",
            "text-base leading-relaxed p-4",
            "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-600/50",
          )}
          disabled={disabled}
          autoFocus
          maxLength={maxChars}
        />

        <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-gray-900/20 to-transparent pointer-events-none rounded-b-xl" />
      </div>

      <div className="flex justify-between items-center mt-2 px-1">
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Type size={12} />
            <span>
              {charCount}&nbsp;/&nbsp;{maxChars}
            </span>
          </div>

          {/* <div className="hidden sm:flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-gray-800/50 border border-gray-700/50 rounded text-xs">Ctrl</kbd>
            <span>+</span>
            <kbd className="px-1.5 py-0.5 bg-gray-800/50 border border-gray-700/50 rounded text-xs">Enter</kbd>
            <span className="ml-1">to submit</span>
          </div> */}
        </div>

        {/* <div className="flex items-center gap-2 text-xs text-gray-400">
          <div className="flex items-center gap-1 px-2 py-1 bg-gray-800/50 border border-gray-700/50 rounded-full">
            <Image src="/assets/coin.webp" alt="AI Icon" width={22} height={22} className="w-3.5 h-3.5" />
            <span>2 credits</span>
          </div>
        </div> */}
      </div>
    </div>
  )
}

export const AiTextarea = () => {
  const [inputValue, setInputValue] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = () => {
    if (!inputValue.trim()) return
    setIsGenerating(true)
    setTimeout(() => setIsGenerating(false), 2000)
  }

  return (
    <div className="w-full space-y-4 relative">
      <div className="absolute inset-0 overflow-visible pointer-events-none">
        <div className="absolute -top-[55px] -right-[35px] rotate-[31deg] select-none pointer-events-none hidden lg:block">
          <Image
            src={"/assets/illustrations/dragon-body.svg"}
            alt="dragon"
            width={90}
            height={90}
            className="drop-shadow-lg"
          />
        </div>

        <div className="absolute top-15 -left-30 rotate-12 select-none pointer-events-none hidden lg:block">
          <Image src={"/assets/illustrations/portal.svg"} alt="portal" width={200} height={200} />
        </div>

        <Levitate>
          <Image
            src={"/assets/illustrations/potion.svg"}
            alt="potion"
            width={75}
            height={75}
            className="absolute -bottom-70 -right-11 select-none pointer-events-none hidden lg:block drop-shadow-md"
          />
        </Levitate>
      </div>

      <Card
        className={cn(
          "relative overflow-hidden border-0 p-6 z-20 rounded-xl",
          "backdrop-blur-md dark:bg-black/70"
        )}
      >
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10" />
        </div>

        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-4 left-8 w-1 h-1 bg-indigo-400/30 rounded-full animate-pulse" />
          <div className="absolute top-12 right-12 w-1 h-1 bg-purple-400/30 rounded-full animate-pulse delay-1000" />
          <div className="absolute bottom-8 left-16 w-1 h-1 bg-blue-400/30 rounded-full animate-pulse delay-2000" />
        </div>

        <div className="relative z-10 space-y-4">
          <div className="space-y-4">
            <StoryInput value={inputValue} onChange={setInputValue} disabled={isGenerating} />

            <div className="flex justify-between items-center">
              <VoiceRecorder />

              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !inputValue.trim()}
                variant={"default"}
                size={"ylcon"}
                className={cn(
                  "rounded-full text-primary-foreground shadow",
                  "bg-indigo-500/20 text-indigo-400 hover:bg-indigo-600/20 cursor-pointer",
                )}
              >
                {isGenerating ? (
                  <div className="flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin" />
                    <span className="text-sm">Generating...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Generate</span>
                    <ArrowUp
                      size={14}
                      className={cn(
                        "transition-transform duration-200",
                        "group-hover:translate-y-[-1px] group-active:translate-y-0",
                      )}
                    />
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div
          className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-indigo-500/20 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: "linear-gradient(45deg, transparent 30%, rgba(99, 102, 241, 0.1) 50%, transparent 70%)",
            backgroundSize: "200% 200%",
            animation: "gradient-shift 3s ease infinite",
          }}
        />
      </Card>

      <style>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  )
}
