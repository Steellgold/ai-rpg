import { RelationshipSchema } from "./relationships";
import { PersonalityTypeEnum } from "./personality";
import { MotivationSchema } from "./motivations";
import { BackgroundSchema } from "./background";
import { BackstorySchema } from "./backstory";
import { AbilitySchema } from "./abilities";
import { OutfitSchema } from "./outfit";
import { FlawSchema } from "./flaws";
import { z } from "zod";

const characterSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(50).max(500),
  // 
  personality_traits: z.record(PersonalityTypeEnum, z.number().min(1).max(10)),
  // 
  outfit: OutfitSchema,
  background: BackgroundSchema,
  abilities: z.array(AbilitySchema),
  relationships: z.array(RelationshipSchema),
  motivations: MotivationSchema,
  flaws: z.array(FlawSchema),
  backstory: BackstorySchema,
  // 
  age: z.number().int().min(1)
});

export type CharacterType = z.infer<typeof characterSchema>;
export { characterSchema };