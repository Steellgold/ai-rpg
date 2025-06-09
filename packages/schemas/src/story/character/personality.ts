import { z } from "zod";

export const PersonalityTypeEnum = z.enum([
  "INTROVERTED",
  "EXTRAVERTED", 
  "ANALYTICAL",
  "CREATIVE",
  "CAUTIOUS",
  "ADVENTUROUS",
  "LOYAL",
  "OPPORTUNISTIC",
  "OPTIMISTIC",
  "PESSIMISTIC",
  "ALTRUISTIC",
  "SELFISH",
  "DETERMINED",
  "INDECISIVE",
  "PRAGMATIC",
  "IDEALISTIC",
  "STOIC",
  "EMOTIONAL",
  "CHARISMATIC",
  "LONER",
  "MANIPULATIVE",
  "HONEST",
  "PARANOID",
  "IMPULSIVE",
  "METHODICAL",
  "REBELLIOUS",
  "PERFECTIONIST",
  "CAREFREE",
  "PROTECTIVE",
  "MYSTERIOUS"
]);

export type PersonalityType = z.infer<typeof PersonalityTypeEnum>;