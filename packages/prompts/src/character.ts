export function getCharacterAvatarPrompt(character: any): string {
  return `Create a detailed portrait in **vintage cartoon style** (1930s animation aesthetic) for a fantasy narrative RPG.

Details:
- Name: ${character.name}
- Description: ${character.description}
${character.personality ? `- Personality: ${character.personality}` : ''}
${character.outfit ? `- Outfit: ${character.outfit}` : ''}
${character.age ? `- Age: ${character.age}` : ''}

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
}