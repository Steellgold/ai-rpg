"use client";

import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslations } from "next-intl";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { StoryLanguage } from "@prisma/client";

interface LanguageSelectorProps {
  selectedLanguage: StoryLanguage;
  onLanguageChange: (language: StoryLanguage) => void;
  className?: string;
}

export const StoryLanguageSelector = ({ 
  selectedLanguage, 
  onLanguageChange,
  className
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

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Select 
        value={selectedLanguage} 
        onValueChange={(value) => onLanguageChange(value as StoryLanguage)}
      >
        <SelectTrigger className="w-[180px]">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-gray-400" />
            <SelectValue placeholder={t("selectLanguage")} />
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