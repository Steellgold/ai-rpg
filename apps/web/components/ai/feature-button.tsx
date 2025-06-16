import { COLOR } from "@/types/color";
import { Button } from "@workspace/ui/components/button";
import { ShineBorder } from "@workspace/ui/components/shine-border";
import { cn } from "@workspace/ui/lib/utils";
import { Component } from "@workspace/ui/types/component";
import { LucideIcon } from "lucide-react";

type FeatureButtonProps = {
  colors: string[];
  active?: boolean;
  locked?: boolean;
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
        active
          ? {
            "bg-gradient-to-br from-transparent to-opacity-10 shadow-sm": true,
            "bg-red-500/10 hover:bg-red-400/10": color === "red",
            "bg-orange-500/10 hover:bg-orange-400/10": color === "orange",
            "bg-amber-500/10 hover:bg-amber-400/10": color === "amber",
            "bg-yellow-500/10 hover:bg-yellow-400/10": color === "yellow",
            "bg-lime-500/10 hover:bg-lime-400/10": color === "lime",
            "bg-green-500/10 hover:bg-green-400/10": color === "green",
            "bg-emerald-500/10 hover:bg-emerald-400/10": color === "emerald",
            "bg-teal-500/10 hover:bg-teal-400/10": color === "teal",
            "bg-cyan-500/10 hover:bg-cyan-400/10": color === "cyan",
            "bg-sky-500/10 hover:bg-sky-400/10": color === "sky",
            "bg-blue-500/10 hover:bg-blue-400/10": color === "blue",
            "bg-indigo-500/10 hover:bg-indigo-400/10": color === "indigo",
            "bg-violet-500/10 hover:bg-violet-400/10": color === "violet",
            "bg-purple-500/10 hover:bg-purple-400/10": color === "purple",
            "bg-fuchsia-500/10 hover:bg-fuchsia-400/10": color === "fuchsia",
            "bg-pink-500/10 hover:bg-pink-400/10": color === "pink",
            "bg-rose-500/10 hover:bg-rose-400/10": color === "rose",
            "bg-slate-500/10 hover:bg-slate-400/10": color === "slate",
            "bg-gray-500/10 hover:bg-gray-400/10": color === "gray",
            "bg-zinc-500/10 hover:bg-zinc-400/10": color === "zinc",
            "bg-neutral-500/10 hover:bg-neutral-400/10": color === "neutral",
            "bg-stone-500/10 hover:bg-stone-400/10": color === "stone"
          } : "",
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

      <Icon size={16} className={cn({
        "text-red-300": color === "red" && active,
        "text-orange-300": color === "orange" && active,
        "text-amber-300": color === "amber" && active,
        "text-yellow-300": color === "yellow" && active,
        "text-lime-300": color === "lime" && active,
        "text-green-300": color === "green" && active,
        "text-emerald-300": color === "emerald" && active,
        "text-teal-300": color === "teal" && active,
        "text-cyan-300": color === "cyan" && active,
        "text-sky-300": color === "sky" && active,
        "text-blue-300": color === "blue" && active,
        "text-indigo-300": color === "indigo" && active,
        "text-violet-300": color === "violet" && active,
        "text-purple-300": color === "purple" && active,
        "text-fuchsia-300": color === "fuchsia" && active,
        "text-pink-300": color === "pink" && active,
        "text-rose-300": color === "rose" && active,
        "text-slate-300": color === "slate" && active,
        "text-gray-300": color === "gray" && active,
        "text-zinc-300": color === "zinc" && active,
        "text-neutral-300": color === "neutral" && active,
        "text-stone-300": color === "stone" && active
      })} />
    </Button>
  )
}