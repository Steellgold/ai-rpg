"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Pen, User } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import type { Component } from "@/lib/types";
import { useTranslations } from "next-intl";

export type ChoiceType = {
  id: string;
  text: string;
  description?: string | null;
  isCustomChoice?: boolean;
  isPersonalized?: boolean;
  consequence?: string | null;
  loadingMessage?: string | null;
};

interface ChoiceComponentProps {
  choice: ChoiceType;
  isSelected: boolean;
  isPrevious?: boolean;
  onSelect?: (choice: ChoiceType) => void;
  onCustomTextChange?: (text: string) => void;
}

export const ChoiceComponent: Component<ChoiceComponentProps> = ({
  choice,
  isSelected,
  isPrevious = false,
  onSelect,
  onCustomTextChange,
}) => {
  const [customText, setCustomText] = useState(choice.text);
  const t = useTranslations("Pages.Story");

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCustomText(e.target.value);
    if (onCustomTextChange) {
      onCustomTextChange(e.target.value);
    }
  };

  if (isPrevious) {
    return (
      <div
        className={cn(
          "bg-gray-800/",
          "border border-border",
          "rounded-md p-2 flex flex-col gap-1",
          {
            "text-emerald-500 border-emerald-500/30": isSelected,
            "hover:border-emerald-500/30": !isPrevious,
          }
        )}
      >
        <div className="flex flex-col px-1 py-1">
          <p className="font-bold text-md">
            {choice.isCustomChoice
              ? (<span className="flex items-center">{t("CustomChoice")}</span>)
              : (choice.text)
            }
          </p>

          {!choice.isCustomChoice && <p className="text-sm opacity-80">{choice.description}</p>}
          {choice.isCustomChoice && isSelected && (
            <Textarea
              placeholder={t("CustomChoicePlaceholder")}
              className="mt-2 w-full border-none focus:outline-none focus:ring-0 text-white"
              value={customText}
              disabled
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-gray-800/5 hover:bg-gray-600/5",
        "border border-border",
        "cursor-pointer",
        "rounded-md p-2 flex flex-col gap-1",
        {
          "text-emerald-500 border-emerald-500/30": isSelected,
          "hover:border-emerald-500/30": !isPrevious,
        }
      )}
      onClick={() => onSelect && onSelect(choice)}
    >
      <div className="flex flex-col px-1 py-1">
        <p
          className={cn("font-bold text-md", {
            "flex items-center": choice.isCustomChoice,
          })}
        >
          {choice.text}
          {choice.isCustomChoice && (
            <Badge
              variant="outline"
              className={cn("ml-2", {
                "border-emerald-500/30 text-emerald-500": isSelected,
              })}
            >
              <Pen size={16} />
              {t("CustomChoice")}
            </Badge>
          )}
          {choice.isPersonalized && (
            <Badge
              variant="outline"
              className={cn("ml-2", {
                "border-emerald-500/30 text-emerald-500": isSelected,
              })}
            >
              <User size={16} />
              {t("PersonalizedChoice")}
            </Badge>
          )}
        </p>

        <p className="text-sm opacity-80">{choice.description}</p>

        {choice.isCustomChoice && isSelected && (
          <Textarea
            placeholder={t("CustomChoicePlaceholder")}
            className="mt-2 w-full border-none focus:outline-none focus:ring-0 text-white"
            value={customText}
            onChange={handleTextChange}
          />
        )}
      </div>
    </div>
  );
};