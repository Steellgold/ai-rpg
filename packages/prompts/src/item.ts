import { ItemPromptOptions } from "./types";

export function getItemImagePrompt(options: ItemPromptOptions): string {
  const { itemName, itemType, description = '' } = options;
  
  return `Create a high-quality 2D illustration of a ${itemType.toLowerCase()} named "${itemName}" for a fantasy narrative RPG, in a **vintage cartoon style** reminiscent of 1930s animation.

${description ? `Description: ${description}` : ''}

🎨 Style & Visual Guidelines:
- Artistic style: Hand-drawn cartoon with clean black linework, soft sepia tones, and subtle paper texture
- Background: Aged parchment with light wear, faint stains, and slightly torn edges — no harsh contrasts
- Materials and surfaces should feel worn, magical, or medieval, depending on the item
- Use gentle shading and textured coloring, no gradients or modern effects
- Give the object a stylized, slightly exaggerated fantasy look — like something out of a magical world

❌ Do NOT include:
- Any text, names, stats, numbers, symbols, labels, or UI elements
- Any modern design elements or polished/glossy effects

✅ Focus:
- Center the object clearly on the canvas
- Showcase its purpose and magical/fantasy nature through visual storytelling alone
- Make the object readable at a glance with rich textures and expressive silhouette

The result should look like a magical illustration from an old fantasy book or animated film.`;
}