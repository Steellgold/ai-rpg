"use client"

import { useRef, useEffect, ReactElement, HTMLAttributes, useState } from "react";
import { cn } from "@/lib/utils";
import { Component } from "@/lib/types/component";
import { ShineBorder } from "../ui/magicui/shine-border";
import { CustomScrollbar } from "../ui/scrollbar";
import { useTranslations } from "next-intl";
import { Button } from "../ui/button";
import { ArrowUp, Baby, Brain, Cog, GitBranch, GitMerge, Loader, Mic, MicOff, PersonStanding, PocketKnife, Store, Users, Zap, ZapOff } from "lucide-react";
import { useDraft } from "@/lib/hooks/use-draft";
import { useRecordVoice } from "@/lib/hooks/use-record";
import { useSession } from "@/lib/hooks/use-session";
import { FeatureToggle } from "./feature.button";
import { useShineColors } from "@/lib/hooks/use-shine-colors";
import { Badge } from "../ui/badge";
import { estimateStoryCost } from "@imagine/prompts/index"
import { FeatureCard } from "./feature.card";
import { Plugin, PluginMarketplace } from "../dialogs/plugin-marketplace.dialog";

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

  const [moreSettings, setMoreSettings] = useState<boolean>(false);

  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [selectedPlugin, setSelectedPlugin] = useState<string[]>([]);
  const [isPluginMarketplaceOpen, setIsPluginMarketplaceOpen] = useState(false);

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
    <>
      <PluginMarketplace
        open={isPluginMarketplaceOpen}
        onOpenChange={setIsPluginMarketplaceOpen}
        onAdd={(plugin) => {
          setPlugins((prev) => [...prev, plugin]);
          setSelectedPlugin((prev) => [...prev, plugin.id]);
        }}
        onRemove={(pluginId) => {
          setPlugins((prev) => prev.filter(plugin => plugin.id !== pluginId));
          setSelectedPlugin((prev) => prev.filter(id => id !== pluginId));
        }}
        selectedPlugins={selectedPlugin}
      />

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

            <div className={cn("flex items-center justify-between p-2 mx-2", { "mb-2": !moreSettings })}>
              <div className="flex items-center flex-wrap gap-1.5">
                <Button
                  size={plugins.length > 0 ? "toolText" : "toolIcon"}
                  onClick={() => setIsPluginMarketplaceOpen(true)} disabled={isGenerating}
                  className={cn(
                    "bg-gradient-to-tl",
                    "from-blue-700 via-blue-950 to-blue-950",
                    "hover:from-blue-600 hover:via-blue-800 hover:to-blue-900"
                  )}
                >
                  <Store />
                  {plugins.length > 0 && <span className="text-sm">{plugins.length}</span>}
                </Button>

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

                <Button
                  size="toolIcon"
                  variant="ghost"
                  className={cn("border-2 border-gray-500/20 hover:bg-gray-500/10", {
                    "bg-blue-600/10 hover:bg-blue-600/10 text-blue-400": moreSettings
                  })}
                  onClick={() => setMoreSettings(!moreSettings)}
                  disabled={isGenerating}
                >
                  <Cog className={cn("transition-all", {
                    "rotate-180 text-blue-400": moreSettings
                  })} />
                </Button>
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

                <Badge>
                  {estimateStoryCost({
                    hasItems: true,
                    textLength: prompt.length,
                    withImages: false,
                    characters: {
                      brainstorming: betterCharacters,
                      principal: 3,
                      secondary: 1
                    }
                  })}
                </Badge>
              </div>
            </div>

            <div className={cn("p-2 mx-2 mb-2", {
              "hidden": !moreSettings,
              "opacity-50": isGenerating
            })}>
              <div className="flex flex-col gap-2">
                <FeatureCard
                  title="Tools.NarrativeArcs.On"
                  description={t("Tools.NarrativeArcs.Description")}
                  text="Tools.EnableTool"
                  icons={{ Icon: GitMerge, IconToggled: GitBranch }}
                  isActive={multipleArcs}
                  onClick={() => setMultipleArcs(!multipleArcs)}
                  activeColor="text-purple-400"
                  activeBorderColor="border-purple-400/20"
                  activeHoverColor="hover:bg-purple-400/10"
                  loadingColor="text-purple-300"
                  isLoading={isGenerating}
                  className={cn({"bg-purple-500/10 border-purple-400/20": multipleArcs})}
                />
                
                <FeatureCard
                  title="Tools.Items.On"
                  description={t("Tools.Items.Description")}
                  text="Tools.EnableTool"
                  icons={{ Icon: PocketKnife, IconToggled: Users }}
                  isActive={withItems}
                  onClick={() => setWithItems(!withItems)}
                  activeColor="text-indigo-400"
                  activeBorderColor="border-indigo-400/20"
                  activeHoverColor="hover:bg-indigo-400/10"
                  loadingColor="text-indigo-300"
                  isLoading={isGenerating}
                  className={cn({"bg-indigo-500/10 border-indigo-400/20": withItems})}
                />
                
                <FeatureCard
                  title="Tools.Characters.On"
                  description={t("Tools.Characters.Description")}
                  text="Tools.EnableTool"
                  icons={{ Icon: Users, IconToggled: Brain }}
                  isActive={betterCharacters}
                  onClick={() => setBetterCharacters(!betterCharacters)}
                  activeColor="text-orange-400"
                  activeBorderColor="border-orange-400/20"
                  activeHoverColor="hover:bg-orange-400/10"
                  loadingColor="text-orange-300"
                  isLoading={isGenerating}
                  className={cn({"bg-orange-500/10 border-orange-400/20": betterCharacters})}
                />

                <FeatureCard
                  title="Tools.ConflictGenerator.On"
                  description={t("Tools.ConflictGenerator.Description")}
                  text="Tools.EnableTool"
                  icons={{ Icon: ZapOff, IconToggled: Zap }}
                  isActive={withConflicts}
                  onClick={() => setWithConflicts(!withConflicts)}
                  activeColor="text-red-500"
                  activeBorderColor="border-red-500/20"
                  activeHoverColor="hover:bg-red-500/10"
                  loadingColor="text-red-300"
                  isLoading={isGenerating}
                  className={cn({"bg-red-500/10 border-red-500/20": withConflicts})}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}