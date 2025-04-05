import { type ReactNode } from "react"
import { cn } from "@/lib/utils"
import { CharacterMention } from "./character-card"
import { PageClientProps } from "@/app/(game)/[story_id]/[scene_id]/page.client"
import { ItemMention } from "./item-card"

const normalizeString = (str: string): string => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
}

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
      
      for (const namePart of nameParts) {
        const regex = new RegExp(`\\b${escapeRegExp(namePart)}\\b`, 'gi');
        let match: RegExpExecArray | null;
        
        while ((match = regex.exec(paragraph)) !== null) {
          const overlaps = replacements.some(r => 
            (match!.index >= r.start && match!.index < r.end) || 
            (match!.index + match![0].length > r.start && match!.index + match![0].length <= r.end)
          );
          
          if (!overlaps) {
            replacements.push({
              start: match.index,
              end: match.index + match[0].length,
              type: 'character',
              entity: character
            });
          }
        }
        
        const normalizedParagraph = normalizeString(paragraph);
        const normalizedPart = normalizeString(namePart);
        let normalizedIndex = 0;
        
        while ((normalizedIndex = normalizedParagraph.indexOf(normalizedPart, normalizedIndex)) !== -1) {
          const beforeChar = normalizedIndex === 0 ? ' ' : normalizedParagraph[normalizedIndex - 1];
          const afterChar = normalizedIndex + normalizedPart.length >= normalizedParagraph.length
            ? ' ' 
            : normalizedParagraph[normalizedIndex + normalizedPart.length];

          const isWordBoundaryBefore = /[\s,.;:!?()[\]{}'"<>\/\\-]/.test(beforeChar) || normalizedIndex === 0;
          const isWordBoundaryAfter = /[\s,.;:!?()[\]{}'"<>\/\\-]/.test(afterChar) || normalizedIndex + normalizedPart.length === normalizedParagraph.length;
          
          if (isWordBoundaryBefore && isWordBoundaryAfter) {
            const overlaps = replacements.some(r => 
              (normalizedIndex >= r.start && normalizedIndex < r.end) || 
              (normalizedIndex + namePart.length > r.start && normalizedIndex + namePart.length <= r.end)
            );
            
            if (!overlaps) {
              replacements.push({
                start: normalizedIndex,
                end: normalizedIndex + namePart.length,
                type: 'character',
                entity: character
              });
            }
          }
          
          normalizedIndex += normalizedPart.length;
        }
      }
    }
    
    if (items && items.length > 0) {
      const sortedItems = [...items].sort((a, b) => b.name.length - a.name.length);
      
      for (const item of sortedItems) {
        const regex = new RegExp(`\\b${escapeRegExp(item.name)}\\b`, 'gi');
        let match: RegExpExecArray | null;
        
        while ((match = regex.exec(paragraph)) !== null) {
          const overlaps = replacements.some(r => 
            (match!.index >= r.start && match!.index < r.end) || 
            (match!.index + match![0].length > r.start && match!.index + match![0].length <= r.end)
          );
          
          if (!overlaps) {
            replacements.push({
              start: match.index,
              end: match.index + match[0].length,
              type: 'item',
              entity: item
            });
          }
        }
        
        const normalizedParagraph = normalizeString(paragraph);
        const normalizedItemName = normalizeString(item.name);
        let normalizedIndex = 0;
        
        while ((normalizedIndex = normalizedParagraph.indexOf(normalizedItemName, normalizedIndex)) !== -1) {
          const beforeChar = normalizedIndex === 0 ? ' ' : normalizedParagraph[normalizedIndex - 1];
          const afterChar = normalizedIndex + normalizedItemName.length >= normalizedParagraph.length
            ? ' ' 
            : normalizedParagraph[normalizedIndex + normalizedItemName.length];

          const isWordBoundaryBefore = /[\s,.;:!?()[\]{}'"<>\/\\-]/.test(beforeChar) || normalizedIndex === 0;
          const isWordBoundaryAfter = /[\s,.;:!?()[\]{}'"<>\/\\-]/.test(afterChar) || normalizedIndex + normalizedItemName.length === normalizedParagraph.length;
          
          if (isWordBoundaryBefore && isWordBoundaryAfter) {
            const overlaps = replacements.some(r => 
              (normalizedIndex >= r.start && normalizedIndex < r.end) || 
              (normalizedIndex + item.name.length > r.start && normalizedIndex + item.name.length <= r.end)
            );
            
            if (!overlaps) {
              replacements.push({
                start: normalizedIndex,
                end: normalizedIndex + item.name.length,
                type: 'item',
                entity: item
              });
            }
          }
          
          normalizedIndex += normalizedItemName.length;
        }
      }
    }
    
    // Sort replacements by position
    replacements.sort((a, b) => {
      if (a.start !== b.start) return a.start - b.start;
      return (b.end - b.start) - (a.end - a.start);
    });
    
    const filteredReplacements: Replacement[] = [];
    let lastEnd = -1;
    
    for (const r of replacements) {
      if (r.start >= lastEnd) {
        filteredReplacements.push(r);
        lastEnd = r.end;
      }
    }
    
    const segments: ReactNode[] = [];
    let lastPos = 0;
    
    for (const replacement of filteredReplacements) {
      if (replacement.start > lastPos) {
        segments.push(paragraph.substring(lastPos, replacement.start));
      }
      
      if (replacement.type === 'character') {
        segments.push(
          <CharacterMention 
            key={`char-${replacement.entity.id}-${replacement.start}-${index}`}
            character={replacement.entity}
          />
        );
      } else if (replacement.type === 'item') {
        segments.push(
          <ItemMention 
            key={`item-${replacement.entity.id}-${replacement.start}-${index}`}
            item={replacement.entity}
          />
        );
      }
      
      lastPos = replacement.end;
    }
    
    if (lastPos < paragraph.length) {
      segments.push(paragraph.substring(lastPos));
    }
    
    return (
      <p key={index} className={cn("mb-4 last:mb-0", { "animate-pulse": loading })}>
        {segments.length > 0 ? segments : paragraph}
      </p>
    );
  });
}