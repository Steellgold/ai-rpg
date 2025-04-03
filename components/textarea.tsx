"use client"

import { useState, useRef, useEffect, ReactElement, HTMLAttributes, cloneElement } from "react"
import { Button } from "@/components/ui/button"
import { ArrowUpIcon, Crown, Eclipse, Loader } from "lucide-react"
import { cn } from "@/lib/utils"
import { Component } from "@/lib/types"
import { MultiSelectCombobox } from "./ui/multi-select-combobox"
import { genreIds } from "@/lib/genres-ids"
import { useTranslations } from "next-intl";
import { FaDragon } from "react-icons/fa";

type Suggestion = {
  label: string;
  prompt: string;
  icon: ReactElement;
};

const suggestions: Suggestion[] = [
  { label: "Suggestions.TKOK.Label", prompt: "Suggestions.TKOK.Prompt", icon: <Crown className="h-4 w-4 text-gray-200" /> },
  { label: "Suggestions.TSC.Label", prompt: "Suggestions.TSC.Prompt", icon: <Eclipse className="h-4 w-4 text-gray-200" /> },
  { label: "Suggestions.DRA.Label", prompt: "Suggestions.DRA.Prompt", icon: <FaDragon className="h-4 w-4 text-gray-200" /> },
];

export const AiTextarea: Component<HTMLAttributes<HTMLDivElement>> = ({ className }): ReactElement => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [prompt, setPrompt] = useState("");
  const [isInputValid, setIsInputValid] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  
  const u = useTranslations("Utils");
  const t = useTranslations("Pages.New");

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    textarea.style.height = "auto"
    textarea.style.height = `${textarea.scrollHeight}px`

    if (textarea.scrollHeight > 300) {
      textarea.style.height = "300px"
      textarea.style.overflowY = "auto"
    } else {
      textarea.style.overflowY = "hidden"
    }
  }, [prompt]);

  useEffect(() => {
    const validatePrompt = (text: string) => {
      const hasMinLength = text.trim().length > 10;
      const hasNoFlood = !/(.)\1{10,}/.test(text);
      const hasMinWords = text.trim().split(/\s+/).length >= 3;
      return hasMinLength && hasNoFlood && hasMinWords;
    };
    
    setIsInputValid(validatePrompt(prompt));
  }, [prompt]);


  const handleSend = () => {
    if (prompt.trim()) {
      setIsGenerating(true);
      if (textareaRef.current) textareaRef.current.style.height = "auto";
    }
  }

  return (
    <div className="flex flex-col items-center w-full gap-4">
      <div className={cn("rounded-xl overflow-hidden w-full bg-[#070910] border border-[#173a8940]", className)}>
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={isGenerating}
          placeholder={
            "The story takes place in the kingdom of Kiyomitsugawa, a prosperous nation bathed by sacred rivers, with landscapes adorned with thousand-year-old cherry trees and majestic mountains. This kingdom, imbued with ser...."
          }
          rows={1}
          className={cn(
            "w-full resize-none py-4 px-4 outline-none bg-transparent text-gray-200 placeholder:text-gray-500 min-h-[86px]", {
              "animate-pulse italic text-gray-400": isGenerating
            }
          )}
        />

        <div className="flex items-center justify-between p-2 border-t border-[#173a8940]">
          <div className="flex items-center">
            <MultiSelectCombobox
              options={genreIds.map((genre) => ({
                label: `${u("Genres." + genre + ".label")}`,
                description: `${u("Genres." + genre + ".description")}`,
                value: genre,
              }))}
              selected={selectedGenres}
              onChange={setSelectedGenres}
              placeholder={t("AiTextarea.SelectGenres")}
              emptyMessage={t("AiTextarea.NoGenresFound")}
              disabled={isGenerating}
            />
          </div>

          <div className="flex items-center">
            <Button
              onClick={handleSend}
              disabled={!isInputValid}
              className={cn(
                "rounded-full transition-opacity",
                !isInputValid ? "opacity-50 cursor-not-allowed" : "opacity-100", {
                  "!h-8 !w-8": !isInputValid || isGenerating,
                  "!h-8 !px-4": isInputValid && !isGenerating,
                  // 
                  "bg-blue-600 hover:bg-blue-500": !isGenerating || isInputValid,
                  "cursor-not-allowed bg-blue-600/50 hover:bg-blue-600/50": isGenerating,
                }
              )}
            >
              {isGenerating ? (
                <Loader className="animate-spin h-4 w-4 text-gray-400" />
              ) : (
                <ArrowUpIcon className="h-4 w-4 text-gray-200" />
              )}
              {isInputValid && !isGenerating && <span className="text-white">New story</span>}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-row items-center justify-between w-full gap-2">
        {suggestions.map((suggestion, index) => (
          <Button
            key={index}
            className="bg-[#1a254f30] text-gray-200 border border-[#173a8940] rounded-full px-4 h-8 flex items-center justify-center cursor-pointer transition-all hover:bg-[#1a254f40] hover:text-gray-100"
            onClick={() => setPrompt(u(suggestion.prompt))}
          >
            {cloneElement(suggestion.icon)}
            {u(suggestion.label)}
          </Button>
        ))}
      </div>
    </div>
  )
}

