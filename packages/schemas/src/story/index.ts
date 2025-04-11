import { z } from "zod";
import { characterSchema } from "./character";

export const SUPPORTED_LANGUAGES = ["en", "fr", "es", "it", "de"] as const;
export type SupportedLanguageType = typeof SUPPORTED_LANGUAGES[number];

export const languageDetectionSchema = z.object({
  detectedLanguage: z.enum(SUPPORTED_LANGUAGES),
  confidence: z.number().min(0).max(1)
});

export const dialogueSchema = z.object({
  speaker: z.string().min(1).max(100),
  text: z.string().min(1).max(500),
  emotion: z.string().optional()
});

export const itemSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(200),
  type: z.enum(["WEAPON", "ARMOR", "POTION", "KEY", "TOOL", "DOCUMENT", "QUEST", "MISC"]),
  rarity: z.enum(["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY"]),
  effect: z.string().min(1).max(200).optional(),
  useCount: z.number().int().optional(),
  visual_description: z.string().min(1).max(200).optional(),
  found_in_scene: z.boolean().default(false)
});

export const choiceSchema = z.object({
  label: z.string().min(1).max(150),
  description: z.string().min(1).max(200),
  consequence: z.string().min(1).max(200),
  next_scene_waiting_loader_message: z.string().min(1).max(200),
  requires_item: z.string().optional(),
  consumes_item: z.boolean().optional().default(false),
  is_item_related: z.boolean().optional().default(false),
  is_personalized: z.boolean().default(false),
  is_custom_choice: z.boolean().default(false),
  impact_level: z.number().int().min(1).max(6).optional()
});

export const sceneSchema = z.object({
  title: z.string().min(1).max(100),
  content: z.string().min(10).max(3000),
  //
  visual_illustration_image_description: z.string().min(1).max(350),
  dialogues: z.array(dialogueSchema).optional().default([]),
  //
  user_choices: z.array(choiceSchema).min(4).max(4)
});

export const storyGenerationSchema = z.object({
  title: z.string().min(1).max(100),
  goal: z.string().min(1).max(200),
  synopsis: z.string().min(1),
  // Minimum 1 and maximum 5 alternative endings.
  ending: z.array(z.string()).min(1).max(5),
  // User can choose to have a story with advanced characters or not (e.g. complex personalities, relationships, etc.)
  // If true, the story will have more depth and complexity in character development.
  // If false, the characters will be simple a name and nothing else, without any depth or complexity.
  advanced_characters: z.boolean().default(false),
  characters: z.array(characterSchema),
  // 
  items: z.array(itemSchema).default([]),
  locations: z.array(z.string()).min(1).max(5),
  // Is the story for children or not?
  is_children: z.boolean().optional(),
  //
  narrative_style: z.enum(["FirstPerson", "SecondPerson", "ThirdPerson"]),
  banner_image_visual_description: z.string().min(1).max(350),
  max_story_scenes: z.number().int().min(1).max(20)
});

export const nextSceneSchema = z.object({
  title: z.string().min(1).max(100),
  content: z.string().min(100),
  visual_illustration_image_description: z.string().min(1),
  dialogues: z.array(dialogueSchema).optional().default([]),
  new_items: z.array(itemSchema).default([]),
  choices: z.array(choiceSchema).min(4).max(4),
  is_ending: z.boolean().default(false),
  ending_type: z.string().optional(),
  mentioned_items: z.array(z.string()).default([])
});