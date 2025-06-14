import { ShineBorder } from "@workspace/ui/components/shine-border";
import { cn } from "@workspace/ui/lib/utils";
import { Component } from "@workspace/ui/types/component";

type FeatureButtonProps = {
  colors: string[];
  active?: boolean;
  locked?: boolean;
  icon: React.ReactNode;
}

export const FeatureButton: Component<FeatureButtonProps> = ({ colors, active, locked, icon }) => {
  return (
    <button
      className={cn(
        "relative overflow-hidden group transition-all duration-200",
        "rounded-full p-2 flex items-center justify-center w-9 h-9",
        active
          ? "bg-gradient-to-br from-transparent to-opacity-10 shadow-sm border-gray-600"
          : "bg-gray-800/30 border-gray-700",
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
      
      {icon}
    </button>
  )
}