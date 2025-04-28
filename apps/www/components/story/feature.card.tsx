import { Component } from "@/lib/types/component";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";

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
    title, 
    description, 
    text,
    icons: { Icon, IconToggled },
    isActive, 
    onClick, 
    activeColor, 
    activeBorderColor, 
    activeHoverColor,
    loadingColor, 
    isLoading,
    className
}) => {
  const t = useTranslations("AiTextarea");
  const CurrentIcon = isActive && IconToggled ? IconToggled : Icon;
  
  // Style de couleur pour l'état inactif - basé sur la couleur active mais désaturée
  const inactiveColorClass = activeColor.replace("400", "500/30").replace("500", "500/30");
  const inactiveBorderClass = activeBorderColor.replace("400/20", "400/5").replace("500/20", "500/5");
  
  return (
    <div 
      className={cn(
        "flex flex-col justify-between gap-2 p-3 rounded-md transition-all duration-200 cursor-pointer",
        "border hover:shadow-md",
        {
          // Styles lorsque la carte est active
          [activeBorderColor]: isActive,
          "bg-gradient-to-br from-transparent to-opacity-10": isActive,
          [`to-${activeColor.split('-')[1]}-500/10`]: isActive,
          
          // Styles lorsque la carte est inactive
          [inactiveBorderClass]: !isActive,
          "hover:border-gray-500/30": !isActive,
          "bg-gray-800/30": !isActive,
        },
        className
      )}
      onClick={!isLoading ? onClick : undefined}
    >
      <div className="flex items-start justify-between">
        <div className={cn(
          "flex items-center justify-center p-2 rounded-lg",
          {
            [`bg-${activeColor.split('-')[1]}-500/10`]: isActive,
            "bg-gray-700/30": !isActive
          }
        )}>
          <CurrentIcon className={cn("w-6 h-6", {
            [activeColor]: isActive,
            [inactiveColorClass]: !isActive
          })} />
        </div>
        
        <div className={cn(
          "text-xs font-medium px-2 py-1 rounded-full",
          {
            [`bg-${activeColor.split('-')[1]}-500/10 ${activeColor}`]: isActive,
            "bg-gray-700/30 text-gray-400": !isActive
          }
        )}>
          {isActive ? t(title) : t(text)}
        </div>
      </div>
      
      <div className="mt-2">
        <p className={cn("text-sm", {
          "text-gray-300": isActive,
          "text-gray-500": !isActive
        })}>
          {t(description)}
        </p>
      </div>
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-md">
          <div className={cn("w-6 h-6 border-2 rounded-full animate-spin", loadingColor || "border-gray-300", {
            "border-t-transparent": true
          })}></div>
        </div>
      )}
    </div>
  );
};