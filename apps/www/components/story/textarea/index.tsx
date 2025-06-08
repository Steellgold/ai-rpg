"use client";

import { ReactElement, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowUp } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FlickeringGrid } from "@/components/ui/magicui/flickering-grid";
import { useDraft } from "@/lib/hooks/use-draft";
import { StoryTools, StoryToolsConfig } from "../story-tool";
import { useStoryCredits } from "@/lib/hooks/use-story-credits";
import { cn } from "@/lib/utils";
import { Levitate } from "../../levitate";
import { toast } from "sonner";

import { StoryInput } from "./input";
import { VoiceRecorder } from "./voice-recorder";
import { Component } from "@/lib/types/component";

export const AiTextarea: Component<ReactElement> = () => {
  const t = useTranslations("AiTextarea");
  const [prompt, setPrompt, clearPrompt] = useDraft({
    key: "story-prompt",
    initialValue: "",
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const [toolsConfig, setToolsConfig] = useState<StoryToolsConfig>({
    forChildren: false,
    withItems: true,
    betterCharacters: true,
    multipleArcs: false,
    withConflicts: true,
  });

  const { checkAndDeductCredits, isChecking } = useStoryCredits();

  const handleGenerateStory = async () => {
    if (!prompt.trim() || isGenerating || isChecking) return;

    const hasCredits = await checkAndDeductCredits(toolsConfig);
    if (!hasCredits) {
      toast.error(t("Errors.NotEnoughCredits"));
      return;
    }

    setIsGenerating(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      clearPrompt();
    } catch (error) {
      console.error('Error generating story:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTextRecorded = (text: string) => {
    setPrompt(prev => {
      const newText = prev ? `${prev} ${text}` : text;
      return newText;
    });
  };

  return (
    <div className="w-full space-y-4 relative">
      <Card className="relative overflow-hidden border bg-[#070910] border-[#1e293b] p-4 z-10">
        <div className="absolute inset-0 z-0 opacity-40">
          <FlickeringGrid
            squareSize={3}
            gridGap={15}
            flickerChance={0.03}
            color="#3730a3"
            maxOpacity={0.15}
          />
        </div>

        <div className="relative z-10 space-y-4">
          <StoryTools config={toolsConfig} onChange={setToolsConfig} className="mb-2" />

          <div className="space-y-3">
            <StoryInput
              value={prompt}
              onChange={setPrompt}
              disabled={isGenerating}
            />

            <div className="flex justify-end items-center gap-2">
              <VoiceRecorder
                onTextRecorded={handleTextRecorded}
                disabled={isGenerating}
              />

              <Button
                variant="default"
                size="toolText"
                className={cn(
                  "rounded-full bg-indigo-500 hover:bg-indigo-600 text-white transition-all",
                  {
                    "opacity-50 cursor-not-allowed": !prompt.trim() || isGenerating || isChecking
                  }
                )}
                onClick={handleGenerateStory}
                disabled={!prompt.trim() || isGenerating || isChecking}
                aria-label={t("Send")}
              >
                {isGenerating ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <ArrowUp size={16} />
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Image
        src={"/assets/illustrations/dragon-body.svg"}
        alt="dragon"
        width={90}
        height={90}
        className="absolute -top-[55px] -right-[35px] rotate-[31deg] select-none pointer-events-none hidden lg:block"
      />

      <Image
        src={"/assets/illustrations/portal.svg"}
        alt="portal"
        width={300}
        height={300}
        className="absolute top-10 -left-45 rotate-12 select-none pointer-events-none hidden lg:block"
      />

      <Levitate>
        <Image
          src={"/assets/illustrations/potion.svg"}
          alt="potion"
          width={75}
          height={75}
          className="absolute bottom-5 -right-11 select-none pointer-events-none hidden lg:block"
        />
      </Levitate>
    </div>
  );
} 