import { z } from "zod";

export const BackstoryEventSchema = z.object({
  title: z.string(),
  age: z.number().int().min(0).optional(),
  description: z.string().min(10).max(200),
  impact: z.enum([
    "MINOR",
    "MODERATE",
    "SIGNIFICANT",
    "MAJOR",
    "LIFE_CHANGING",
    "DEFINING"
  ]),
  related_characters: z.array(z.string()).optional(),
  emotional_response: z.string().optional(),
  lessons_learned: z.string().optional(),
  unresolved_aspects: z.string().optional()
});

export const BackstorySchema = z.object({
  summary: z.string().min(10).max(200),
  key_events: z.array(BackstoryEventSchema),
  secrets: z.array(z.string()).optional(),
  childhood: z.string().optional(),
  formative_years: z.string().optional(),
  recent_history: z.string().optional(),
  trauma: z.array(z.string()).optional(),
  achievements: z.array(z.string()).optional(),
  regrets: z.array(z.string()).optional(),
  turning_points: z.array(z.string()).optional(),
  personal_timeline: z.array(
    z.object({
      year: z.number().int(),
      event: z.string()
    })
  ).optional()
});

export type BackstoryEvent = z.infer<typeof BackstoryEventSchema>;
export type Backstory = z.infer<typeof BackstorySchema>;