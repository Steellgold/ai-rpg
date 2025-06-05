"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { ArrowUp, Mic, MicOff } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { FlickeringGrid } from "@/components/ui/magicui/flickering-grid";
import { useRecordVoice } from "@/lib/hooks/use-record";
import { useDraft } from "@/lib/hooks/use-draft";
import { StoryTools, StoryToolsConfig } from "./story-tool";
import { useStoryCredits } from "@/lib/hooks/use-story-credits";
import { cn } from "@/lib/utils";
import { Levitate } from "../levitate";
import { toast } from "sonner";

export function AiTextarea() {
  const t = useTranslations("AiTextarea");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const {
    recording,
    startRecording,
    stopRecording,
    text: recordedText,
    loading: recordLoading,
    disabled: recordDisabled
  } = useRecordVoice();

  useEffect(() => {
    if (recordedText && !recordLoading) {
      setPrompt(prev => {
        const newText = prev ? `${prev} ${recordedText}` : recordedText;
        return newText;
      });
    }
  }, [recordedText, recordLoading]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [prompt]);

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

        <div className="relative z-10">
          <StoryTools config={toolsConfig} onChange={setToolsConfig} className="mb-2" />

          <div className="space-y-3">
            <Textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={t("Placeholder")}
              className="min-h-[120px] resize-none bg-gray-800/50 border-gray-700 text-gray-200 placeholder:text-gray-400 w-full overflow-hidden"
              disabled={isGenerating}
            />

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="toolText"
                className={cn("rounded-full border-gray-700 transition-all", {
                  "bg-red-500/20 text-red-400 hover:bg-red-600/20 border-red-500": recording,
                  "bg-gray-800 text-gray-400 hover:bg-gray-700": !recording && !recordLoading,
                  "cursor-not-allowed": recordDisabled || isGenerating || recordLoading
                })}
                onClick={recording ? stopRecording : startRecording}
                disabled={recordDisabled || isGenerating || recordLoading}
                aria-label={recording ? t("Record.Stop") : t("Record.Record")}
              >
                {recordLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-500 border-t-white" />
                ) : recording ? (
                  <MicOff size={16} />
                ) : (
                  <Mic size={16} />
                )}
              </Button>

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

      <Levitate speed={1.5}>
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
