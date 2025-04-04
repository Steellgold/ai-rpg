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
const characterSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(200),
  personality: z.string().min(1).max(200).optional(),
  outfit: z.string().min(1).max(200).optional(),
  age: z.number().int().optional(),
  background: z.string().min(1).max(200).optional(),
  abilities: z.array(z.string()).optional(),
  relationships: z.array(z.string()).optional(),
  motivations: z.string().min(1).max(200).optional(),
  flaws: z.string().min(1).max(200).optional(),
  backstory: z.string().min(1).max(200).optional()
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
async function updateJob(supabase, jobId, updates) {
  try {
    const { error } = await supabase.from('Job').update({
      ...updates,
      updatedAt: new Date().toISOString()
    }).eq('id', jobId);
    if (error) {
      console.error(`Error updating job ${jobId}:`, error);
      throw error;
    }
  } catch (error) {
    console.error(`Failed to update job ${jobId}:`, error);
  }
}
Deno.serve(async (req)=>{
  if (req.method !== "POST") {
    return new Response("Method not allowed", {
      status: 405
    });
  }
  const { text, genres, userId, jobId, isPremium = false, isChildren = false } = await req.json();
  if (!text || !userId || !jobId) {
    return new Response(JSON.stringify({
      error: "Missing required fields: text, userId, and jobId"
    }), {
      headers: {
        "Content-Type": "application/json"
      },
      status: 400
    });
  }
  const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SERVICE_ROLE_KEY"));
  try {
    if (!text.trim() || text.length < 10) {
      throw new Error("Text is too short or empty");
    }
    const { data: existingJob, error: jobError } = await supabase.from('Job').select('*').eq('id', jobId).single();
    if (jobError || !existingJob) {
      throw new Error(`Job non trouvé: ${jobError?.message || "ID invalide"}`);
    }
    if (existingJob.userId !== userId) {
      throw new Error("Vous n'êtes pas autorisé à accéder à ce job");
    }
    await updateJob(supabase, jobId, {
      status: 'RUNNING',
      progress: 10,
      stage: 'GENERATING_STORY',
      startedAt: new Date().toISOString()
    });
    (async ()=>{
      try {
        const prompt = `
Improve this text for a narrative game. Make it more captivating, descriptive and immersive, 
while preserving the main ideas. ${genres ? "Adapt it to the following genre(s): " + genres.join(", ") : ""}
Answer in the same language as the original text.

${isChildren ? "Make it suitable for children, avoiding any inappropriate content, violence, or adult themes." : ""}

Text: ${text}
        `;
        const model = registry.languageModel("openai:gpt-4o");
        console.log(`[Job ${jobId}] Generating story content...`);
        const { object } = await generateObject({
          model,
          schema: z.object({
            title: z.string().min(1).max(100),
            synopsis: z.string().min(1),
            goal: z.string().min(1).max(200),
            how_story_can_end: z.array(z.string()).min(1).max(5),
            principal_characters: z.array(characterSchema),
            secondary_characters: z.array(characterSchema),
            is_children: z.boolean().optional(),
            narrative_style: z.enum([
              "FirstPerson",
              "SecondPerson",
              "ThirdPerson"
            ]),
            banner_image_visual_description: z.string().min(1).max(350),
            max_story_scenes: z.number().int().min(1).max(20),
            first_scene: z.array(z.object({
              title: z.string().min(1).max(100),
              text: z.string().max(3000),
              visual_illustration_image_description: z.string().min(1).max(350),
              user_choices: z.array(z.object({
                label: z.string().min(1).max(150),
                description: z.string().min(1).max(200),
                consequence: z.string().min(1).max(200),
                next_scene_waiting_loader_message: z.string().min(1).max(200)
              })).min(4).max(4)
            }))
          }),
          prompt
        });
        await updateJob(supabase, jobId, {
          progress: 30,
          output: {
            story: object
          },
          stage: 'CREATING_STORY'
        });
        // Step 2: Create story record in database
        console.log(`[Job ${jobId}] Creating story record...`);
        const { data: story, error: storyError } = await supabase.from('Story').insert({
          id: createId(),
          title: object.title,
          synopsis: object.synopsis,
          goal: object.goal,
          possibleEndings: object.how_story_can_end,
          narrativeStyle: object.narrative_style,
          max_scenes: object.max_story_scenes,
          creatorId: userId,
          isChildrenStory: object.is_children || isChildren,
          genre: genres || []
        }).select().single();
        if (storyError) {
          throw new Error(`Failed to create story: ${storyError.message}`);
        }
        await updateJob(supabase, jobId, {
          storyId: story.id,
          progress: 40,
          stage: 'CREATING_MAIN_CHARS'
        });
        console.log(`[Job ${jobId}] Creating principal characters...`);
        const principalCharPromises = object.principal_characters.map((char)=>supabase.from('Character').insert({
            id: createId(),
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
          }));
        await Promise.all(principalCharPromises);
        await updateJob(supabase, jobId, {
          progress: 50,
          stage: 'CREATING_SEC_CHARS'
        });
        console.log(`[Job ${jobId}] Creating secondary characters...`);
        const secondaryCharPromises = object.secondary_characters.map((char)=>supabase.from('Character').insert({
            id: createId(),
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
          }));
        await Promise.all(secondaryCharPromises);
        await updateJob(supabase, jobId, {
          progress: 60,
          stage: 'CREATING_FIRST_SCENE'
        });
        console.log(`[Job ${jobId}] Creating first scene...`);
        let firstSceneId = null;
        let firstSceneData = null;
        if (object.first_scene.length > 0) {
          firstSceneData = object.first_scene[0];
          const { data: scene, error: sceneError } = await supabase.from('Scene').insert({
            id: createId(),
            title: firstSceneData.title,
            content: firstSceneData.text,
            order: 1,
            storyId: story.id,
            imagePrompt: firstSceneData.visual_illustration_image_description
          }).select().single();
          if (sceneError) {
            throw new Error(`Failed to create scene: ${sceneError.message}`);
          }
          firstSceneId = scene.id;
          const choicePromises = firstSceneData.user_choices.map((choice)=>supabase.from('Choice').insert({
              id: createId(),
              text: choice.label,
              description: choice.description,
              consequence: choice.consequence,
              loadingMessage: choice.next_scene_waiting_loader_message,
              sceneId: scene.id
            }));
          await Promise.all(choicePromises);
        }
        await updateJob(supabase, jobId, {
          progress: 70,
          stage: 'GENERATING_BANNER'
        });
        // Step 6: Generate and upload banner image
        console.log(`[Job ${jobId}] Generating banner image...`);
        try {
          const imageResponse = await openai.images.generate({
            model: "dall-e-3",
            prompt: extractSceneImagePrompt(object.banner_image_visual_description),
            n: 1,
            size: "1792x1024",
            quality: "standard",
            style: "vivid"
          });
          await updateJob(supabase, jobId, {
            progress: 80,
            stage: 'UPLOADING_BANNER'
          });
          if (imageResponse.data.length > 0) {
            console.log(`[Job ${jobId}] Uploading banner image...`);
            const bannerImage = imageResponse.data[0];
            const publicUrl = await uploadImageToSupabase(bannerImage.url ?? "", `${story.id}/banner`);
            if (publicUrl) {
              await supabase.from('Story').update({
                coverImageUrl: publicUrl,
                current_scene_id: firstSceneId ?? ""
              }).eq('id', story.id);
            }
          }
        } catch (imageError) {
          console.error(`[Job ${jobId}] Error generating banner image:`, imageError);
        // Continue even if image generation fails
        }
        // Step 7: Generate and upload scene image (if user is premium)
        if (isPremium && firstSceneId && firstSceneData) {
          await updateJob(supabase, jobId, {
            progress: 85,
            stage: 'GENERATING_SCENE_IMG'
          });
          console.log(`[Job ${jobId}] Generating scene image (premium user)...`);
          try {
            const sceneImageResponse = await openai.images.generate({
              model: "dall-e-3",
              prompt: extractSceneImagePrompt(firstSceneData.visual_illustration_image_description),
              n: 1,
              size: "1792x1024",
              quality: "standard",
              style: "vivid"
            });
            await updateJob(supabase, jobId, {
              progress: 90,
              stage: 'UPLOADING_SCENE_IMG'
            });
            if (sceneImageResponse.data.length > 0) {
              console.log(`[Job ${jobId}] Uploading scene image...`);
              const sceneImage = sceneImageResponse.data[0];
              const sceneImageUrl = await uploadImageToSupabase(sceneImage.url ?? "", `${story.id}/scenes/${firstSceneId}`);
              if (sceneImageUrl) {
                await supabase.from('Scene').update({
                  imageUrl: sceneImageUrl
                }).eq('id', firstSceneId);
              }
            }
          } catch (sceneImageError) {
            console.error(`[Job ${jobId}] Error generating scene image:`, sceneImageError);
          // Continue even if scene image generation fails
          }
        }
        // Step 8: Finalize the job
        await updateJob(supabase, jobId, {
          progress: 95,
          stage: 'FINALIZING'
        });
        console.log(`[Job ${jobId}] Finalizing...`);
        // Job completed successfully
        await updateJob(supabase, jobId, {
          status: 'COMPLETED',
          progress: 100,
          stage: null,
          completedAt: new Date().toISOString(),
          output: {
            story: object,
            storyId: story.id,
            firstSceneId: firstSceneId
          }
        });
        console.log(`[Job ${jobId}] Completed successfully!`);
      } catch (error) {
        console.error(`[Job ${jobId}] Error in background processing:`, error);
        await updateJob(supabase, jobId, {
          status: 'FAILED',
          error: error.message,
          completedAt: new Date().toISOString()
        });
      }
    })();
    // Return immediate response with job ID
    return new Response(JSON.stringify({
      message: "Story generation job started",
      jobId: jobId
    }), {
      headers: {
        "Content-Type": "application/json"
      },
      status: 202
    });
  } catch (error) {
    console.error("Error starting job:", error);
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
