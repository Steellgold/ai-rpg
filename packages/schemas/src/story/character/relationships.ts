import { z } from "zod";

export const RelationshipTypeEnum = z.enum([
  "FAMILY", "FRIEND", "ROMANTIC", "MENTOR",
  "ALLY", "RIVAL", "ENEMY", "COLLEAGUE", "SUPERIOR",
  "SUBORDINATE", "ACQUAINTANCE", "COMPLICATED", "FORMER", "SPIRITUAL",
  "POLITICAL", "BUSINESS", "MYSTERIOUS"
]);

export const RelationshipSchema = z.object({
  person: z.string(),
  type: RelationshipTypeEnum,
  description: z.string().min(10).max(200),
  intensity: z.enum([
    "DISTANT", "CASUAL", "CLOSE", "INTIMATE", "INTENSE", "DEPENDENT", "CONFLICTED"
  ]),
  history: z.string().optional(),
  current_status: z.enum([
    "ACTIVE", "ESTRANGED", "BROKEN", "HEALING", "STRENGTHENING",
    "DETERIORATING", "UNKNOWN"
  ]),
  influence_level: z.enum([
    "MINIMAL", "MINOR", "MODERATE", "SIGNIFICANT", "MAJOR", "DEFINING"
  ]),
  secrets: z.string().optional(),
  future_potential: z.string().optional()
});

export type RelationshipType = z.infer<typeof RelationshipTypeEnum>;
export type Relationship = z.infer<typeof RelationshipSchema>;
