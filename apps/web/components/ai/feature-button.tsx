import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/components/button";
import { ShineBorder } from "@workspace/ui/components/shine-border";
import { colorClassMap } from "@/lib/colors";
import { Component } from "@workspace/ui/types/component";
import { LucideIcon } from "lucide-react";
import { COLOR } from "@/types/color";

type FeatureButtonProps = {
  colors: string | string[];
  active: boolean;
  locked: boolean;
  color: COLOR;
  icon: LucideIcon;
}

export const FeatureButton: Component<FeatureButtonProps> = ({ colors, active, locked, color, icon }) => {
  const Icon = icon;

  return (
    <Button
      variant={active ? "default" : "outline"}
      size="ycon"
      className={cn(
        "relative overflow-hidden group transition-all duration-200 cursor-pointer",
        active && colorClassMap[color].container,
        locked && "cursor-not-allowed opacity-50"
      )}
      disabled={locked}
      aria-pressed={active}
      type="button"
    >
      {active && (
        <ShineBorder
          shineColor={colors}
          borderWidth={1.5}
          duration={8}
          className={"rounded-full"}
        />
      )}

      <Icon size={16} className={cn(colorClassMap[color].icon, {
        "text-gray-200": !active
      })} />
    </Button>
  )
}