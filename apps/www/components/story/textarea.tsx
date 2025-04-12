"use client"

import { useRef, useEffect, ReactElement, HTMLAttributes, useState } from "react";
import { cn } from "@/lib/utils";
import { Component } from "@/lib/types/component";
import { ShineBorder } from "../ui/magicui/shine-border";
import { CustomScrollbar } from "../ui/scrollbar";
import { useTranslations } from "next-intl";
import { Button } from "../ui/button";
import { ArrowUp, Baby, Brain, GitBranch, GitMerge, Loader, Mic, MicOff, PersonStanding, PocketKnife, Users, Zap, ZapOff } from "lucide-react";
import { useDraft } from "@/lib/hooks/use-draft";
import { useRecordVoice } from "@/lib/hooks/use-record";
import { useSession } from "@/lib/hooks/use-session";
import { FeatureToggle } from "./feature.button";
import { useShineColors } from "@/lib/hooks/use-shine-colors";

export const AiTextarea: Component<HTMLAttributes<HTMLDivElement>> = ({ className }): ReactElement => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { user, loading: userLoading, signIn } = useSession();

  const { startRecording, stopRecording, text: voiceText, recording, loading: recordLoading } = useRecordVoice();

  const [isInputValid, setIsInputValid] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const [forChildren, setForChildren] = useState<boolean>(false);
  const [withItems, setWithItems] = useState<boolean>(false);
  const [betterCharacters, setBetterCharacters] = useState<boolean>(false);
  const [multipleArcs, setMultipleArcs] = useState<boolean>(false);
  const [withConflicts, setWithConflicts] = useState(false);

  const shineColors = useShineColors({ forChildren, withItems, betterCharacters, multipleArcs, withConflicts });

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

  useEffect(() => {
    if (voiceText && voiceText.trim() !== "") {
      setPrompt(currentPrompt => {
        if (currentPrompt.trim() === "") {
          return voiceText;
        } else {
          return `${currentPrompt} ${voiceText}`;
        }
      });
    }
  }, [voiceText, setPrompt]);

  const handleRecordToggle = () => {
    if (!user) return signIn.discord();

    if (recording) stopRecording();
    else startRecording();
  };

  return (
    <div className="flex flex-col items-center w-full gap-4">
      <CustomScrollbar />
      <div className="relative w-full">
        <div className={cn("relative z-20 border-2 rounded-xl overflow-hidden w-full", className, {
          "bg-[#070910] border border-[#173a8940]": true
        })}>
          <ShineBorder className="rounded-xl border-2" shineColor={shineColors} />
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
              <FeatureToggle
                Icon={PersonStanding}
                IconToggled={Baby}
                text="Tools.Children.Off"
                textToggled="Tools.Children.On"
                isActive={forChildren}
                onClick={() => setForChildren(!forChildren)}
                activeColor="text-teal-400"
                activeBorderColor="border-teal-400/20"
                activeHoverColor="hover:bg-teal-400/10"
              />

              <FeatureToggle
                Icon={PocketKnife}
                textToggled="Tools.Items.On"
                isActive={withItems}
                onClick={() => setWithItems(!withItems)}
                activeColor="text-indigo-400"
                activeBorderColor="border-indigo-400/20"
                activeHoverColor="hover:bg-indigo-400/10"
              />

              <FeatureToggle
                Icon={Users}
                IconToggled={Brain}
                textToggled="Tools.Characters.On"
                isActive={betterCharacters}
                onClick={() => setBetterCharacters(!betterCharacters)}
                activeColor="text-orange-400"
                activeBorderColor="border-orange-400/20"
                activeHoverColor="hover:bg-orange-400/10"
              />

              <FeatureToggle
                Icon={GitMerge}
                IconToggled={GitBranch}
                textToggled="Tools.NarrativeArcs.On"
                isActive={multipleArcs}
                onClick={() => setMultipleArcs(!multipleArcs)}
                activeColor="text-purple-400"
                activeBorderColor="border-purple-400/20"
                activeHoverColor="hover:bg-purple-400/10"
                loadingColor="text-purple-300"
              />
              
              <FeatureToggle
                Icon={ZapOff}
                IconToggled={Zap}
                textToggled="Tools.ConflictGenerator.On"
                isActive={withConflicts}
                onClick={() => setWithConflicts(!withConflicts)}
                activeColor="text-red-500"
                activeBorderColor="border-red-500/20"
                activeHoverColor="hover:bg-red-500/10"
                loadingColor="text-red-300"
              />
            </div>

            <div className="flex items-center gap-1">
              <FeatureToggle 
                Icon={Mic} 
                IconToggled={MicOff} 
                textToggled="Record.Stop" 
                isActive={recording} 
                onClick={handleRecordToggle} 
                disabled={isGenerating || !user || userLoading}
                activeColor="text-red-400"
                activeBorderColor="border-red-400/20"
                activeHoverColor="hover:bg-red-400/10"
                loading={recordLoading}
                loadingColor="text-gray-200"
              />

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
    </div>
  )
}