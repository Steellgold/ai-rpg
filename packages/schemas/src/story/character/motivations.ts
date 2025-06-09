import { z } from "zod";

export const MotivationTypeEnum = z.enum([
  "SURVIVAL",
  "PROTECTION",
  "VENGEANCE",
  "JUSTICE",
  "POWER",
  "WEALTH",
  "FAME",
  "KNOWLEDGE",
  "LOVE",
  "HONOR",
  "DUTY",
  "REDEMPTION",
  "FREEDOM",
  "BELONGING",
  "CREATION",
  "DISCOVERY",
  "THRILL",
  "LEGACY",
  "IDEOLOGY",
  "CURIOSITY",
  "COMPETITION",
  "REBELLION",
  "TRANSCENDENCE",
  "OBSESSION",
  "ESCAPE"
]);

export const MotivationSchema = z.object({
  primary_type: MotivationTypeEnum,
  secondary_types: z.array(MotivationTypeEnum).optional(),
  description: z.string().min(10).max(200),
  driving_force: z.string().min(10).max(200),
  intensity: z.enum([
    "MILD",
    "MODERATE",
    "STRONG",
    "INTENSE",
    "OVERWHELMING",
    "FLUCTUATING"
  ]),
  related_to: z.string().optional(),
  conflicts: z.array(z.string()).optional(),
  evolution: z.string().optional(),
  manifestations: z.array(z.string()).optional()
});

export type MotivationType = z.infer<typeof MotivationTypeEnum>;
export type Motivation = z.infer<typeof MotivationSchema>;