import { Component } from "@/lib/types/component";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { FeatureToggle } from "./feature.button";

type FeatureCardProps = {
  onClick: () => void;

  title: string;
  description: string;

  text: string;
  
  icons: {
    Icon: LucideIcon;
    IconToggled?: LucideIcon;
  };

  isActive: boolean;
  
  activeColor: string;
  activeBorderColor: string;
  activeHoverColor: string;

  loadingColor?: string;
  isLoading?: boolean;

  className?: string;
};

export const FeatureCard: Component<FeatureCardProps> = ({
    title, description, text,
    icons: { Icon, IconToggled },
    isActive, onClick, activeColor, activeBorderColor, activeHoverColor,
    loadingColor, isLoading,
    className
}) => {
  return (
    <div className={cn("flex flex-col justify-between gap-2 border border-gray-500/20 p-2 rounded-md", className)}>
      <span className="text-sm text-gray-400">{description}</span>
      <FeatureToggle
        Icon={Icon}
        IconToggled={IconToggled}
        text={text}
        textToggled={title}
        isActive={isActive}
        onClick={onClick}
        activeColor={activeColor}
        activeBorderColor={activeBorderColor}
        activeHoverColor={activeHoverColor}
        loadingColor={loadingColor}
        className={"rounded-md"}
        disabled={isLoading}
      />
    </div>
  );
};