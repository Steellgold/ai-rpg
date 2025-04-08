"use client"

import { useState, useRef, useEffect, ReactElement, HTMLAttributes, cloneElement, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Baby, Loader, Lock, LockOpen, Maximize, Pickaxe, User, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Component } from "@/lib/types";
import { MultiSelectCombobox } from "../ui/multi-select-combobox";
import { genreIds } from "@/lib/genres-ids";
import { useTranslations } from "next-intl";
import { generateStory } from "@/lib/actions/generate.ai.action";
import { useSession } from "@/lib/hooks/use-session";
import { useSearchParams } from "next/navigation";
import { StoryLanguageSelector } from "./story-language-selector";
import { StoryLanguage } from "@prisma/client";
import { calculateTotalCreditCost, getDefaultFeatures } from "@/lib/features/generation-features";
import { EnhancedSendButton } from "./textarea.send-button";
import { useCredits } from "@/lib/hooks/use-credits";
import { ShineBorder } from "../ui/magicui/shine-border";
import { CustomScrollbar } from "../ui/scrollbar";
import { useToast } from "@/lib/hooks/use-toast";
import Link from "next/link";
import { suggestions } from "@/lib/suggestions";
import { useDraft } from "@/lib/hooks/use-draft";

export const AiTextarea: Component<HTMLAttributes<HTMLDivElement>> = ({ className }): ReactElement => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const { user, loading: isLoggingIn, signIn } = useSession();
  const { credits, loading: isCreditsFetching } = useCredits();

  const [prompt, setPrompt, clearPrompt] = useDraft({
    key: "ai-textarea-prompt",
    initialValue: searchParams.get("prompt") || "",
    storageType: "localStorage",
    debounceTime: 500
  });
    
  const [isInputValid, setIsInputValid] = useState(false);

  const [childMode, setChildMode] = useState(false);
  const [publicMode, setPublicMode] = useState(true);
  const [items, setItems] = useState(false);
  const [storyLanguage, setStoryLanguage] = useState<StoryLanguage>("auto");

  const [isGenerating, setIsGenerating] = useState(false);

  const initialGenres = searchParams.get("genres")?.split(",") || [];
  const [genresStr, setGenresStr, clearGenres] = useDraft({
    key: "ai-textarea-genres",
    initialValue: JSON.stringify(initialGenres),
    storageType: "localStorage",
    debounceTime: 500
  });

  const selectedGenres = useMemo(() => {
    try {
      return JSON.parse(genresStr) as string[];
    } catch {
      return [];
    }
  }, [genresStr]);

  const setSelectedGenres = (genres: string[]) => setGenresStr(JSON.stringify(genres));
  
  const u = useTranslations("Utils");
  const t = useTranslations("Pages.New");

  const activeFeatures = getDefaultFeatures(childMode, items);

  const calculateCreditCost = useMemo(() => {
    const baseFeatureCost = calculateTotalCreditCost(activeFeatures);
    const lengthCost = Math.floor(prompt.length / 500);

    return baseFeatureCost + lengthCost;
  }, [activeFeatures, prompt.length]);

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    textarea.style.height = "auto"
    textarea.style.height = `${textarea.scrollHeight}px`

    if (textarea.scrollHeight > 500) {
      textarea.style.height = "500px"
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

    const { error } = await generateStory(
      prompt, 
      selectedGenres || [], 
      childMode, 
      items,
      storyLanguage,
      calculateCreditCost
    );

    if (error) {
      setIsGenerating(false);
      toast({ title: "Your request failed", description: error, variant: "destructive" });
      return;
    }
  }

  const handleClear = () => {
    clearPrompt();
    clearGenres();
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  return (
    <div className="flex flex-col items-center w-full gap-4">
      <CustomScrollbar />
      <div className={cn("relative border-2 rounded-xl overflow-hidden w-full", className, {
        "bg-[#070910] border border-[#173a8940]": true
      })}>
        <ShineBorder className="rounded-xl" shineColor={["#2744ad", "#6c83d6", "#0d288a"]} />
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={isGenerating}
          placeholder={
            "The story takes place in the kingdom of Kiyomitsugawa, a prosperous nation bathed by sacred rivers, with landscapes adorned with thousand-year-old cherry trees and majestic mountains. This kingdom, imbued with ser...."
          }
          className={cn(
            "w-full resize-none py-4 px-4 outline-none bg-transparent text-gray-200 placeholder:text-gray-500 min-h-[110px] custom-scrollbar", {
              "animate-pulse italic text-gray-400": isGenerating
            }
          )}
        />
        
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center flex-wrap gap-1.5">
            <Button
              size={"default"}
              variant="ghost"
              className="!border rounded-full transition-opacity h-8 px-3 cursor-pointer"
              disabled={isGenerating}
              asChild
            >
              <Link href={"/editor"}>
                {t("AiTextarea.OpenEditor")}
                <Maximize className="h-4 w-4 text-gray-200" />
              </Link>
            </Button>
          </div>

          <p className={cn("text-sm", {
            "text-red-400": prompt.length >= 2500,
            "text-gray-400": prompt.length < 2500
          })}>
            {prompt.length} / 2500
          </p>
        </div>

        <div className="flex items-center justify-between p-2">
          <div className="flex items-center flex-wrap gap-1.5">
            {(selectedGenres.length > 0 || prompt.length > 0) && (!isGenerating || isInputValid) && (
              <Button
                size={"toolIcon"}
                variant="ghost"
                className="!border border-red-400/20 rounded-full transition-opacity hover:bg-red-400/10 cursor-pointer"
                onClick={handleClear}
                disabled={isGenerating}
              >
                <X className="h-4 w-4 text-red-400" />
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
            
            <StoryLanguageSelector
              selectedLanguage={storyLanguage}
              onLanguageChange={setStoryLanguage}
            />

            <Button
              size={"toolIcon"}
              variant="ghost"
              className={cn(
                "!border rounded-full transition-opacity cursor-pointer", {
                  "border-teal-400/20 hover:bg-teal-400/10": childMode,
                  "border-gray-400/20 hover:bg-gray-400/10": !childMode
                }
              )}
              onClick={() => setChildMode(!childMode)}
              disabled={isGenerating}
            >
              <Baby className={cn("h-4 w-4", { "text-teal-400": childMode, "text-gray-200": !childMode })} />
            </Button>

            <Button
              size={"toolIcon"}
              variant="ghost"
              className={cn(
                "!border rounded-full transition-opacity cursor-pointer", {
                  "w-8": true,
                  "border-teal-400/20 hover:bg-teal-400/10": items,
                  "border-gray-400/20 hover:bg-gray-400/10": !items
                }
              )}
              onClick={() => setItems(!items)}
              disabled={isGenerating || isLoggingIn}
            >
              <Pickaxe className={cn("h-4 w-4", {
                "text-teal-400": items,
                "text-gray-200": !items
              })} />
            </Button>

            <Button
              size={"default"}
              variant="ghost"
              className={cn(
                "!border rounded-full transition-opacity !h-8 cursor-pointer px-2.5", {
                  "border-teal-400/20 hover:bg-teal-400/10": publicMode,
                  "border-gray-400/20 hover:bg-gray-400/10": !publicMode,
                  "border-red-400/20 hover:bg-red-400/10": !publicMode,
                }
              )}
              onClick={() => setPublicMode(!publicMode)}
              disabled={isGenerating || isLoggingIn}
            >
              {cloneElement(
                publicMode
                  ? <LockOpen className="h-4 w-4" />
                  : <Lock className="h-4 w-4" />, {
                    className: cn("h-4 w-4", {
                      "text-teal-400": publicMode,
                      "text-red-200": !publicMode,
                      "text-gray-200": !publicMode
                    })
              })}

              <span className={cn("text-sm", {
                "text-teal-400": publicMode,
                "text-red-200": !publicMode,
                "text-gray-200": !publicMode
              })}>
                {publicMode ? t("AiTextarea.PublicModeOn") : t("AiTextarea.PublicModeOff")}
              </span>
            </Button>
          </div>

          <div className="flex items-center">
            {user ? (
              <>
                <EnhancedSendButton
                  isGenerating={isGenerating}
                  isInputValid={isInputValid}
                  handleSend={handleSend}
                  activeFeatures={activeFeatures}
                  promptLength={prompt.length}
                  generateText={t("AiTextarea.Generate")}
                  calculateCreditCost={calculateCreditCost}
                  creditHave={
                    isCreditsFetching ? 0 : credits
                  }
                />
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

      <div>
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
    </div>
  )
}