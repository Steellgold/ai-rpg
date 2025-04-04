import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { generateObject, createProviderRegistry } from "npm:ai";
import { createOpenAI } from "npm:@ai-sdk/openai";
import { z } from "npm:zod";
import { createClient } from "jsr:@supabase/supabase-js";
import { createId } from "npm:@paralleldrive/cuid2";
import { OpenAI } from "npm:openai";
const registry = createProviderRegistry({
  openai: createOpenAI({
    apiKey: Deno.env.get("OPENAI_API_KEY")
  })
});
const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY")
});
const choiceSchema = z.object({
  label: z.string().min(1).max(150),
  description: z.string().min(1).max(200),
  consequence: z.string().min(1).max(200),
  next_scene_waiting_loader_message: z.string().min(1).max(200),
  impact_level: z.number().int().min(1).max(6),
  is_personalized: z.boolean().default(false),
  is_custom_choice: z.boolean().default(false)
});
function extractSceneImagePrompt(prompt) {
  return `Create a high-quality, detailed illustration for a narrative game scene. 
The scene should depict: ${prompt}
Style: Cinematic, detailed, high-quality digital art with proper lighting and depth.

Focus on the characters and the environment, ensuring a captivating atmosphere.
Make sure to include elements that enhance the narrative aspect of the scene.
Consider the following details:
- Characters' expressions and poses
- Background elements that complement the story
- Color palette that matches the mood of the scene
- Lighting that highlights the characters and setting
Ensure the image is visually striking and immersive, drawing the viewer into the narrative.

### IMPORTANT:
- Do not include any text or UI elements in the image.
- The image should be suitable for a narrative game, focusing on storytelling through visuals.
- Avoid any elements that could be considered inappropriate or offensive.
`;
}
async function uploadImageToSupabase(imageUrl, path) {
  const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SERVICE_ROLE_KEY"));
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
    const imageBuffer = await response.arrayBuffer();
    const { data, error } = await supabase.storage.from('images').upload(`${path}.png`, imageBuffer, {
      contentType: 'image/png',
      upsert: true
    });
    if (error) throw error;
    const { data: urlData } = supabase.storage.from('images').getPublicUrl(`${path}.png`);
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
}
Deno.serve(async (req)=>{
  if (req.method !== "POST") {
    return new Response("Method not allowed", {
      status: 405
    });
  }
  const { storyId, sceneId, choiceId, diceRoll = 3, gameSaveId, userId, customText, isPremium = , isChildren = false } = await req.json();
  if (!storyId || !sceneId || !(choiceId || customText) || !userId) {
    return new Response(JSON.stringify({
      error: "Missing required fields: storyId, sceneId, choiceId/customText, and userId"
    }), {
      headers: {
        "Content-Type": "application/json"
      },
      status: 400
    });
  }
  const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SERVICE_ROLE_KEY"));
  try {
    // Vérifier si l'utilisateur existe et a les permissions
    const { data: userData, error: userError } = await supabase.from('User').select('*').eq('id', userId).single();
    if (userError || !userData) {
      throw new Error(`Utilisateur non trouvé: ${userError?.message || "ID invalide"}`);
    }
    // Récupérer l'histoire
    const { data: story, error: storyError } = await supabase.from('Story').select(`
        id, title, synopsis, goal, possibleEndings, narrativeStyle, genre, max_scenes, current_scene, creatorId,
        Character (
          id, name, description, personality, outfit, age, background, abilities, relationships, motivations, flaws, backstory, isMain
        ),
        Scene (
          id, title, content, order, Choice (
            id, text, description, consequence, loadingMessage, isPersonalized, isCustomChoice
          )
        )
      `).eq('id', storyId).order('order', {
      foreignTable: 'Scene',
      ascending: true
    }).single();
    if (storyError || !story) {
      throw new Error(`Histoire non trouvée: ${storyError?.message || "ID invalide"}`);
    }
    console.log("Story data:", story.creatorId, userId);
    if (story.creatorId !== userId) {
      throw new Error("You do not have permission to access this story");
    }
    let selectedChoice;
    let currentScene = story.Scene.find((s)=>s.id === sceneId);
    if (!currentScene) {
      throw new Error("Not found current scene");
    }
    if (customText) {
      const { data: syntheticChoice, error: choiceError } = await supabase.from('Choice').insert({
        id: createId(),
        text: customText,
        description: "Choix personnalisé du joueur",
        consequence: customText,
        loadingMessage: "L'histoire se développe selon votre action personnalisée...",
        isCustomChoice: true,
        sceneId: sceneId
      }).select().single();
      if (choiceError) {
        throw new Error(`Erreur lors de la création du choix personnalisé: ${choiceError.message}`);
      }
      selectedChoice = syntheticChoice;
    } else {
      // Récupérer le choix sélectionné
      selectedChoice = currentScene.Choice.find((c)=>c.id === choiceId);
      if (!selectedChoice) {
        throw new Error("Choix sélectionné non trouvé");
      }
    }
    // Récupérer l'historique des scènes récentes (5 dernières)
    const sceneHistory = story.Scene.filter((s)=>s.id !== currentScene.id && (s.order || 0) < (currentScene.order || 0)).sort((a, b)=>(a.order || 0) - (b.order || 0)).slice(-5);
    const historyContext = sceneHistory.map((scene)=>`Scene:: ${scene.title}\n${scene.content}\nSelected choice: ${scene.selected_choice_id ? scene.choices.find((c)=>c.id === scene.selected_choice_id)?.text || "Aucun choix sélectionné" : "Aucun choix sélectionné"}`).join("\n\n");
    const mainCharacters = story.Character.filter((c)=>c.isMain);
    const secondaryCharacters = story.Character.filter((c)=>!c.isMain);
    const newSceneOrder = (currentScene.order || 0) + 1;
    const approachingEnd = newSceneOrder >= (story.max_scenes || 20) - 3;
    const prompt = `
You are the narrator of an interactive text-based game. Based on the following information, generate the next scene of the story.
    
You must respect the language, tone, and style of the story. If the story is in French, respond in French.
    
## STORY
Title: ${story.title}
Synopsis: ${story.synopsis}
Goal: ${story.goal}
Possible Endings: ${story.possibleEndings.join(", ")}
Narrative Style: ${story.narrativeStyle}
Genre(s): ${story.genre.join(", ")}
Is for children: ${isChildren ? "Yes" : "No"}

${isChildren ? "The story should be suitable for children, avoiding any inappropriate content like violence, adult themes, or complex language." : ""}
    
## MAIN CHARACTERS
${mainCharacters.map((char)=>`- Name: ${char.name}
    Description: ${char.description}
    Personality: ${char.personality || "Undefined"}
    Outfit: ${char.outfit || "Undefined"}
    Age: ${char.age || "Undefined"}
    Background: ${char.background || "Undefined"}
    Abilities: ${char.abilities?.join(", ") || "Undefined"}
    Relationships: ${char.relationships?.join(", ") || "Undefined"}
    Motivations: ${char.motivations || "Undefined"}
    Flaws: ${char.flaws || "Undefined"}
    Backstory: ${char.backstory || "Undefined"}`).join("\n")}
    
## SECONDARY CHARACTERS
${secondaryCharacters.map((char)=>`- Name: ${char.name}
    Description: ${char.description}
    Personality: ${char.personality || "Undefined"}
    Outfit: ${char.outfit || "Undefined"}
    Age: ${char.age || "Undefined"}
    Background: ${char.background || "Undefined"}
    Abilities: ${char.abilities?.join(", ") || "Undefined"}
    Relationships: ${char.relationships?.join(", ") || "Undefined"}
    Motivations: ${char.motivations || "Undefined"}
    Flaws: ${char.flaws || "Undefined"}
    Backstory: ${char.backstory || "Undefined"}`).join("\n")}
    
## CURRENT SCENE
Title: ${currentScene.title}
Content: ${currentScene.content}
    
## PLAYER'S CHOICE
Choice: "${selectedChoice.text}"
Description: ${selectedChoice.description || "No description available"}
Consequence: ${selectedChoice.consequence || "No consequence defined"}

## DICE ROLL RESULT
The player rolled a ${diceRoll} (on a scale of 1 to 6).
- 1-2: Minimal impact on the story, the choice action/consequence fails.
- 3-4: Moderate impact, the choice action/consequence succeeds but with complications or drawbacks.
- 5-6: Major impact, the choice action/consequence succeeds spectacularly, leading to significant changes in the story.

## RECENT HISTORY
${historyContext}
    
## INSTRUCTIONS
1. Create an exciting new scene that naturally follows from the player's choice.
2. The impact of the choice must match the dice roll result (${diceRoll}/6).
3. The scene must be immersive, with sensory descriptions.
4. Offer the player 4 distinct choices:
  - Occasionally (20% of the time), include a thematic choice related to a character. Mark this with is_personalized = true.
  - Rarely (10% of the time), include a choice allowing the player to write their own action. Mark this with is_custom_choice = true.
5. ${approachingEnd ? "Consider that the story is approaching its end, you can start steering towards a conclusion." : "Do not end the story unless it is a natural culmination point."}
6. Maintain the narrative style ${story.narrativeStyle}.
7. Include a visual description for scene image generation.
    
Always keep in mind the characters' personalities and the player's previous choices when generating the new scene.
`;
    console.log("Generating new scene...");
    const model = registry.languageModel("openai:gpt-4o");
    const { object } = await generateObject({
      model,
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
    const isEnding = object.is_ending || newSceneOrder >= (story.max_scenes || 20);
    console.log("Scene generated, updating database...");
    // Mise à jour de la scène actuelle
    await supabase.from('Scene').update({
      selected_choice_id: selectedChoice.id
    }).eq('id', currentScene.id);
    // Création de la nouvelle scène
    const { data: newScene, error: sceneError } = await supabase.from('Scene').insert({
      id: createId(),
      title: object.title,
      content: object.content,
      imagePrompt: object.visual_illustration_image_description,
      order: newSceneOrder,
      storyId: story.id
    }).select().single();
    if (sceneError) {
      throw new Error(`Erreur lors de la création de la scène: ${sceneError.message}`);
    }
    // Créer les choix si ce n'est pas une fin
    if (!isEnding) {
      const choicePromises = object.choices.map((choice)=>supabase.from('Choice').insert({
          id: createId(),
          text: choice.label,
          description: choice.description,
          consequence: choice.consequence,
          loadingMessage: choice.next_scene_waiting_loader_message,
          isPersonalized: choice.is_personalized,
          isCustomChoice: choice.is_custom_choice,
          sceneId: newScene.id
        }));
      await Promise.all(choicePromises);
    }
    // Créer la transition entre les scènes
    await supabase.from('SceneTransition').insert({
      id: createId(),
      sourceSceneId: currentScene.id,
      destinationSceneId: newScene.id,
      choiceId: selectedChoice.id
    });
    // Mettre à jour l'état actuel de l'histoire
    await supabase.from('Story').update({
      current_scene_id: newScene.id,
      current_scene: newSceneOrder
    }).eq('id', story.id);
    // Mise à jour de la sauvegarde si gameSaveId est fourni
    if (gameSaveId) {
      await supabase.from('GameSave').update({
        currentSceneId: newScene.id,
        progress: newSceneOrder,
        lastPlayed: new Date().toISOString()
      }).eq('id', gameSaveId);
      await supabase.from('SaveHistory').insert({
        id: createId(),
        gameSaveId: gameSaveId,
        sceneId: currentScene.id,
        choiceId: selectedChoice.id,
        timestamp: new Date().toISOString()
      });
    }
    console.log("Database updated successfully");
    // Génération d'image pour les utilisateurs premium
    if (isPremium) {
      console.log("Generating scene image for premium user...");
      try {
        const imageResponse = await openai.images.generate({
          model: "dall-e-3",
          prompt: extractSceneImagePrompt(object.visual_illustration_image_description),
          n: 1,
          size: "1792x1024",
          quality: "standard",
          style: "natural"
        });
        if (imageResponse.data.length > 0) {
          console.log("Uploading scene image...");
          const sceneImage = imageResponse.data[0];
          const sceneImageUrl = await uploadImageToSupabase(sceneImage.url ?? "", `${story.id}/scenes/${newScene.id}`);
          if (sceneImageUrl) {
            await supabase.from('Scene').update({
              imageUrl: sceneImageUrl
            }).eq('id', newScene.id);
          }
        }
      } catch (imageError) {
        console.error("Error generating scene image:", imageError);
      // Continuer même si la génération d'image échoue
      }
    }
    return new Response(JSON.stringify({
      success: true,
      scene: {
        id: newScene.id,
        title: newScene.title,
        content: newScene.content,
        storyId: story.id,
        is_ending: isEnding,
        ending_type: object.ending_type
      },
      redirect: gameSaveId ? `/${gameSaveId}/${newScene.id}` : `/${storyId}/${newScene.id}`
    }), {
      headers: {
        "Content-Type": "application/json"
      },
      status: 200
    });
  } catch (error) {
    console.error("Error generating next scene:", error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      headers: {
        "Content-Type": "application/json"
      },
      status: 400
    });
  }
});
