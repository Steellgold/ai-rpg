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

// Définir les langues supportées (même enum que dans Prisma)
const SupportedLanguage = z.enum(["en", "fr", "es", "it", "de"]);
type SupportedLanguageType = z.infer<typeof SupportedLanguage>;

// Schéma pour la détection de langue
const languageDetectionSchema = z.object({
  detectedLanguage: SupportedLanguage,
  confidence: z.number().min(0).max(1)
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

const itemSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(200),
  type: z.enum(["WEAPON", "ARMOR", "POTION", "KEY", "TOOL", "DOCUMENT", "QUEST", "MISC"]),
  rarity: z.enum(["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY"]),
  effect: z.string().min(1).max(200).optional(),
  useCount: z.number().int().optional(),
  visual_description: z.string().min(1).max(200).optional(),
  found_in_scene: z.boolean().default(false)
});

// Fonction de détection de langue avec l'IA
async function detectLanguageWithAI(text: string): Promise<SupportedLanguageType> {
  try {
    // Détection de la langue avec l'IA
    const model = registry.languageModel("openai:gpt-4o-mini");
    console.log(`Detecting language for text: ${text.substring(0, 100)}...`);

    const prompt = `
Analyze the following text and determine which language it is written in.
Text: "${text.substring(0, 500)}"

Respond with ONLY one of these language codes:
- en: English
- fr: French
- es: Spanish
- it: Italian
- de: German

If the language is not one of these, or if you are unsure, respond with "en" (English).
`;

    const { object } = await generateObject({
      model,
      schema: languageDetectionSchema,
      prompt
    });

    console.log(`Language detection result: ${object.detectedLanguage} (confidence: ${object.confidence})`);
    
    // Si la confiance est faible, utiliser l'anglais par défaut
    if (object.confidence < 0.6) {
      console.log(`Low confidence detection, defaulting to English`);
      return "en";
    }
    
    return object.detectedLanguage;
  } catch (error) {
    console.error("Error in language detection:", error);
    // En cas d'erreur, utiliser l'anglais par défaut
    return "en";
  }
}

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

function extractItemImagePrompt(description, itemName, itemType) {
  return `Create a detailed and high-quality illustration of a ${itemType.toLowerCase()} for a narrative game.
The object is: ${itemName}
Description: ${description}

Style: Detailed and high-quality digital art with proper lighting and depth. The object should be centered against a simple, slightly blurred background.

CRITICAL INSTRUCTIONS:
- Create ONLY the object itself with NO TEXT whatsoever
- DO NOT include item name, stats, properties, or any labels in the image
- NO UI elements, inventory frames, or item cards
- NO price tags, rarity indicators, or numerical values
- Show just the clean object against a simple background
- Focus on details, textures, and materials of the object itself
- The final image should contain absolutely no text, numbers, or symbols

The object should be clearly visible and detailed, communicating its purpose through visual design alone.`;
}

function extractCharacterAvatarPrompt(character) {
  return `Create a high-quality character portrait avatar for a narrative game.

Character details:
- Name: ${character.name}
- Description: ${character.description}
${character.personality ? `- Personality: ${character.personality}` : ''}
${character.outfit ? `- Outfit: ${character.outfit}` : ''}
${character.age ? `- Age: ${character.age}` : ''}

Style: Clean, detailed character portrait showing only the head and shoulders against a simple background.

CRITICAL INSTRUCTIONS:
- Create ONLY the character portrait with NO TEXT whatsoever in the image
- DO NOT include the character's name, attributes, or any labels in the image
- NO UI elements, stats, or character sheet information
- NO borders with text or information cards
- Just a clean, simple portrait against a plain or simple background
- Focus on facial features, expression, and basic shoulder/upper chest area
- The final image should contain absolutely no text, numbers, or symbols

The portrait should communicate the character's personality through visual elements only - expression, coloring, and style.`;
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

interface RequestParams {
  text: string;
  genres: string[];
  userId: string;
  jobId: string;
  isPremium: boolean;
  isChildren: boolean;
  items: boolean;
  language?: string; // "auto", "en", "fr", "es", "it", "de", etc.
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", {
      status: 405
    });
  }

  const { text, genres, userId, jobId, isPremium = false, isChildren = false, items = false, language = "auto" } = await req.json() as RequestParams;

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

    // Si auto, on commence par la détection de langue, sinon on passe directement à la génération
    if (language === "auto") {
      await updateJob(supabase, jobId, {
        status: 'RUNNING',
        progress: 5,
        stage: 'DETECTING_LANGUAGE',
        startedAt: new Date().toISOString()
      });
    } else {
      await updateJob(supabase, jobId, {
        status: 'RUNNING',
        progress: 10,
        stage: 'GENERATING_STORY',
        startedAt: new Date().toISOString()
      });
    }

    (async () => {
      try {
        // Déterminer la langue à utiliser
        let outputLanguage = language;
        if (language === "auto") {
          outputLanguage = await detectLanguageWithAI(text);
          console.log(`[Job ${jobId}] AI-detected language: ${outputLanguage}`);
          
          // Mise à jour du job après la détection de langue
          await updateJob(supabase, jobId, {
            progress: 10,
            stage: 'GENERATING_STORY'
          });
        }

        const languageInstructions = {
          "en": "Write the story in English.",
          "fr": "Écrivez l'histoire en français.",
          "es": "Escriba la historia en español.",
          "it": "Scrivere la storia in italiano.",
          "de": "Schreiben Sie die Geschichte auf Deutsch.",
        };

        const prompt = `
Improve this text for a narrative game. Make it more captivating, descriptive and immersive, while preserving the main ideas. ${genres ? "Adapt it to the following genre(s): " + genres.join(", ") : ""}
        
${isChildren ? "Make it suitable for children, avoiding any inappropriate content, violence, or adult themes." : ""}
${languageInstructions[outputLanguage] || ""}

${items ? `
Create 3-5 significant items/objects that will play important roles throughout the story. Each item should:
  - Have a clear purpose or function within the narrative
  - Be relevant to the plot, setting, or character development
  - Be interesting enough to be used multiple times across different scenes
  - Vary in rarity and usefulness
Do not create items that will only be used in a single scene.
` : ""}

Text: ${text}
`;

        const model = registry.languageModel("openai:gpt-4o-mini");
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
            items: items ? z.array(itemSchema).min(3).max(10) : z.array(itemSchema).default([]),
            banner_image_visual_description: z.string().min(1).max(350),
            max_story_scenes: z.number().int().min(1).max(20),
            first_scene: z.array(z.object({
              title: z.string().min(1).max(100),
              text: z.string().max(3000),
              visual_illustration_image_description: z.string().min(1).max(350),
              found_items: z.array(z.string()).optional(),
              user_choices: z.array(z.object({
                label: z.string().min(1).max(150),
                description: z.string().min(1).max(200),
                consequence: z.string().min(1).max(200),
                next_scene_waiting_loader_message: z.string().min(1).max(200),
                requires_item: z.string().optional(),
                consumes_item: z.boolean().optional().default(false),
                is_item_related: z.boolean().optional().default(false)
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
          genre: genres || [],
          hasItems: items,
          language: outputLanguage, // Enregistrer la langue utilisée
          v: "V2"
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
        const principalCharPromises = object.principal_characters.map((char) => supabase.from('Character').insert({
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
        const secondaryCharPromises = object.secondary_characters.map((char) => supabase.from('Character').insert({
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

        // Créer des items seulement si l'option est activée
        const itemsMap = {};
        if (items && object.items.length > 0) {
          await updateJob(supabase, jobId, {
            progress: 55,
            stage: 'GENERATING_ITEMS'
          });

          console.log(`[Job ${jobId}] Creating items...`);
          
          const itemPromises = object.items.map(async (item) => {
            const itemId = createId();
            itemsMap[item.name] = itemId;
            
            return supabase.from('Item').insert({
              id: itemId,
              name: item.name,
              description: item.description,
              type: item.type,
              rarity: item.rarity,
              effect: item.effect,
              useCount: item.useCount,
              storyId: story.id
            });
          });

          await Promise.all(itemPromises);

          // Generate images for premium users' items
          if (isPremium) {
            console.log(`[Job ${jobId}] Generating item images for premium user...`);
            
            for (const item of object.items) {
              const itemId = itemsMap[item.name];
              if (!itemId) continue;
              
              try {
                const imageResponse = await openai.images.generate({
                  model: "dall-e-3",
                  prompt: extractItemImagePrompt(item.description, item.name, item.type),
                  n: 1,
                  size: "1024x1024",
                  quality: "standard",
                  style: "vivid"
                });
                
                if (imageResponse.data.length > 0) {
                  const itemImage = imageResponse.data[0];
                  const itemImageUrl = await uploadImageToSupabase(itemImage.url ?? "", `${story.id}/items/${itemId}`);
                  
                  if (itemImageUrl) {
                    await supabase.from('Item').update({
                      imageUrl: itemImageUrl
                    }).eq('id', itemId);
                  }
                }
              } catch (itemImageError) {
                console.error(`[Job ${jobId}] Error generating item image for ${item.name}:`, itemImageError);
                // Continue even if item image generation fails
              }
            }

            console.log(`[Job ${jobId}] Generating character avatars for premium user...`);
            for (const character of object.principal_characters) {
              try {
                const { data: charData, error: charError } = await supabase
                  .from('Character')
                  .select('id')
                  .eq('name', character.name)
                  .eq('storyId', story.id)
                  .single();
                  
                if (charError || !charData) continue;
                
                const characterId = charData.id;
                
                const avatarResponse = await openai.images.generate({
                  model: "dall-e-3",
                  prompt: extractCharacterAvatarPrompt(character),
                  n: 1,
                  size: "1024x1024",
                  quality: "standard",
                  style: "natural"
                });
                
                if (avatarResponse.data.length > 0) {
                  const avatarImage = avatarResponse.data[0];
                  const avatarUrl = await uploadImageToSupabase(avatarImage.url ?? "", `${story.id}/characters/${characterId}`);
                  
                  if (avatarUrl) {
                    await supabase.from('Character').update({
                      imageUrl: avatarUrl
                    }).eq('id', characterId);
                  }
                }
              } catch (avatarError) {
                console.error(`[Job ${jobId}] Error generating avatar for character ${character.name}:`, avatarError);
              }
            }
          }
        } else {
          await updateJob(supabase, jobId, {
            progress: 55
          });
        }

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

          // Add found items to the scene if any
          if (firstSceneData.found_items && firstSceneData.found_items.length > 0) {
            const sceneItemPromises = firstSceneData.found_items.map(itemName => {
              const itemId = itemsMap[itemName];
              if (itemId) {
                return supabase.from('SceneItem').insert({
                  id: createId(),
                  sceneId: scene.id,
                  itemId: itemId,
                  isHidden: false
                });
              }
              return Promise.resolve();
            }).filter(p => p !== undefined);

            await Promise.all(sceneItemPromises);
          }

          const choicePromises = firstSceneData.user_choices.map(async (choice) => {
            const choiceId = createId();
            
            // Create the choice
            await supabase.from('Choice').insert({
              id: choiceId,
              text: choice.label,
              description: choice.description,
              consequence: choice.consequence,
              loadingMessage: choice.next_scene_waiting_loader_message,
              isItemRelated: choice.is_item_related || false,
              sceneId: scene.id
            });

            // If choice requires an item, create the choice-item relationship
            if (choice.requires_item) {
              const itemId = itemsMap[choice.requires_item];
              if (itemId) {
                await supabase.from('ChoiceItem').insert({
                  id: createId(),
                  choiceId: choiceId,
                  itemId: itemId,
                  consumed: choice.consumes_item || false
                });
              }
            }
          });

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

        // Step 8: Create game save
        await updateJob(supabase, jobId, {
          progress: 95,
          stage: 'FINALIZING'
        });

        console.log(`[Job ${jobId}] Creating game save...`);
        let gameSaveId = null;
        try {
          // Créer une sauvegarde de jeu pour l'utilisateur
          gameSaveId = createId();
          await supabase.from('GameSave').insert({
            id: gameSaveId,
            characterName: "Aventurier", // ou extraire un nom de personnage de l'histoire
            storyId: story.id,
            userId: userId,
            currentSceneId: firstSceneId,
            progress: 1,
            name: `${object.title} - Sauvegarde`,
            lastPlayed: new Date().toISOString()
          });

          // Si l'histoire a des objets et qu'ils sont présents dans la première scène
          if (items && firstSceneData?.found_items && firstSceneData.found_items.length > 0) {
            for (const itemName of firstSceneData.found_items) {
              const itemId = itemsMap[itemName];
              if (!itemId) continue;
              
              // Déterminer les utilisations restantes si applicable
              const itemData = object.items.find(item => item.name === itemName);
              if (!itemData) continue;
              
              let remainingUses = null;
              if (["WEAPON", "ARMOR", "TOOL"].includes(itemData.type)) {
                const rarityMultiplier = {
                  "COMMON": 1,
                  "UNCOMMON": 2,
                  "RARE": 3,
                  "EPIC": 4,
                  "LEGENDARY": 5
                };
                remainingUses = 5 * (rarityMultiplier[itemData.rarity] || 1);
              } else if (itemData.type === "POTION") {
                remainingUses = 1;
              }
              
              // Ajouter l'objet à l'inventaire du joueur
              await supabase.from('InventoryItem').insert({
                id: createId(),
                gameSaveId: gameSaveId,
                itemId: itemId,
                quantity: 1,
                isEquipped: false,
                remainingUses: remainingUses,
                isBroken: false
              });
            }
          }

          console.log(`[Job ${jobId}] Game save created successfully: ${gameSaveId}`);
        } catch (saveError) {
          console.error(`[Job ${jobId}] Error creating game save:`, saveError);
          gameSaveId = null;
          // Continuer même si la création de sauvegarde échoue
        }

        // Job completed successfully
        await updateJob(supabase, jobId, {
          status: 'COMPLETED',
          progress: 100,
          stage: null,
          completedAt: new Date().toISOString(),
          output: {
            story: object,
            storyId: story.id,
            firstSceneId: firstSceneId,
            gameSaveId: gameSaveId,
            language: outputLanguage
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