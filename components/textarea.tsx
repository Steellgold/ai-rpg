"use client"

import { useState, useRef, useEffect, ReactElement, HTMLAttributes, cloneElement } from "react"
import { Button } from "@/components/ui/button"
import { ArrowUpIcon, Crown, Eclipse, Loader, User, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Component } from "@/lib/types"
import { MultiSelectCombobox } from "./ui/multi-select-combobox"
import { Genre, genreIds } from "@/lib/genres-ids"
import { useTranslations } from "next-intl";
import { FaDragon } from "react-icons/fa";
import { generateHistory } from "@/lib/actions/generate.ai.action"
import { useSession } from "@/lib/hooks/use-session"
import { useSearchParams } from "next/navigation"

type Suggestion = {
  label: string;
  prompt: string;
  icon: ReactElement;
  genres: Genre[];
};

const suggestions: Suggestion[] = [
  { label: "Suggestions.TKOK.Label", prompt: "Suggestions.TKOK.Prompt", icon: <Crown className="h-4 w-4 text-gray-200" />,
    genres: ["fantasy-medieval", "adventure", "mythology", "fantasy"]
  },
  { label: "Suggestions.TSC.Label", prompt: "Suggestions.TSC.Prompt", icon: <Eclipse className="h-4 w-4 text-gray-200" />,
    genres: ["dark-fantasy", "mystery", "fantasy", "supernatural"]
  },
  { label: "Suggestions.DRA.Label", prompt: "Suggestions.DRA.Prompt", icon: <FaDragon className="h-4 w-4 text-gray-200" />,
    genres: ["fantasy", "adventure", "mythology", "fantasy-medieval"]
  },
];

export const AiTextarea: Component<HTMLAttributes<HTMLDivElement>> = ({ className }): ReactElement => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const searchParams = useSearchParams();

  const { user, loading: isLoggingIn, signIn } = useSession();

  const [prompt, setPrompt] = useState(searchParams.get("prompt") || "");
  const [isInputValid, setIsInputValid] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<string[]>(
    searchParams.get("genres")?.split(",") || []
  );


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


  const handleSend = async () => {
    if (isGenerating) return; // Lmao
    if (isInputValid) setIsGenerating(true);

    await generateHistory(prompt, selectedGenres || []);
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
            {(selectedGenres.length > 0 || prompt.length > 0) && (!isGenerating || isInputValid) && (
              <Button
                size={"default"}
                variant="ghost"
                className="!border border-red-400/20 rounded-full transition-opacity !h-8 hover:bg-red-400/10 cursor-pointer px-2.5 mr-1"
                onClick={() => {
                  setPrompt("");
                  setSelectedGenres([]);
                  if (textareaRef.current) textareaRef.current.style.height = "auto";
                }}
                disabled={isGenerating}
              >
                <X className="h-4 w-4 text-red-400" />
                <span className="text-red-400 text-sm">{t("AiTextarea.Clear")}</span>
              </Button>
            )}

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
            {user ? (
              <>
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
                  {isGenerating
                    ? <Loader className="animate-spin h-4 w-4 text-gray-400" />
                    : <ArrowUpIcon className="h-4 w-4 text-gray-200" />
                  }
                  {isInputValid && !isGenerating && <span className="text-white">New story</span>}
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => signIn.discord(prompt, selectedGenres)}
                  className={cn(
                    "!h-8 !px-4 rounded-full transition-opacity bg-blue-600 hover:bg-blue-600",
                    isLoggingIn ? "opacity-50 cursor-not-allowed" : "opacity-100", {
                      "cursor-not-allowed bg-blue-600/50 hover:bg-blue-600/50": isLoggingIn,
                    }
                  )}
                >
                  {isLoggingIn
                    ? <Loader className="animate-spin h-4 w-4 text-gray-400" />
                    : <User className="h-4 w-4 text-gray-200" />
                  }
                  <span className="text-white">{t("AiTextarea.SignIn")}</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-row items-center justify-between w-full gap-2">
        {suggestions.map((suggestion, index) => (
          <Button
            key={index}
            className="bg-[#1a254f30] text-gray-200 border border-[#173a8940] rounded-full px-4 h-8 flex items-center justify-center cursor-pointer transition-all hover:bg-[#1a254f40] hover:text-gray-100"
            onClick={() => {
              if (isGenerating) return;
              setPrompt(u(suggestion.prompt));
              setSelectedGenres(suggestion.genres);
            }}
          >
            {cloneElement(suggestion.icon)}
            {u(suggestion.label)}
          </Button>
        ))}
      </div>
    </div>
  )
}

