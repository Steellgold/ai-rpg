import { z } from "zod";

export const FlawTypeEnum = z.enum([
  "PHYSICAL",
  "MENTAL",
  "EMOTIONAL",
  "MORAL",
  "SOCIAL",
  "ADDICTION",
  "FEAR",
  "TRAUMATIC",
  "PERSONALITY",
  "SUPERNATURAL",
  "CURSE",
  "MEDICAL",
  "PSYCHOLOGICAL",
  "OBSESSION",
  "HUBRIS",
  "IGNORANCE",
  "PREJUDICE",
  "VULNERABILITY"
]);

export const FlawSchema = z.object({
  type: FlawTypeEnum,
  name: z.string(),
  description: z.string().min(10).max(200),
  severity: z.enum([
    "MINOR",
    "MODERATE",
    "SERIOUS",
    "SEVERE",
    "DEBILITATING",
    "LETHAL"
  ]),
  origin: z.string().optional(),
  awareness: z.enum([
    "UNAWARE",
    "DENIAL",
    "AWARE",
    "WORKING_ON_IT",
    "EMBRACES_IT"
  ]),
  trigger: z.string().optional(),
  consequences: z.array(z.string()).optional(),
  coping_mechanisms: z.array(z.string()).optional(),
  potential_growth: z.string().optional()
});

export type FlawType = z.infer<typeof FlawTypeEnum>;
export type Flaw = z.infer<typeof FlawSchema>;