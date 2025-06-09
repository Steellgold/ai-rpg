import { ImagePromptOptions } from './types';

export function getSceneImagePrompt(options: ImagePromptOptions): string {
  const { description } = options;
  
  return `Create a high-quality, detailed illustration for a narrative game scene.
The scene should depict: ${description}
Style: Cinematic, detailed, high-quality digital art with proper lighting and depth.

Focus on the individuals and the environment, ensuring a captivating atmosphere.
Make sure to include elements that enhance the narrative aspect of the scene.
Consider the following details:
- Expressions and poses of the individuals
- Background elements that complement the story
- Color palette that matches the mood of the scene
- Lighting that highlights the individuals and setting
Ensure the image is visually striking and immersive, drawing the viewer into the narrative.

### IMPORTANT:
- DO NOT include ANY text, words, letters, numbers, or written elements in the image.
- DO NOT include any UI elements, buttons, menus, or overlays in the image.
- The image must be completely free of any textual content.
- The image should be suitable for a narrative game, focusing on storytelling through visuals only.
- Avoid any elements that could be considered inappropriate or offensive.
`;
}