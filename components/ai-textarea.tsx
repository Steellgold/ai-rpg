"use client"

import { useState, useRef, ChangeEvent, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowUpIcon, Wand2 } from "lucide-react"
import { useToast } from "@/lib/hooks/use-toast"
import { cn } from "@/lib/utils"
import { generateHistory } from "@/lib/actions/generate.ai.action"
import { MultiSelectCombobox } from "./ui/multi-select-combobox"
import { genreIds } from "@/lib/genres-ids"
import { useTranslations } from "next-intl"

export const AiTextarea = () => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [inputValue, setInputValue] = useState("");

  const [isGenerating, setIsGenerating] = useState(false);

  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  
  const { toast } = useToast();
  const g = useTranslations("Utils.Genres");
  const t = useTranslations("Pages.New");

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    adjustHeight();
  }

  const handleGenerate = async () => {
    if (!inputValue.trim() || inputValue.length < 10) return
    setIsGenerating(true);
    
    // Dispatch custom event to notify page component
    window.dispatchEvent(new CustomEvent('story-generating', { 
      detail: { isGenerating: true } 
    }));

    try {
      await generateHistory(inputValue, selectedGenres || [])

      toast({ title: "Text Enhanced", description: "The text has been successfully enhanced.", variant: "default" })
    } catch (error) {
      console.error("Error enhancing text:", error)
      toast({ title: "Error", description: "An error occurred while enhancing the text.", variant: "destructive" })
    } finally {
      setIsGenerating(false)
      
      // Notify page component that generation is complete
      window.dispatchEvent(new CustomEvent('story-generating', { 
        detail: { isGenerating: false } 
      }));
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion)
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [inputValue]);

  return (
    <div className="mt-3 w-full max-w-2xl mx-auto relative">
      {/* Loading overlay */}
      {isGenerating && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-10 rounded-lg flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-t-transparent border-white rounded-full animate-spin mb-4"></div>
          <p className="text-white font-medium">{t("AiTextarea.Loading")}</p>
        </div>
      )}
      
      <div className="relative border border-gray-700 rounded-lg p-4 mb-4">
        <textarea
          ref={textareaRef}
          placeholder={t("AiTextarea.Placeholder")}
          value={inputValue}
          onChange={handleInputChange}
          className={cn(
            "w-full h-[100px] bg-transparent border-0 focus:ring-0 focus:outline-none p-0 text-white placeholder-gray-500 resize-none", {
              "text-opacity-70": isGenerating
            }
          )}
          disabled={isGenerating}
          style={{ outline: "none", boxShadow: "none" }}
        />

        <div className="flex justify-between items-center mt-2">
          <MultiSelectCombobox
            options={genreIds.map((genre) => ({
              label: `${g(genre + ".label")}`,
              description: `${g(genre + ".description")}`,
              value: genre,
            }))}
            selected={selectedGenres}
            onChange={setSelectedGenres}
            placeholder={t("AiTextarea.SelectGenres")}
            emptyMessage={t("AiTextarea.NoGenresFound")}
            disabled={isGenerating}
          />

          <div className="flex items-center gap-1">
            <Button onClick={handleGenerate} className="rounded-full"
              disabled={
                isGenerating || !inputValue.trim() || inputValue.length < 10 || inputValue === inputValue.toLowerCase()
                || inputValue === inputValue.toUpperCase() || inputValue.split(" ").length < 2
              }
            >
              <Wand2 className="h-5 w-5" />
              {t("AiTextarea.Generate")}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        {([]).map((suggestion, index) => (
          <Button
            key={index}
            variant="outline"
            className="bg-transparent border border-gray-700 text-white hover:bg-gray-800 rounded-full text-sm"
            onClick={() => handleSuggestionClick(suggestion)}
          >
            {suggestion}
          </Button>
        ))}
      </div>
    </div>
  )
}