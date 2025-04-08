"use client";

import { Component } from "@/lib/types";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useState } from "react";

type DialogueProps = {
  speaker: string;
  text: string;
  emotion?: string;
  character?: any;
};

export const Dialogue: Component<DialogueProps> = ({ 
  speaker, 
  text, 
  emotion,
  character
}) => {
  const t = useTranslations("Pages.Story.Dialogue");
  const [expanded, setExpanded] = useState(false);
  
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };
  
  const getEmotionClass = (emotion?: string) => {
    const emotionMap: Record<string, string> = {
      happy: "border-yellow-500 bg-yellow-500/10 text-yellow-500",
      sad: "border-blue-500 bg-blue-500/10 text-blue-500",
      angry: "border-red-500 bg-red-500/10 text-red-500",
      surprised: "border-purple-500 bg-purple-500/10 text-purple-500",
      confused: "border-orange-500 bg-orange-500/10 text-orange-500",
      afraid: "border-teal-500 bg-teal-500/10 text-teal-500",
      neutral: "border-gray-500 bg-gray-500/10 text-gray-400"
    };
    
    return emotionMap[emotion?.toLowerCase() || "neutral"] || "border-gray-500 bg-gray-500/10 text-gray-400";
  };

  return (
    <div 
      className={cn(
        "my-4 p-4 rounded-md border",
        getEmotionClass(emotion),
        "transition-all duration-300 cursor-pointer",
        { "hover:shadow-md": !expanded }
      )}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center gap-3 mb-2">
        <Avatar className="h-8 w-8">
          {character?.imageUrl && <AvatarImage src={character.imageUrl} alt={speaker} />}
          <AvatarFallback>{getInitials(speaker)}</AvatarFallback>
        </Avatar>
        <div className="font-bold">{speaker}</div>
        {emotion && (
          <div className="text-sm opacity-80 italic">
            {t(`emotion.${emotion.toLowerCase()}`, { fallback: emotion })}
          </div>
        )}
      </div>
      <div className={cn(
        "pl-11", { "line-clamp-2": !expanded }
      )}>
        "{text}"
      </div>
    </div>
  );
};