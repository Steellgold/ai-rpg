import { OpenAI } from "openai";
import { createProviderRegistry, generateObject } from "ai";
import { SupportedLanguageType, languageDetectionSchema } from "./schemas.ts";
import { getLanguageDetectionPrompt, extractSceneImagePrompt, extractItemImagePrompt, extractCharacterAvatarPrompt } from "./prompts.ts";
import { uploadImageToSupabase, logger } from "./utils.ts";
import { createOpenAI } from "@ai-sdk/openai";

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY")
});

const registry = createProviderRegistry({
  openai: createOpenAI({
    apiKey: Deno.env.get("OPENAI_API_KEY")
  })
});

export const detectLanguageWithAI = async (text: string, jobId: string): Promise<SupportedLanguageType> => {
  try {
    const model = registry.languageModel("openai:gpt-4o-mini");
    logger.info(jobId, `Detecting language for text: ${text.substring(0, 100)}...`);

    const prompt = getLanguageDetectionPrompt(text);
    const { object } = await generateObject({
      model,
      schema: languageDetectionSchema,
      prompt
    });

    logger.info(jobId, `Language detection result: ${object.detectedLanguage} (confidence: ${object.confidence})`);
    
    if (object.confidence < 0.6) {
      logger.warn(jobId, `Low confidence detection, defaulting to English`);
      return "en";
    }
    
    return object.detectedLanguage;
  } catch (error) {
    logger.error(jobId, "Error in language detection:", error);
    return "en";
  }
};

export const generateBannerImage = async (storyId: string, prompt: string, jobId: string): Promise<string | null> => {
  try {
    logger.info(jobId, "Generating banner image...");
    
    const imageResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: extractSceneImagePrompt(prompt),
      n: 1,
      size: "1792x1024",
      quality: "standard",
      style: "vivid"
    });

    if (imageResponse.data.length > 0) {
      logger.info(jobId, "Uploading banner image...");
      const bannerImage = imageResponse.data[0];
      return await uploadImageToSupabase(bannerImage.url ?? "", `${storyId}/banner`);
    }
    
    return null;
  } catch (error) {
    logger.error(jobId, "Error generating banner image:", error);
    return null;
  }
};

export const generateSceneImage = async (storyId: string, sceneId: string, prompt: string, jobId: string): Promise<string | null> => {
  try {
    logger.info(jobId, "Generating scene image...");
    
    const sceneImageResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: extractSceneImagePrompt(prompt),
      n: 1,
      size: "1792x1024",
      quality: "standard",
      style: "vivid"
    });

    if (sceneImageResponse.data.length > 0) {
      logger.info(jobId, "Uploading scene image...");
      const sceneImage = sceneImageResponse.data[0];
      return await uploadImageToSupabase(sceneImage.url ?? "", `${storyId}/scenes/${sceneId}`);
    }
    
    return null;
  } catch (error) {
    logger.error(jobId, "Error generating scene image:", error);
    return null;
  }
};

export const generateItemImage = async (storyId: string, itemId: string, item: any, jobId: string): Promise<string | null> => {
  try {
    logger.info(jobId, `Generating image for item ${item.name}...`);
    
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
      return await uploadImageToSupabase(itemImage.url ?? "", `${storyId}/items/${itemId}`);
    }
    
    return null;
  } catch (error) {
    logger.error(jobId, `Error generating item image for ${item.name}:`, error);
    return null;
  }
};

export const generateCharacterAvatar = async (storyId: string, characterId: string, character: any, jobId: string): Promise<string | null> => {
  try {
    logger.info(jobId, `Generating avatar for character ${character.name}...`);
    
    const avatarResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: extractCharacterAvatarPrompt(character),
      n: 1,
      size: "1024x1024",
      quality: "standard",
      style: "vivid"
    });
    
    if (avatarResponse.data.length > 0) {
      const avatarImage = avatarResponse.data[0];
      return await uploadImageToSupabase(avatarImage.url ?? "", `${storyId}/characters/${characterId}`);
    }
    
    return null;
  } catch (error) {
    logger.error(jobId, `Error generating avatar for character ${character.name}:`, error);
    return null;
  }
};