import { z } from "zod";

export const AbilityTypeEnum = z.enum([
  "COMBAT",
  "PHYSICAL",
  "MENTAL",
  "SOCIAL",
  "ARTISTIC",
  "MAGICAL",
  "TECHNOLOGICAL",
  "SURVIVAL",
  "CRAFTING",
  "LINGUISTIC",
  "LEADERSHIP",
  "STEALTH",
  "PERCEPTION",
  "SPECIAL"
]);

export const AbilityProficiencyEnum = z.enum([
  "NOVICE",
  "APPRENTICE",
  "COMPETENT",
  "PROFICIENT",
  "EXPERT",
  "MASTER",
  "LEGENDARY"
]);

export const AbilitySchema = z.object({
  name: z.string(),
  type: AbilityTypeEnum,
  description: z.string().min(10).max(200),
  proficiency: AbilityProficiencyEnum,
  limitations: z.string().optional(),
  origin: z.string().optional(),
  special_effects: z.array(z.string()).optional(),
  related_equipment: z.string().optional()
});

export type AbilityType = z.infer<typeof AbilityTypeEnum>;
export type AbilityProficiency = z.infer<typeof AbilityProficiencyEnum>;
export type Ability = z.infer<typeof AbilitySchema>;