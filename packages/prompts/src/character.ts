import { BackstorySchema, CharacterType } from "@imagine/schemas/character";
import { z } from "zod";

// export const getCharacterAvatarPrompt = (character: any): string => {
//   return `Create a detailed portrait in **vintage cartoon style** (1930s animation aesthetic) for a fantasy narrative RPG.

// Details:
// - Name: ${character.name}
// - Description: ${character.description}
// ${character.personality ? `- Personality: ${character.personality}` : ''}
// ${character.outfit ? `- Outfit: ${character.outfit}` : ''}
// ${character.age ? `- Age: ${character.age}` : ''}

// 🎨 Style & Visual Guidelines:
// - Head and shoulders only, centered
// - Drawn in a soft vintage cartoon style with hand-inked lines and warm, muted sepia/brown tones
// - Background: Plain or faded parchment-style, neutral and non-distracting
// - Expression should reflect the individual's personality (e.g., mysterious, bold, cheerful)
// - Use stylized proportions, classic cartoon exaggeration, and textured shading

// ❌ Do NOT include:
// - Names, text, stats, borders, numbers, or any game UI
// - Overly modern design elements or effects

// ✅ Focus:
// - Communicate the individual's identity and mood through face, posture, and outfit details
// - Keep the portrait expressive, charming, and timeless — like a magical storybook illustration

// The final result should evoke a nostalgic fantasy world through a unique, handcrafted cartoon look.`;
// };

export const getCharacterAvatarPrompt = (character: CharacterType): string => {
  const getPersonalityTraitsSummary = (traits: Partial<Record<string, number>> | undefined): string => {
    if (!traits) return '';
    
    const sortedTraits = Object.entries(traits)
      .sort(([, valueA], [, valueB]) => (valueB ?? 0) - (valueA ?? 0))
      .slice(0, 3)
      .map(([trait]) => trait.toLowerCase())
      .join(', ');
    
    return sortedTraits ? `- Personality: ${sortedTraits}` : '';
  };

  const getAbilitiesSummary = (abilities: any[] | undefined): string => {
    if (!abilities || abilities.length === 0) return '';
    
    const topAbilities = abilities
      .filter(ability => ability.proficiency && ['EXPERT', 'MASTER', 'LEGENDARY'].includes(ability.proficiency))
      .slice(0, 2)
      .map(ability => ability.name)
      .join(', ');
    
    return topAbilities ? `- Notable abilities: ${topAbilities}` : '';
  };

  const getOutfitDescription = (outfit: any): string => {
    if (!outfit) return '';
    
    return `- Outfit: ${outfit.overall_appearance}`;
  };

  return `Create a detailed portrait in **vintage cartoon style** (1930s animation aesthetic) for a fantasy narrative RPG.

Details:
- Name: ${character.name}
- Description: ${character.description}
${getPersonalityTraitsSummary(character.personality_traits)}
${getOutfitDescription(character.outfit)}
${character.age ? `- Age: ${character.age}` : ''}
${getAbilitiesSummary(character.abilities)}
${character.background?.social_class ? `- Social class: ${character.background.social_class.toLowerCase().replace('_', ' ')}` : ''}

🎨 Style & Visual Guidelines:
- Head and shoulders only, centered
- Drawn in a soft vintage cartoon style with hand-inked lines and warm, muted sepia/brown tones
- Background: Plain or faded parchment-style, neutral and non-distracting
- Expression should reflect the individual's personality (e.g., mysterious, bold, cheerful)
- Use stylized proportions, classic cartoon exaggeration, and textured shading

❌ Do NOT include:
- Names, text, stats, borders, numbers, or any game UI
- Overly modern design elements or effects

✅ Focus:
- Communicate the individual's identity and mood through face, posture, and outfit details
- Keep the portrait expressive, charming, and timeless — like a magical storybook illustration

The final result should evoke a nostalgic fantasy world through a unique, handcrafted cartoon look.`;
};

export const generateCharacterSheet = (character: CharacterType): string => {
  const formatBulletList = (items: string[] | undefined): string => {
    if (!items || items.length === 0) return 'None';
    return items.map(item => `- ${item}`).join('\n');
  };

  const formatPersonalityTraits = (traits: Partial<Record<string, number>> | undefined): string => {
    if (!traits) return 'No personality traits defined.';
    
    return Object.entries(traits)
      .sort(([, valueA], [, valueB]) => (valueB ?? 0) - (valueA ?? 0))
      .map(([trait, value]) => `- ${trait.toLowerCase()}: ${value}/10`)
      .join('\n');
  };

  const formatBackstoryEvents = (backstory: z.infer<typeof BackstorySchema> | undefined): string => {
    if (!backstory || !backstory.key_events || backstory.key_events.length === 0) {
      return 'No backstory events recorded.';
    }
    
    return backstory.key_events
      .sort((a, b) => (a.age || 0) - (b.age || 0))
      .map(event => {
        const ageText = event.age !== undefined ? ` (Age ${event.age})` : '';
        return `- **${event.title}**${ageText}: ${event.description} [Impact: ${event.impact.toLowerCase().replace('_', ' ')}]`;
      })
      .join('\n');
  };

  return `# ${character.name}
## Basic Information
**Age:** ${character.age}
**Description:** ${character.description}
**Social Class:** ${character.background?.social_class?.toLowerCase().replace('_', ' ') || 'Unknown'}
**Occupation:** ${character.background?.occupation || 'Unknown'}

## Personality
${formatPersonalityTraits(character.personality_traits)}

## Background
**Education:** ${character.background?.education?.toLowerCase().replace('_', ' ') || 'Unknown'}
**Hometown:** ${character.background?.hometown || 'Unknown'}
**Family Status:** ${character.background?.family_status?.toLowerCase().replace('_', ' ') || 'Unknown'}
**Upbringing:** ${character.background?.upbringing || 'No details available.'}
**Cultural Heritage:** ${character.background?.cultural_heritage || 'Unknown'}
**Religion:** ${character.background?.religion || 'None specified'}

## Abilities
${character.abilities ? character.abilities.map(ability => 
  `- **${ability.name}** (${ability.type.toLowerCase()}, ${ability.proficiency.toLowerCase()}): ${ability.description}`
).join('\n') : 'No abilities recorded.'}

## Motivations
${character.motivations ? 
  `**Primary:** ${character.motivations.primary_type.toLowerCase()} (${character.motivations.intensity.toLowerCase()})
**Description:** ${character.motivations.description}
**Driving Force:** ${character.motivations.driving_force}` 
  : 'No motivations recorded.'}

## Flaws
${character.flaws ? character.flaws.map(flaw => 
  `- **${flaw.name}** (${flaw.type.toLowerCase()}, ${flaw.severity.toLowerCase()}): ${flaw.description}`
).join('\n') : 'No flaws recorded.'}

## Relationships
${character.relationships ? character.relationships.map(rel => 
  `- **${rel.person}** (${rel.type.toLowerCase()}, ${rel.intensity.toLowerCase()}): ${rel.description}`
).join('\n') : 'No relationships recorded.'}

## Backstory Summary
${character.backstory?.summary || 'No backstory available.'}

### Key Events
${formatBackstoryEvents(character.backstory)}

## Appearance
**Style:** ${character.outfit?.style.toLowerCase().replace('_', ' ') || 'Not specified'}
**Overall Appearance:** ${character.outfit?.overall_appearance || 'No details available.'}

### Notable Features
${formatBulletList(character.outfit?.distinguishing_features)}
`;
};

export const getCharacterPersonalityDescription = (character: CharacterType): string => {
  if (!character.personality_traits) return "Personality details not available.";
  
  const highTraits = Object.entries(character.personality_traits as Partial<Record<string, number>>)
    .filter(([, value]) => (value ?? 0) >= 7)
    .map(([trait]) => trait.toLowerCase());
    
  const lowTraits = Object.entries(character.personality_traits as Partial<Record<string, number>>)
    .filter(([, value]) => (value ?? 0) <= 3)
    .map(([trait]) => trait.toLowerCase());
  
  let description = `${character.name} is `;
  
  if (highTraits.length > 0) {
    description += `notably ${highTraits.join(', ')}`;
    
    if (lowTraits.length > 0) {
      description += ` but tends to be less ${lowTraits.join(', ')}`;
    }
  } else if (lowTraits.length > 0) {
    description += `generally not very ${lowTraits.join(', ')}`;
  } else {
    description += `a person of balanced traits with no extreme personality characteristics`;
  }
  
  if (character.backstory?.key_events && character.backstory.key_events.length > 0) {
    const significantEvent = character.backstory.key_events.find(
      event => ["MAJOR", "LIFE_CHANGING", "DEFINING"].includes(event.impact)
    );
    
    if (significantEvent) {
      description += `. Their personality was significantly shaped by ${significantEvent.title.toLowerCase()}, which ${significantEvent.description.toLowerCase()}`;
    }
  }
  
  if (character.motivations) {
    description += `. They are primarily motivated by ${character.motivations.primary_type.toLowerCase()}, which manifests as ${character.motivations.description.toLowerCase()}`;
  }
  
  if (character.flaws && character.flaws.length > 0) {
    const majorFlaw = character.flaws.find(
      flaw => ["SERIOUS", "SEVERE", "DEBILITATING"].includes(flaw.severity)
    );
    
    if (majorFlaw) {
      description += `. Their most significant personal challenge is ${majorFlaw.name.toLowerCase()}, which ${majorFlaw.description.toLowerCase()}`;
    }
  }
  
  return description + '.';
};