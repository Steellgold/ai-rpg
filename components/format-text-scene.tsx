import { Fragment, type ReactNode } from "react"
import { cn } from "@/lib/utils"
import { CharacterMention } from "./character-card"
import { PageClientProps } from "@/app/(game)/[story_id]/[scene_id]/page.client"

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

export const formatSceneContent = (content: string, characters: PageClientProps["story_data"]["characters"], loading = false) => {
  return content.split("\n").map((paragraph, index) => {
    const segments: (string | { character: typeof characters[0], originalText: string })[] = [paragraph];
    const sortedCharacters = [...characters].sort((a, b) => b.name.length - a.name.length);
    
    for (const character of sortedCharacters) {
      const newSegments: typeof segments = [];
      const nameParts = [character.name, ...character.name.split(' ')].filter(part => part.length > 1);
      
      for (const segment of segments) {
        if (typeof segment !== 'string') {
          newSegments.push(segment);
          continue;
        }
        
        let currentText = segment;
        let lastIndex = 0;
        let found = false;
        
        for (const namePart of nameParts) {
          const normalizedPart = escapeRegExp(namePart);
          const regex = new RegExp(`\\b${normalizedPart}\\b`, 'gi');
          
          let match;
          while ((match = regex.exec(currentText)) !== null) {
            found = true;
            if (match.index > lastIndex) {
              newSegments.push(currentText.substring(lastIndex, match.index));
            }
            
            newSegments.push({
              character,
              originalText: match[0]
            });
            
            lastIndex = match.index + match[0].length;
          }
          
          if (!found) {
            const normalizedSegment = normalizeString(currentText);
            const normalizedNamePart = normalizeString(namePart);
            
            let normIndex = normalizedSegment.indexOf(normalizedNamePart);
            
            while (normIndex !== -1) {
              const beforeChar = normIndex === 0 ? ' ' : normalizedSegment[normIndex - 1];
              const afterChar = normIndex + normalizedNamePart.length >= normalizedSegment.length 
                ? ' ' 
                : normalizedSegment[normIndex + normalizedNamePart.length];
              
              const isWordBoundaryBefore = /\W/.test(beforeChar) || beforeChar === ' ';
              const isWordBoundaryAfter = /\W/.test(afterChar) || afterChar === ' ';
              
              if (isWordBoundaryBefore && isWordBoundaryAfter) {
                found = true;
                if (normIndex > lastIndex) {
                  newSegments.push(currentText.substring(lastIndex, normIndex));
                }
                
                const originalText = currentText.substring(normIndex, normIndex + namePart.length);
                newSegments.push({
                  character,
                  originalText
                });
                
                lastIndex = normIndex + namePart.length;
              }

              normIndex = normalizedSegment.indexOf(normalizedNamePart, normIndex + 1);
            }
          }
        }
        
        if (lastIndex < currentText.length) {
          newSegments.push(currentText.substring(lastIndex));
        }
      }
      
      segments.length = 0;
      segments.push(...newSegments);
    }
    
    const renderedSegments = segments.map((segment, segmentIndex) => {
      if (typeof segment === 'string') {
        return segment;
      } else {
        return <CharacterMention 
          key={`${segment.character.id}-${segmentIndex}-${index}`} 
          character={segment.character} 
        />;
      }
    });
    
    return (
      <p key={index} className={cn("mb-4 last:mb-0", { "animate-pulse": loading })}>
        {renderedSegments}
      </p>
    );
  });
}