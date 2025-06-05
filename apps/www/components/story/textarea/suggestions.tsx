import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Component } from "@/lib/types/component";

interface Suggestion {
  text: string;
  category: "plot" | "character" | "setting" | "theme";
}

const SUGGESTIONS: Suggestion[] = [
  { text: "Un héros découvre un pouvoir magique caché", category: "plot" },
  { text: "Une quête pour sauver un royaume en péril", category: "plot" },
  { text: "Un mentor mystérieux guide le protagoniste", category: "character" },
  { text: "Un royaume flottant dans les nuages", category: "setting" },
  { text: "L'équilibre entre la lumière et l'ombre", category: "theme" },
];

interface SuggestionsProps {
  onSelect: (suggestion: string) => void;
  className?: string;
}

export const Suggestions: Component<SuggestionsProps> = ({ onSelect, className }) => {
  const t = useTranslations("AiTextarea.Suggestions");
  const [selectedCategory, setSelectedCategory] = useState<Suggestion["category"] | "all">("all");

  const filteredSuggestions = selectedCategory === "all" 
    ? SUGGESTIONS 
    : SUGGESTIONS.filter(s => s.category === selectedCategory);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedCategory("all")}
          className={cn(
            "rounded-full",
            selectedCategory === "all" && "bg-indigo-500/20 text-indigo-400 border-indigo-500/30"
          )}
        >
          {t("All")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedCategory("plot")}
          className={cn(
            "rounded-full",
            selectedCategory === "plot" && "bg-indigo-500/20 text-indigo-400 border-indigo-500/30"
          )}
        >
          {t("Plot")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedCategory("character")}
          className={cn(
            "rounded-full",
            selectedCategory === "character" && "bg-indigo-500/20 text-indigo-400 border-indigo-500/30"
          )}
        >
          {t("Characters")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedCategory("setting")}
          className={cn(
            "rounded-full",
            selectedCategory === "setting" && "bg-indigo-500/20 text-indigo-400 border-indigo-500/30"
          )}
        >
          {t("Setting")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedCategory("theme")}
          className={cn(
            "rounded-full",
            selectedCategory === "theme" && "bg-indigo-500/20 text-indigo-400 border-indigo-500/30"
          )}
        >
          {t("Themes")}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {filteredSuggestions.map((suggestion, index) => (
          <Button
            key={index}
            variant="ghost"
            className="justify-start text-left h-auto py-2 px-3 hover:bg-indigo-500/10"
            onClick={() => onSelect(suggestion.text)}
          >
            {suggestion.text}
          </Button>
        ))}
      </div>
    </div>
  );
} 