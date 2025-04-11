"use client"

import { useRef, useEffect, ReactElement, HTMLAttributes, useState } from "react";
import { cn } from "@/lib/utils";
import { Component } from "@/lib/types/component";
import { ShineBorder } from "../ui/magicui/shine-border";
import { CustomScrollbar } from "../ui/scrollbar";
import { useTranslations } from "next-intl";
import { Button } from "../ui/button";
import { ArrowUp, Loader } from "lucide-react";
import { useDraft } from "@/lib/hooks/use-draft";

export const AiTextarea: Component<HTMLAttributes<HTMLDivElement>> = ({ className }): ReactElement => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [isInputValid, setIsInputValid] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const [prompt, setPrompt] = useDraft({
    key: "ai-textarea-prompt",
    initialValue: "",
    storageType: "localStorage",
    debounceTime: 500
  });

  const t = useTranslations("AiTextarea");

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

  return (
    <div className="flex flex-col items-center w-full gap-4">
      <CustomScrollbar />
      <div className="relative w-full">
        <div className={cn("relative z-20 border-2 rounded-xl overflow-hidden w-full", className, {
          "bg-[#070910] border border-[#173a8940]": true
        })}>
          <ShineBorder className="rounded-xl border-2" shineColor={["#fff", "#1447e6", "#193cb8", "#fff"]} />
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={t("Placeholder")}
            disabled={isGenerating}
            className={cn(
              "w-full resize-none py-5 px-5 outline-none bg-transparent text-gray-200 placeholder:text-gray-500 min-h-[110px] custom-scrollbar", {
                "animate-pulse italic text-gray-400": isGenerating
              }
            )}
          />
          
          <div className="flex items-center justify-between p-2 mx-2 mb-2">
            <div className="flex items-center flex-wrap gap-1.5">
            </div>

            <Button
              size={isInputValid ? "toolText" : "toolIcon"}
              className="bg-blue-700 hover:bg-blue-800 transition-all"
              disabled={!isInputValid || isGenerating}
              onClick={async () => {
                setIsGenerating(true);
                await new Promise((resolve) => setTimeout(resolve, 2000));
                setIsGenerating(false);
              }}
            >
              {isGenerating ? <Loader className="animate-spin" /> : <ArrowUp />}
              {isInputValid && t("Send")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}