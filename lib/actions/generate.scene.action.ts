"use server"

import { generateObject } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"
import { prisma } from "@/lib/db/prisma"
import { createClient } from "@/lib/supabase/server"
import { generateSceneImage } from "../ai/generate.scene-image"
import { redirect } from "next/navigation"

const choiceSchema = z.object({
  label: z.string().min(1).max(50),
  description: z.string().min(1).max(200),
  consequence: z.string().min(1).max(200),
  next_scene_waiting_loader_message: z.string().min(1).max(200),
  impact_level: z.number().int().min(1).max(6),
  is_personalized: z.boolean().default(false),
  is_custom_choice: z.boolean().default(false)
});

export const generateNextScene = async (
  storyId: string,
  sceneId: string,
  choiceId: string,
  diceRoll?: number,
  gameSaveId?: string
) => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const user_data = await prisma.user.findUnique({ where: { id: user.id } });
  if (!user_data) throw new Error("User not found");

  try {
    const story = await prisma.story.findUnique({
      where: { id: storyId },
      include: {
        scenes: {
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        characters: true
      }
    });
    
    if (!story) throw new Error("Story not found");
    
    const currentScene = await prisma.scene.findUnique({
      where: { id: sceneId },
      include: {
        choices: true
      }
    });
    
    if (!currentScene) throw new Error("Current scene not found");
    
    const selectedChoice = currentScene.choices.find(c => c.id === choiceId);
    if (!selectedChoice) throw new Error("Selected choice not found");

    const sceneHistory = await prisma.scene.findMany({
      where: {
        storyId: story.id,
        id: { not: currentScene.id },
        order: { lt: currentScene.order }
      },
      orderBy: { order: 'asc' },
      include: {
        choices: true
      },
      take: 5
    });
    
    const powerLevel = diceRoll || 3;

    const historyContext = sceneHistory.map(scene => 
      `Scene: ${scene.title}\n${scene.content}\nSelected Choice: ${scene.choices.find(c => c.id === scene.selected_choice_id)?.text || "No choice selected"}`
    ).join("\n\n");

    const prompt = `
You are the narrator of an interactive text-based role-playing game. Based on the following information, 
generate the next scene in the story.

You must respect the language, tone, and style of the story. If the story is in French, respond in French.

## HISTORY
Title: ${story.title}
Synopsis: ${story.synopsis}
Objetive: ${story.goal}
Possible endings: ${story.possibleEndings.join(", ")}
Narrative style: ${story.narrativeStyle}
Genre(s): ${story.genre.join(", ")}

## CHARACTERS (Main)
${story.characters.filter(c => c.isMain).map(char => 
`- Name: ${char.name}
  Description: ${char.description}
  Personality: ${char.personality || "Not defined"}
  Outfit: ${char.outfit || "Not defined"}
  Age: ${char.age || "Not defined"}
  Background: ${char.background || "Not defined"}
  Abilities: ${char.abilities?.join(", ") || "Not defined"}
  Relationships: ${char.relationships?.join(", ") || "Not defined"}
  Motivations: ${char.motivations || "Not defined"}
  Flaws: ${char.flaws || "Not defined"}
  Backstory: ${char.backstory || "Not defined"}`
).join("\n")}

## CHARACTERS (Secondary)
${story.characters.filter(c => !c.isMain).map(char => 
`- Name: ${char.name}
  Description: ${char.description}
  Personality: ${char.personality || "Not defined"}
  Outfit: ${char.outfit || "Not defined"}
  Age: ${char.age || "Not defined"}
  Background: ${char.background || "Not defined"}
  Abilities: ${char.abilities?.join(", ") || "Not defined"}
  Relationships: ${char.relationships?.join(", ") || "Not defined"}
  Motivations: ${char.motivations || "Not defined"}
  Flaws: ${char.flaws || "Not defined"}
  Backstory: ${char.backstory || "Not defined"}`
).join("\n")}

## CURRENT SCENE
Title: ${currentScene.title}
Content: ${currentScene.content}

## PLAYER CHOICE
Player choosed: "${selectedChoice.text}"
Description: ${selectedChoice.description || "No description available"}
Consequence: ${selectedChoice.consequence || "No consequence defined"}

## DICE ROLL RESULT
The player has obtained a die result of ${powerLevel} (on a scale of 1 to 6).
- 1-2: Minimal impact on story (subtle changes)
- 3-4: Moderate impact (significant changes to the story)
- 5-6: Major impact (significant consequences, dramatic turns)

## RECENT HISTORY
${historyContext}

## INSTRUCTIONS
1. Create an exciting new scene that flows naturally from the player's choice.
2. The impact of the choice must correspond to the result of the die (${powerLevel}/6).
3. The scene must be immersive, with sensory descriptions.
4. Offer the player 4 distinct choices:
   - Occasionally (20% of the time), include a thematic choice related to a character. Mark this with is_personalized = true.
   - Rarely (10% of the time), include a choice allowing the player to write his own action. Mark this with is_custom_choice = true.
5. Don't end the story unless ${story.scenes.length} approaches ${story.max_scenes || 20}.
6. Maintain narrative style ${story.narrativeStyle}.
7. Include a visual description for scene image generation.

Always keep in mind the characters' personalities and the player's previous choices when generating the new scene.
`;
    console.log("Prompt:", prompt);

    const { object } = await generateObject({
      model: openai("gpt-4o"),
      schema: z.object({
        title: z.string().min(1).max(100),
        content: z.string().min(100),
        visual_illustration_image_description: z.string().min(1),
        choices: z.array(choiceSchema).min(4).max(4),
        is_ending: z.boolean().default(false),
        ending_type: z.string().optional()
      }),
      prompt
    });

    const newSceneOrder = (currentScene.order || 0) + 1;
    const isEnding = object.is_ending || (newSceneOrder >= (story.max_scenes || 20));
    
    const newScene = await prisma.$transaction(async (tx) => {
      await tx.scene.update({
        where: { id: currentScene.id },
        data: { selected_choice_id: selectedChoice.id }
      });
      
      const scene = await tx.scene.create({
        data: {
          title: object.title,
          content: object.content,
          imagePrompt: object.visual_illustration_image_description,
          order: newSceneOrder,
          storyId: story.id,
        }
      });
      
      if (!isEnding) {
        await Promise.all(
          object.choices.map(choice =>
            tx.choice.create({
              data: {
                text: choice.label,
                description: choice.description,
                consequence: choice.consequence,
                loadingMessage: choice.next_scene_waiting_loader_message,
                isPersonalized: choice.is_personalized,
                isCustomChoice: choice.is_custom_choice,
                sceneId: scene.id,
              }
            })
          )
        );
      }
      
      await tx.sceneTransition.create({
        data: {
          sourceSceneId: currentScene.id,
          destinationSceneId: scene.id,
          choiceId: selectedChoice.id
        }
      });
      
      await tx.story.update({
        where: { id: story.id },
        data: { 
          current_scene_id: scene.id,
          current_scene: newSceneOrder 
        }
      });
      
      if (gameSaveId) {
        await tx.gameSave.update({
          where: { id: gameSaveId },
          data: {
            currentSceneId: scene.id,
            progress: newSceneOrder,
            lastPlayed: new Date()
          }
        });
        
        await tx.saveHistory.create({
          data: {
            gameSaveId: gameSaveId,
            sceneId: currentScene.id,
            choiceId: selectedChoice.id,
          }
        });
      }
      
      return scene;
    });

    if (user_data.premium) {
      try {
        await generateSceneImage(newScene.id, newScene.content);
      } catch (error) {
        console.error("Error generating scene image:", error);
      }
    }
    
    if (gameSaveId) {
      redirect(`/${gameSaveId}/${newScene.id}`);
    } else {
      redirect(`/${storyId}/${newScene.id}`);
    }
    
  } catch (error) {
    console.error("Error generating next scene:", error);
    throw error;
  }
};

export const handleCustomChoice = async (
  storyId: string,
  sceneId: string,
  customText: string,
  diceRoll?: number,
  gameSaveId?: string
) => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  try {
    const syntheticChoice = await prisma.choice.create({
      data: {
        text: customText,
        description: "Customized player selection",
        consequence: customText,
        loadingMessage: "The story develops according to your personalized action...",
        isCustomChoice: true,
        sceneId: sceneId,
      }
    });
    
    return generateNextScene(storyId, sceneId, syntheticChoice.id, diceRoll, gameSaveId);
    
  } catch (error) {
    console.error("Error handling custom choice:", error);
    throw error;
  }
};