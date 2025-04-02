"use server"

import { generateObject } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"
import { prisma } from "@/lib/db/prisma"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { extractSceneImagePrompt, generateSceneImage, uploadImageToSupabase } from "../ai/generate.scene-image"
import { OpenAI as OpenAIClient } from "openai"

const openai_sdk = new OpenAIClient({
  apiKey: process.env.OPENAI_API_KEY
});

const characterSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().min(1).max(200),
  // 
  personality: z.string().min(1).max(200).optional(),
  outfit: z.string().min(1).max(200).optional(),
  age: z.number().int().optional(),
  background: z.string().min(1).max(200).optional(),
  abilities: z.array(z.string()).optional(),
  relationships: z.array(z.string()).optional(),
  motivations: z.string().min(1).max(200).optional(),
  flaws: z.string().min(1).max(200).optional(),
  backstory: z.string().min(1).max(200).optional()
})

export const generateHistory = async (text: string, genres?: string[]) => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const user_data = await prisma.user.findUnique({ where: { id: user.id } });
  if (!user_data) throw new Error("User not found");

  try {
    if (!text.trim() || text.length < 10) {
      throw new Error("Le texte est trop court pour être amélioré")
    }

    const prompt = `
Improve this text for a narrative game. Make it more captivating, descriptive and immersive, 
while preserving the main ideas. ${genres ? "Adapt it to the following genre(s): " + genres.join(", ") : ""}
Answer in the same language as the original text.

Text: ${text}
    `;

    const { object } = await generateObject({
      model: openai("gpt-4o"),
      schema: z.object({
        title: z.string().min(1).max(100),
        synopsis: z.string().min(1),
        goal: z.string().min(1).max(200),
        how_story_can_end: z.array(z.string()).min(1).max(5),
        principal_characters: z.array(characterSchema),
        secondary_characters: z.array(characterSchema),
        narrative_style: z.enum(["FirstPerson", "SecondPerson", "ThirdPerson"]),
        banner_image_visual_description: z.string().min(1).max(350),
        difficulty: z.enum(["Easy", "Medium", "Hard"]),
        max_story_scenes: z.number().int().min(1).max(20), // Maximum number of scenes to generate (When user arrive to the maximum, that means the story is finished)
        // Already generate the first scene for directly redirecting the user to the game after the generation
        first_scene: z.array(z.object({
          title: z.string().min(1).max(100),
          text: z.string().max(1600),
          visual_illustration_image_description: z.string().min(1).max(350),
          user_choices: z.array(z.object({
            label: z.string().min(1).max(50),
            description: z.string().min(1).max(200),
            consequence: z.string().min(1).max(200),
            next_scene_waiting_loader_message: z.string().min(1).max(200),
          })).min(4).max(4)
        }))
      }),
      prompt
    });

    const createdStory = await prisma.$transaction(async (tx) => {
      const story = await tx.story.create({
        data: {
          title: object.title,
          synopsis: object.synopsis,
          goal: object.goal,
          possibleEndings: object.how_story_can_end,
          narrativeStyle: object.narrative_style,
          max_scenes: object.max_story_scenes,
          creatorId: user_data.id,
          genre: genres || []
        }
      });
    
      await Promise.all(
        object.principal_characters.map(char => 
          tx.character.create({
            data: {
              name: char.name,
              description: char.description,
              personality: char.personality,
              outfit: char.outfit,
              age: char.age,
              background: char.background,
              abilities: char.abilities || [],
              relationships: char.relationships || [],
              motivations: char.motivations,
              flaws: char.flaws,
              backstory: char.backstory,
              isMain: true,
              storyId: story.id
            }
          })
        )
      );
    
      await Promise.all(
        object.secondary_characters.map(char => 
          tx.character.create({
            data: {
              name: char.name,
              description: char.description,
              personality: char.personality,
              outfit: char.outfit,
              age: char.age,
              background: char.background,
              abilities: char.abilities || [],
              relationships: char.relationships || [],
              motivations: char.motivations,
              flaws: char.flaws,
              backstory: char.backstory,
              isMain: false,
              storyId: story.id
            }
          })
        )
      );
    
      let createdSceneId = null;

      if (object.first_scene.length > 0) {
        const firstSceneData = object.first_scene[0];
        
        const createdScene = await tx.scene.create({
          data: {
            title: firstSceneData.title,
            content: firstSceneData.text,
            order: 1,
            storyId: story.id,
            imagePrompt: firstSceneData.visual_illustration_image_description
          }
        });
        
        createdSceneId = createdScene.id;
        
        await Promise.all(
          firstSceneData.user_choices.map(choice =>
            tx.choice.create({
              data: {
                text: choice.label,
                description: choice.description,
                consequence: choice.consequence,
                loadingMessage: choice.next_scene_waiting_loader_message,
                sceneId: createdScene.id,
              }
            })
          )
        );
      }
      
      return { story, sceneId: createdSceneId, sceneText: object.first_scene[0]?.text };
    });

    if (user_data.premium && createdStory.sceneId) {
      try {
        const imageResult = await generateSceneImage(createdStory.sceneId, createdStory.sceneText);
        console.log("Image URL:", imageResult);
      } catch (error) {
        console.error("Error generating image:", error);
      }
    }

    const { data } = await openai_sdk.images.generate({
      model: "dall-e-3",
      prompt: extractSceneImagePrompt(object.banner_image_visual_description),
      n: 1,
      size: "1792x1024",
      quality: "standard",
      style: "vivid"
    });

    if (data.length > 0) {
      const history_banner = data[0];
      const publicUrl = await uploadImageToSupabase(history_banner.url ?? "", `${createdStory.story.id}/banner`);
      if (!publicUrl) throw new Error("Failed to upload image to Supabase");

      await prisma.story.update({
        where: { id: createdStory.story.id, creatorId: user_data.id },
        data: { coverImageUrl: publicUrl, current_scene_id: createdStory.sceneId ?? "" }
      });
    }
    
    redirect(`/${createdStory.story.id}`);
  } catch (error) {
    console.error("Error generating story:", error);
    throw error
  }
}