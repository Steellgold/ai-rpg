"use client";

import { useState } from "react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslations } from "next-intl";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";

export type StoryLanguage = "auto" | "en" | "fr" | "es" | "it" | "de";

interface LanguageSelectorProps {
  selectedLanguage: StoryLanguage;
  onLanguageChange: (language: StoryLanguage) => void;
}

export const StoryLanguageSelector = ({ 
  selectedLanguage, 
  onLanguageChange,
}: LanguageSelectorProps) => {
  const t = useTranslations("Utils.Languages");

  const languageOptions: { value: StoryLanguage; label: string }[] = [
    { value: "auto", label: t("auto") },
    { value: "en", label: t("en") },
    { value: "fr", label: t("fr") },
    { value: "es", label: t("es") },
    { value: "it", label: t("it") },
    { value: "de", label: t("de") }
  ];

  const [selectedOption, setSelectedOption] = useState<StoryLanguage>(selectedLanguage);

  return (
    <div className={cn("flex items-center")}>
      <Select 
        value={selectedLanguage} 
        onValueChange={(value) => {
          onLanguageChange(value as StoryLanguage);
          setSelectedOption(value as StoryLanguage);
        }}
      >
        <SelectTrigger
          showChevron={false}
          className={cn(
            "w-auto rounded-full h-8 items-center justify-center",
            "focus:outline-none focus:ring-0 border-border", {
              "!w-8": selectedOption === "auto"
            }
          )}
        >
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            {selectedOption !== "auto" && <SelectValue placeholder={t("selectLanguage")} />}
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>{t("storyLanguage")}</SelectLabel>
            {languageOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};