"use client"

import { useState, useRef, useEffect, ReactElement, HTMLAttributes, cloneElement } from "react"
import { Button } from "@/components/ui/button"
import { ArrowUpIcon, Baby, Crown, Eclipse, Flower, Loader, Music, TowerControl, User, X } from "lucide-react"
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
  isChild?: boolean;
};

const suggestions: Suggestion[] = [
  { label: "Suggestions.TKOK.Label", prompt: "Suggestions.TKOK.Prompt", icon: <Crown className="h-4 w-4 text-gray-200" />,
    genres: ["fantasy-medieval", "adventure", "mythology", "fantasy"], isChild: false
  },
  { label: "Suggestions.TSC.Label", prompt: "Suggestions.TSC.Prompt", icon: <Eclipse className="h-4 w-4 text-gray-200" />,
    genres: ["dark-fantasy", "mystery", "fantasy", "supernatural"], isChild: false
  },
  { label: "Suggestions.DRA.Label", prompt: "Suggestions.DRA.Prompt", icon: <FaDragon className="h-4 w-4 text-gray-200" />,
    genres: ["fantasy", "adventure", "mythology", "fantasy-medieval"], isChild: false
  },
  // Safe-for-children suggestions
  { label: "Suggestions.WG.Label", prompt: "Suggestions.WG.Prompt", icon: <Flower className="h-4 w-4 text-gray-200" />,
    genres: ["fantasy", "adventure", "family", "supernatural"], isChild: true
  },
  { label: "Suggestions.SL.Label", prompt: "Suggestions.SL.Prompt", icon: <TowerControl className="h-4 w-4 text-gray-200" />,
    genres: ["fantasy", "adventure", "family", "mystery"], isChild: true
  },
  { label: "Suggestions.AO.Label", prompt: "Suggestions.AO.Prompt", icon: <Music className="h-4 w-4 text-gray-200" />,
    genres: ["fantasy", "music", "adventure", "family"], isChild: true
  }
];

export const AiTextarea: Component<HTMLAttributes<HTMLDivElement>> = ({ className }): ReactElement => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const searchParams = useSearchParams();

  const { user, loading: isLoggingIn, signIn } = useSession();

  const [prompt, setPrompt] = useState(searchParams.get("prompt") || "");
  const [isInputValid, setIsInputValid] = useState(false);

  const [childMode, setChildMode] = useState(false);

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

    await generateHistory(prompt, selectedGenres || [], childMode);
  }

  return (
    <div className="flex flex-col items-center w-full gap-4">

{/* <div className={cn("rounded-xl overflow-hidden w-full bg-[#070910] border border-[#173a8940]", className)}>
            "w-full resize-none py-4 px-4 outline-none bg-transparent text-gray-200 placeholder:text-gray-500 min-h-[86px]", {
              "animate-pulse italic text-gray-400": isGenerating
            }

        <div className="flex items-center justify-between p-2 border-t border-[#173a8940]"> */}
      <div className={cn("rounded-xl overflow-hidden w-full", className, {
        "bg-teal-500/10 border border-teal-500/30": childMode,
        "bg-[#070910] border border-[#173a8940]": !childMode
      })}>
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
              "animate-pulse italic text-gray-400": isGenerating,
              // 
              "text-white placeholder:text-teal-100/40": childMode
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

            <Button
              size={"default"}
              variant="ghost"
              className={cn(
                "!border rounded-full transition-opacity !h-8 cursor-pointer px-2 ml-1", {
                  "!w-8": !childMode,
                  "border-emerald-400/20 hover:bg-emerald-400/10": childMode,
                  "border-gray-400/20 hover:bg-gray-400/10": !childMode
                }
              )}
              onClick={() => setChildMode(!childMode)}
              disabled={isGenerating}
            >
              <Baby className={cn("h-4 w-4", { "text-teal-400": childMode, "text-gray-200": !childMode })} />
              {childMode && (
                <span className={cn("text-sm", {
                  "text-emerald-400": childMode,
                  "text-gray-200": !childMode
                })}>
                  {t("AiTextarea.ChildModeOff")}</span>
              )}
            </Button>
          </div>

          <div className="flex items-center">
            {user ? (
              <>
                <Button
                  onClick={handleSend}
                  disabled={!isInputValid}
                  className={cn(
                    "rounded-full transition-opacity", {
                      "!h-8 !w-8": !isInputValid || isGenerating,
                      "!h-8 !px-4": isInputValid && !isGenerating,
                      "cursor-not-allowed": !isInputValid,
                      // 
                      "bg-blue-600 hover:bg-blue-500": !isGenerating || isInputValid,
                      "cursor-not-allowed bg-blue-600/50 hover:bg-blue-600/50": isGenerating,
                      // 
                      "bg-teal-400 hover:bg-teal-600 text-teal-950": (!isGenerating || isInputValid) && childMode,
                      "cursor-not-allowed bg-teal-600/50 hover:bg-teal-600/50": (isGenerating) && childMode,
                      // 
                      "text-white": !childMode
                    }
                  )}
                >
                  {isGenerating
                    ? <Loader className={cn("animate-spin h-4 w-4", { "text-white": !childMode })} />
                    : <ArrowUpIcon className={cn("h-4 w-4", { "text-white": !childMode })} />
                  }
                  {isInputValid && !isGenerating && <>New story</>}
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => signIn.discord(prompt, selectedGenres)}
                  className={cn(
                    "!h-8 !px-4 rounded-full transition-opacity",
                    isLoggingIn ? "opacity-50 cursor-not-allowed" : "opacity-100", {
                      "bg-blue-600 hover:bg-blue-600": !isLoggingIn && !childMode,
                      "cursor-not-allowed bg-blue-600/50 hover:bg-blue-600/50": isLoggingIn && !childMode,
                      // 
                      "bg-teal-600 hover:bg-teal-500": !isLoggingIn && childMode,
                      "cursor-not-allowed bg-teal-600/50 hover:bg-teal-600/50": isLoggingIn && childMode
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
        {suggestions.filter((s) => s.isChild === childMode).map((suggestion, index) => (
          <Button
            key={index}
            className={cn("border rounded-full px-4 h-8 flex items-center justify-center cursor-pointer transition-all", {
              "bg-[#1a254f30] text-gray-200 border border-[#173a8940] hover:bg-[#1a254f40] hover:text-gray-100": !childMode,
              "bg-teal-500/10 text-teal-400 border border-teal-500/30 hover:bg-teal-500/20 hover:text-teal-300": childMode
            })}
            onClick={() => {
              if (isGenerating) return;
              setPrompt(u(suggestion.prompt));
              setSelectedGenres(suggestion.genres);
            }}
          >
            {/* @ts-ignore */}
            {cloneElement(suggestion.icon, { className: childMode ? "h-4 w-4 text-teal-400" : "h-4 w-4 text-gray-200" })}
            {u(suggestion.label)}
          </Button>
        ))}
      </div>
    </div>
  )
}

