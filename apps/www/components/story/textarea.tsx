"use client"

import { useRef, useEffect, ReactElement, HTMLAttributes, useState } from "react";
import { cn } from "@/lib/utils";
import { Component } from "@/lib/types/component";
import { ShineBorder } from "../ui/magicui/shine-border";
import { CustomScrollbar } from "../ui/scrollbar";
import { useTranslations } from "next-intl";
import { Button } from "../ui/button";
import { ArrowUp, Baby, Loader } from "lucide-react";
import { useDraft } from "@/lib/hooks/use-draft";

export const AiTextarea: Component<HTMLAttributes<HTMLDivElement>> = ({ className }): ReactElement => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [isInputValid, setIsInputValid] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const [forChildren, setForChildren] = useState<boolean>(false);

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
          <ShineBorder className="rounded-xl border-2" shineColor={
            forChildren
              ? ["#fff", "#0f9b8e", "#0f9b8e", "#fff"]
              : ["#fff", "#1447e6", "#193cb8", "#fff"]
          } />
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
              <Button
                size={"toolText"}
                variant={"ghost"}
                onClick={() => setForChildren(!forChildren)}
                className={cn(
                  "!border rounded-full cursor-pointer", {
                    "border-teal-400/20 hover:bg-teal-400/10": forChildren,
                    "border-gray-400/20 hover:bg-gray-400/10": !forChildren
                  }
                )}
              >
                <Baby className={cn("h-4 w-4", { "text-teal-400": forChildren, "text-gray-200": !forChildren })} />
                <span className={cn({ "text-teal-400": forChildren, "text-gray-200": !forChildren })}>
                  {t("Tools.Children.On")}
                </span>
              </Button>
            </div>

            <Button
              size={isInputValid ? "toolText" : "toolIcon"}
              className={cn("transition-all", {
                "bg-blue-700 hover:bg-blue-800": !forChildren,
                "bg-teal-700 hover:bg-teal-800": forChildren
              })}
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