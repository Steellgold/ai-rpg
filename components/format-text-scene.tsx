import { type ReactNode } from "react"
import { cn } from "@/lib/utils"
import { CharacterMention } from "./character-card"
import { ItemMention } from "./item-card"
import { PageClientProps } from "@/app/(game)/[...story]/page.client"

const escapeRegExp = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const formatSceneContent = (
  content: string, 
  characters: PageClientProps["story_data"]["characters"], 
  items: any[] = [],
  loading = false
) => {
  return content.split("\n").map((paragraph, index) => {
    type Replacement = {
      start: number;
      end: number;
      type: 'character' | 'item';
      entity: any;
    }
    
    const replacements: Replacement[] = [];
    
    const sortedCharacters = [...characters].sort((a, b) => b.name.length - a.name.length);
    for (const character of sortedCharacters) {
      const nameParts = [character.name, ...character.name.split(' ')].filter(part => part.length > 1);
      
      const replacedRanges = new Set<string>();
      
      for (const namePart of nameParts) {
        const regex = new RegExp(`\\b${escapeRegExp(namePart)}\\b`, 'gi');
        let match: RegExpExecArray | null;
        
        while ((match = regex.exec(paragraph)) !== null) {
          const matchStart = match.index;
          const matchEnd = match.index + match[0].length;
          const rangeKey = `${matchStart}-${matchEnd}`;
          
          if (!replacedRanges.has(rangeKey)) {
            const overlaps = replacements.some(r => 
              (matchStart >= r.start && matchStart < r.end) || 
              (matchEnd > r.start && matchEnd <= r.end) ||
              (matchStart <= r.start && matchEnd >= r.end)
            );
            
            if (!overlaps) {
              replacements.push({
                start: matchStart,
                end: matchEnd,
                type: 'character',
                entity: character
              });
              replacedRanges.add(rangeKey);
            }
          }
        }
      }
    }
    
    if (items && items.length > 0) {
      const sortedItems = [...items].sort((a, b) => b.name.length - a.name.length);
      const replacedRanges = new Set<string>();
      
      for (const item of sortedItems) {
        const regex = new RegExp(`\\b${escapeRegExp(item.name)}\\b`, 'gi');
        let match: RegExpExecArray | null;
        
        while ((match = regex.exec(paragraph)) !== null) {
          const matchStart = match.index;
          const matchEnd = match.index + match[0].length;
          const rangeKey = `${matchStart}-${matchEnd}`;
          
          if (!replacedRanges.has(rangeKey)) {
            const overlaps = replacements.some(r => 
              (matchStart >= r.start && matchStart < r.end) || 
              (matchEnd > r.start && matchEnd <= r.end) ||
              (matchStart <= r.start && matchEnd >= r.end)
            );
            
            if (!overlaps) {
              replacements.push({
                start: matchStart,
                end: matchEnd,
                type: 'item',
                entity: item
              });
              replacedRanges.add(rangeKey);
            }
          }
        }
      }
    }
    
    replacements.sort((a, b) => a.start - b.start);
    
    const segments: ReactNode[] = [];
    let lastPos = 0;
    
    for (const replacement of replacements) {
      if (replacement.start > lastPos) {
        segments.push(paragraph.substring(lastPos, replacement.start));
      }
      
      if (replacement.type === 'character') {
        segments.push(
          <span key={`char-${replacement.entity.id}-${replacement.start}`} className="inline-flex align-middle mr-0 pr-0">
            <CharacterMention character={replacement.entity} />
          </span>
        );
      } else if (replacement.type === 'item') {
        segments.push(
          <span key={`item-${replacement.entity.id}-${replacement.start}`} className="inline-flex align-middle mr-0 pr-0">
            <ItemMention item={replacement.entity} />
          </span>
        );
      }
      
      lastPos = replacement.end;
    }
    
    if (lastPos < paragraph.length) {
      segments.push(paragraph.substring(lastPos));
    }
    
    return (
      <p key={index} className={cn({ "animate-pulse": loading })}>
        {segments.length > 0 ? segments : paragraph}
      </p>
    );
  });
}