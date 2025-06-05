import { useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Component } from "@/lib/types/component";

interface StoryInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export const StoryInput: Component<StoryInputProps> = ({ value, onChange, disabled, className }) => {
  const t = useTranslations("AiTextarea");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  return (
    <Textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={t("Placeholder")}
      className={cn(
        "min-h-[120px] resize-none bg-gray-800/50 border-gray-700 text-gray-200 placeholder:text-gray-400 w-full overflow-hidden",
        className
      )}
      disabled={disabled}
    />
  );
} 