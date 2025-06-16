"use client"

import type { Component } from "@workspace/ui/types/component"
import { Textarea } from "@workspace/ui/components/textarea"
import { Levitate } from "@workspace/ui/components/levitate"
import { Button } from "@workspace/ui/components/button"
import { ArrowUp, Type, Loader2, Images } from "lucide-react"
import { VoiceRecorder } from "../ui/voice-recorder"
import { Card } from "@workspace/ui/components/card"
import { useEffect, useRef, useState } from "react"
import { cn } from "@workspace/ui/lib/utils"
import type React from "react"
import Image from "next/image"
import { FeatureConfigDialog } from "./feature-config-dialog"
import { FeatureButton } from "./feature-button"
import { useStoryContext } from "@/contexts/story-context"
import { usePreferences } from "@/contexts/user-preferences-context"
import { useTranslations } from "next-intl"
import { ShineColors } from "@/types/color"
import { CreditsBadge } from "./credits-badge"

type StoryInputProps = {
  value?: string
  onChange?: (value: string) => void
  disabled?: boolean
}

export const StoryInput: Component<StoryInputProps> = ({
  value = "",
  onChange,
  disabled = false
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [charCount, setCharCount] = useState(0)
  const maxChars = 2500
  const t = useTranslations("Textarea")

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
      <div className={"relative rounded-xl transition-all duration-300"}>
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-gray-800/10 to-gray-900/20 backdrop-blur-sm" />

        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => {
            if (onChange && e.target.value.length <= maxChars) {
              onChange(e.target.value)
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={t("placeholder")}
          className={cn(
            "relative z-10 min-h-[150px] resize-none bg-transparent",
            "text-gray-100 placeholder:text-gray-400/70",
            "focus:ring-0 focus:outline-none",
            "text-base leading-relaxed p-4"
          )}
          disabled={disabled}
          maxLength={maxChars}
          autoFocus
        />

        <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-gray-900/20 to-transparent pointer-events-none rounded-b-xl" />
      </div>

      <div className="flex justify-between items-center mt-2 px-1">
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Type size={12} />
            <span>
              {charCount}&nbsp;/&nbsp;{maxChars}&nbsp;{t("char_count")}
            </span>
          </div>

          {/* <div className="hidden sm:flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-gray-800/50 border border-gray-700/50 rounded text-xs">Ctrl</kbd>
            <span>+</span>
            <kbd className="px-1.5 py-0.5 bg-gray-800/50 border border-gray-700/50 rounded text-xs">Enter</kbd>
            <span className="ml-1">to submit</span>
          </div> */}
        </div>

        <CreditsBadge />
      </div>
    </div>
  )
}

export const AiTextarea = () => {
  const [inputValue, setInputValue] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const t = useTranslations("Textarea")
  
  const { isFeatureEnabled } = useStoryContext();
  const { isEnabled } = usePreferences();

  const handleGenerate = () => {
    if (!inputValue.trim()) return
    setIsGenerating(true)
    setTimeout(() => setIsGenerating(false), 2000)
  }

  return (
    <div className="w-full space-y-4 relative">
      <div className="absolute inset-0 overflow-visible pointer-events-none">
        <div className="absolute -top-[55px] -right-[30px] rotate-[31deg] select-none pointer-events-none hidden lg:block">
          <Levitate orientation="diagonal" speed={0.5} disabled={!isEnabled("levitate")}>
            <Image
              src={"/assets/illustrations/dragon-body.svg"}
              alt="dragon"
              width={90}
              height={90}
            />
          </Levitate>
        </div>

        <div className="absolute top-15 -left-30 rotate-12 select-none pointer-events-none hidden lg:block">
          <Levitate speed={0.8} disabled={!isEnabled("levitate")}>
            <Image src={"/assets/illustrations/portal.svg"} alt="portal" width={200} height={200} />
          </Levitate>
        </div>

        <div className="absolute -bottom-8 -right-13 rotate-12 select-none pointer-events-none hidden lg:block">
          <Levitate disabled={!isEnabled("levitate")}>
            <Image
              src={"/assets/illustrations/potion.svg"}
              alt="potion"
              width={100}
              height={100}
            />
          </Levitate>
        </div>
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

        <div className="relative z-10 space-y-4">
          <div className="space-y-4">
            <StoryInput value={inputValue} onChange={setInputValue} disabled={isGenerating} />

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1">
                <VoiceRecorder />

                <FeatureConfigDialog featureId="images">
                  <FeatureButton
                    colors={ShineColors.red}
                    icon={Images}
                    active={isFeatureEnabled("images")}
                    color="red"
                    locked={false}
                  />
                </FeatureConfigDialog>
              </div>

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
                    <span className="text-sm">{t("generate.loading")}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{t("generate.button")}</span>
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
