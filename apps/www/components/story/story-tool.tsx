"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Users, BookOpen, Swords, ShoppingBag, Baby, ChevronDown, ChevronUp, Coins } from "lucide-react";
import { cn } from "@/lib/utils";
import { ShineBorder } from "../ui/magicui/shine-border";
import { Component } from "@/lib/types/component";
import { useStoryCredits } from "@/lib/hooks/use-story-credits";
import { toast } from "sonner";

export type StoryToolsConfig = {
  forChildren: boolean;
  withItems: boolean;
  betterCharacters: boolean;
  multipleArcs: boolean;
  withConflicts: boolean;
};

type StoryToolsProps = {
  config: StoryToolsConfig;
  onChange: (config: StoryToolsConfig) => void;
  className?: string;
  locked?: boolean;
};

const getToolShineColors = (toolType: keyof StoryToolsConfig): string[] => {
  const colorMaps = {
    forChildren: ["#0f9b8e", "#14b8a6", "#0d9488"],
    withItems: ["#4f46e5", "#6366f1", "#5b21b6"],
    betterCharacters: ["#f97316", "#fb923c", "#ea580c"],
    multipleArcs: ["#c27aff", "#a855f7", "#9333ea"],
    withConflicts: ["#ef4444", "#f87171", "#dc2626"],
  };

  return colorMaps[toolType];
};

export const StoryTools: Component<StoryToolsProps> = ({ config, onChange, className, locked }) => {
  const t = useTranslations("AiTextarea");
  const [expanded, setExpanded] = useState(false);
  const { calculateTotalCost, hasEnoughCredits } = useStoryCredits();

  const toggleFeature = (feature: keyof StoryToolsConfig) => {
    if (locked) return;
    
    const newConfig = { ...config, [feature]: !config[feature] };
    
    if (!config[feature] && !hasEnoughCredits(newConfig)) {
      toast.error(t("Errors.NotEnoughCredits"));
      return;
    }
    
    onChange(newConfig);
  };

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const totalCost = calculateTotalCost(config);

  const renderTool = (
    icon: React.ReactNode,
    active: boolean,
    onClick: () => void,
    tooltipKey: keyof StoryToolsConfig,
    isExpanded: boolean
  ) => {
    const tooltipLabels = {
      forChildren: "Children",
      withItems: "Items",
      betterCharacters: "Characters",
      multipleArcs: "NarrativeArcs",
      withConflicts: "ConflictGenerator",
    };

    const key = tooltipLabels[tooltipKey];
    const label = active ? t(`Tools.${key}.On`) : t(`Tools.${key}.Off`);
    const toolShineColors = getToolShineColors(tooltipKey);

    const bgColorClasses = {
      forChildren: "bg-teal-500/10",
      withItems: "bg-indigo-500/10",
      betterCharacters: "bg-orange-500/10",
      multipleArcs: "bg-purple-500/10",
      withConflicts: "bg-red-500/10",
    };

    const iconColorClasses = {
      forChildren: "text-teal-400",
      withItems: "text-indigo-400",
      betterCharacters: "text-orange-400",
      multipleArcs: "text-purple-400",
      withConflicts: "text-red-400",
    };

    return (
      <div className="relative group">
        <button
          className={cn(
            "relative overflow-hidden group transition-all duration-200",
            "border hover:shadow-md",
            isExpanded
              ? "rounded-lg p-4 h-32 w-full flex flex-col items-center justify-between"
              : "rounded-md p-2 flex items-center justify-center w-10 h-10",
            active
              ? "bg-gradient-to-br from-transparent to-opacity-10 shadow-sm border-gray-600"
              : "bg-gray-800/30 border-gray-700",
            locked && "cursor-not-allowed opacity-50"
          )}
          disabled={locked}
          aria-label={label}
          aria-pressed={active}
          aria-expanded={isExpanded}
          type="button"
          onClick={onClick}
        >
          {active && (
            <ShineBorder
              shineColor={toolShineColors}
              borderWidth={1.5}
              duration={8}
              className={cn(isExpanded ? "rounded-lg" : "rounded-md")}
            />
          )}

          {isExpanded ? (
            <>
              <div className={cn(
                "flex items-center justify-center rounded-lg w-12 h-12 mb-2",
                active ? bgColorClasses[tooltipKey] : "bg-gray-700/30"
              )}>
                <div className={cn(
                  "transition-colors",
                  active ? iconColorClasses[tooltipKey] : "text-gray-500"
                )}>
                  {icon}
                </div>
              </div>

              <div className="flex items-start justify-center h-8">
                <span className={cn(
                  "text-xs font-medium text-center leading-tight px-1",
                  active ? "text-gray-200" : "text-gray-500"
                )}>
                  {label}
                </span>
              </div>
            </>
          ) : (
            <div className={cn(
              active ? iconColorClasses[tooltipKey] : "text-gray-500"
            )}>
              {icon}
            </div>
          )}
        </button>
      </div>
    );
  };

  return (
    <div className={cn("w-full transition-all duration-300", className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-300">
            {t("Tools.Title")}
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors",
            totalCost > 0 
              ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" 
              : "bg-gray-800 text-gray-500 border border-gray-700"
          )}>
            <Coins size={12} />
            <span>{t("Tools.Credits", { cost: totalCost })}</span>
          </div>
          
          <button
            onClick={toggleExpanded}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-200 transition-colors"
            disabled={locked}
          >
            {expanded ? (
              <>
                <span>{t("Tools.Collapse")}</span>
                <ChevronUp size={14} />
              </>
            ) : (
              <>
                <span>{t("Tools.Expand")}</span>
                <ChevronDown size={14} />
              </>
            )}
          </button>
        </div>
      </div>

      <div className={cn(
        "transition-all duration-300",
        expanded
          ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 items-stretch"
          : "flex items-center gap-2 justify-start"
      )}>
        {renderTool(
          <Baby size={expanded ? 24 : 16} />,
          config.forChildren,
          () => toggleFeature("forChildren"),
          "forChildren",
          expanded
        )}

        {renderTool(
          <ShoppingBag size={expanded ? 24 : 16} />,
          config.withItems,
          () => toggleFeature("withItems"),
          "withItems",
          expanded
        )}

        {renderTool(
          <Users size={expanded ? 24 : 16} />,
          config.betterCharacters,
          () => toggleFeature("betterCharacters"),
          "betterCharacters",
          expanded
        )}

        {renderTool(
          <BookOpen size={expanded ? 24 : 16} />,
          config.multipleArcs,
          () => toggleFeature("multipleArcs"),
          "multipleArcs",
          expanded
        )}

        {renderTool(
          <Swords size={expanded ? 24 : 16} />,
          config.withConflicts,
          () => toggleFeature("withConflicts"),
          "withConflicts",
          expanded
        )}
      </div>
    </div>
  );
};