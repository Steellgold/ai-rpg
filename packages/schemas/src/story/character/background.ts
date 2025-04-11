import { z } from "zod";

export const SocialClassEnum = z.enum([
  "NOBILITY", "ROYALTY", "CLERGY", "MERCHANT", "ARTISAN", "SCHOLAR",
  "MILITARY", "COMMON", "PEASANT", "SERVANT", "SLAVE", "OUTCAST",
  "CRIMINAL", "ORPHAN", "NOMADIC", "TRIBAL", "FOREIGN",
  "REFUGEE", "UNKNOWN"
]);

export const EducationLevelEnum = z.enum([
  "NONE", "BASIC", "APPRENTICE", "MILITARY", "RELIGIOUS",
  "ACADEMIC", "SPECIALIST", "MASTER", "MYSTICAL", "SELF_TAUGHT"
]);

export const BackgroundSchema = z.object({
  social_class: SocialClassEnum,
  education: EducationLevelEnum,
  hometown: z.string().optional(),
  upbringing: z.string().min(10).max(200),
  family_status: z.enum([
    "ORPHANED", "ABANDONED", "SINGLE_PARENT", "BOTH_PARENTS", "ADOPTED",
    "COMMUNAL", "INSTITUTIONAL", "NOBLE_HOUSEHOLD", "COMPLICATED",  "EXTENDED_FAMILY"
  ]),
  cultural_heritage: z.string().optional(),
  religion: z.string().optional(),
  occupation: z.string(),
  defining_event: z.string().min(10).max(200).optional(),
  social_connections: z.array(z.string()).optional(),
  wealth_status: z.enum([
    "DESTITUTE", "POOR", "MODEST", "COMFORTABLE",
    "WEALTHY", "AFFLUENT", "ARISTOCRATIC"
  ]).optional(),
  notable_possessions: z.array(z.string()).optional(),
  specialized_knowledge: z.array(z.string()).optional()
});

export type SocialClass = z.infer<typeof SocialClassEnum>;
export type EducationLevel = z.infer<typeof EducationLevelEnum>;
export type Background = z.infer<typeof BackgroundSchema>;
