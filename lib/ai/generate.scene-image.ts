import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/prisma"
import { OpenAI } from "openai"
import { checkCredits } from "@/lib/limit";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const extractSceneImagePrompt = (narrative: string): string => {
  const prompt = `
Based on the following scene description from a fantasy RPG game, create a concise image generation prompt (max 50 words) that captures the main visual elements and atmosphere. Focus on the setting, environment, and mood - not characters or actions.

Scene description:
${narrative}
`

  return prompt
}

export const uploadImageToSupabase = async (imageUrl: string, path: string): Promise<string> => {
  try {
    const response = await fetch(imageUrl)
    if (!response.ok) throw new Error("Failed to fetch image from URL")
    
    const imageBuffer = await response.arrayBuffer()
    
    const contentType = response.headers.get("content-type") || "image/png"
    const extension = contentType.split("/")[1] || "png"
    const fullPath = `${path}.${extension}`
    
    const { data, error } = await supabase
      .storage
      .from("images")
      .upload(fullPath, imageBuffer, {
        contentType,
        upsert: true
      })
    
    if (error) throw error
    
    const { data: publicUrlData } = supabase.storage.from("images").getPublicUrl(fullPath)
    
    return publicUrlData.publicUrl
  } catch (error) {
    console.error("Error uploading image to Supabase:", error)
    throw error
  }
}

export const generateSceneImage = async (sceneId: string, imagePrompt?: string): Promise<{
  success: boolean;
  imageUrl?: string;
  error?: string
}> => {
  const supa = await createServerClient();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) {
    return { success: false, error: "User not authenticated" }
  }

  const user_data = await prisma.user.findUnique({ where: { id: user.id } });
  if (!user_data) return { success: false, error: "User not found" }

  const { credits, isPremium } = await checkCredits(user.id);
  if (!isPremium && credits <= 0) {
    throw new Error("Insufficient credits to generate images.");
  }

  try {
    const scene = await prisma.scene.findUnique({
      where: { id: sceneId },
      select: {
        id: true,
        title: true, 
        content: true,
        imagePrompt: true,
        storyId: true,
        story: {
          select: {
            creatorId: true
          }
        }
      }
    })

    if (!scene) {
      return { success: false, error: "Scene not found" }
    }

    if (scene.story.creatorId !== user.id) {
      return { success: false, error: "You are not authorized to generate images for this scene." }
    }

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: extractSceneImagePrompt(imagePrompt || scene.content),
      n: 1,
      size: "1792x1024",
      quality: "standard",
      style: "vivid"
    })

    const tempImageUrl = response.data[0]?.url

    if (!tempImageUrl) {
      return { success: false, error: "Failed to generate image." }
    }

    const storagePath = `${scene.storyId}/scenes/${sceneId}`
    
    const permanentImageUrl = await uploadImageToSupabase(tempImageUrl, storagePath)

    await prisma.scene.update({
      where: { id: sceneId, storyId: scene.storyId },
      data: {
        imageUrl: permanentImageUrl,
        imagePrompt: extractSceneImagePrompt(imagePrompt || scene.content),
      }
    })

    return { success: true, imageUrl: permanentImageUrl }
  } catch (error) {
    console.error("Error generating image:", error)
    
    if (error instanceof OpenAI.APIError) {
      if (error.status === 429) {
        return { success: false, error: "API rate limit exceeded. Please try again later." }
      } else if (error.status === 400) {
        return { success: false, error: "Prompt is invalid. Please check your input." }
      }
    }
    
    return { 
      success: false, 
      error: "An error occurred while generating the image. Please try again later."
    }
  }
}