"use client"

import { Button } from "../ui/button";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Loader, LucideIcon } from "lucide-react";
import { Component } from "@/lib/types/component";

interface FeatureToggleProps {
  Icon: LucideIcon;
  IconToggled?: LucideIcon;
  text?: string;
  textToggled?: string;
  isActive: boolean;
  onClick: () => void;
  activeColor?: string;
  inactiveColor?: string;
  activeHoverColor?: string;
  inactiveHoverColor?: string;
  activeBorderColor?: string;
  inactiveBorderColor?: string;
  translationNamespace?: string;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  loadingColor?: string;
}

export const FeatureToggle: Component<FeatureToggleProps> = ({
  Icon,
  IconToggled,
  text,
  textToggled,
  isActive,
  onClick,
  activeColor = "text-blue-400",
  inactiveColor = "text-gray-200",
  activeHoverColor = "hover:bg-blue-400/10",
  inactiveHoverColor = "hover:bg-gray-400/10",
  activeBorderColor = "border-blue-400/20",
  inactiveBorderColor = "border-gray-400/20",
  translationNamespace = "AiTextarea",
  className,
  disabled = false,
  loading = false,
  loadingColor = "text-gray-200"
}) => {
  const t = useTranslations(translationNamespace);
  const CurrentIcon = isActive && IconToggled ? IconToggled : Icon;

  const displayText = () => {
    if (isActive && textToggled) {
      return t(textToggled);
    } else if (text) {
      return t(text);
    }
    return null;
  };
  
  const textContent = displayText();

  return (
    <Button
      size={textContent ? "toolText" : "toolIcon"}
      variant="ghost"
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "!border rounded-full cursor-pointer", 
        {
          [activeBorderColor]: isActive,
          [inactiveBorderColor]: !isActive,
          [activeHoverColor]: isActive,
          [inactiveHoverColor]: !isActive,
        },
        className
      )}
    >
      {loading ? (
        <Loader className={cn("animate-spin", loadingColor)} />
      ) : (
        <CurrentIcon className={isActive ? activeColor : inactiveColor} />
      )}
      
      {textContent && (
        <span className={isActive ? activeColor : inactiveColor}>
          {textContent}
        </span>
      )}
    </Button>
  );
};