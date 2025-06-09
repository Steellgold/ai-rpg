import { z } from "zod";

export const MaterialEnum = z.enum([
  "COTTON", "LINEN", "SILK", "WOOL", "LEATHER", "FUR", "VELVET", "SATIN",
  "DENIM", "SYNTHETIC", "METAL", "DIAMOND", "GOLD", "SILVER", "BRONZE",
  "IRON", "STEEL", "RUBY", "EMERALD", "SAPPHIRE", "BONE", "WOOD", "STONE",
  "CRYSTAL", "MAGIC_INFUSED", "DRAGON_SCALE", "MITHRIL", "ADAMANTIUM", "PAPER", "GLASS"
]);

export const ClothingStyleEnum = z.enum([
  "MEDIEVAL",  "RENAISSANCE", "VICTORIAN", "STEAMPUNK", "CYBERPUNK", "FUTURISTIC", "TRADITIONAL", "MODERN",
  "CASUAL", "FORMAL", "MILITARY", "RELIGIOUS", "TRIBAL", "ROYAL", "PEASANT", "MERCHANT", "ADVENTURER",
  "WIZARD", "SCHOLAR", "WARRIOR", "ASSASSIN", "HUNTER", "NOMADIC", "SEAFARER", "WASTELAND",
  "ELVEN", "DWARVEN", "ORCISH", "DEMONIC", "ANGELIC"
]);

export const ColorEnum = z.enum([
  "RED", "BLUE", "GREEN", "YELLOW", "PURPLE", "ORANGE", "PINK", "BROWN", "BLACK", "WHITE", "GRAY",
  "SILVER", "GOLD", "BRONZE", "COPPER", "TEAL", "NAVY", "CRIMSON", "BURGUNDY", "TURQUOISE", "EMERALD",
  "RUBY", "SAPPHIRE", "AMBER", "IVORY", "CREAM", "TAN", "OLIVE", "INDIGO", "LAVENDER", "MINT",
  "JADE", "PEARL", "TRANSPARENT", "MULTICOLORED"
]);

export const TextureEnum = z.enum([
  "SMOOTH", "ROUGH", "SOFT", "HARD", "SHINY", "MATTE", "EMBOSSED",
  "EMBROIDERED", "PATTERNED", "STRIPED", "CHECKERED", "FLORAL", "GEOMETRIC",
  "STUDDED", "SPIKED", "CHAINMAIL", "SCALED", "PLATED",
  "DISTRESSED", "POLISHED", "WORN", "NEW", "PATCHED", "WOVEN", "KNITTED",
  "FRAYED", "CRACKED", "TATTERED", "RIPPED", "PRISTINE"
]);

export const ClothingConditionEnum = z.enum([
  "NEW", "LIKE_NEW", "GOOD", "WORN", "DAMAGED", "TATTERED",
  "REPAIRED", "MODIFIED", "MAGICAL", "CURSED"
]);

export const ClothingItemSchema = z.object({
  type: z.string(),
  material: MaterialEnum.optional(),
  color: ColorEnum.optional(),
  secondary_color: ColorEnum.optional(),
  texture: TextureEnum.optional(),
  condition: ClothingConditionEnum.optional(),
  description: z.string().optional(),
  magical_properties: z.string().optional(),
  origin: z.string().optional(),
  sentimental_value: z.string().optional(),
  special_features: z.array(z.string()).optional()
});

export const AccessorySchema = z.object({
  type: z.string(),
  material: MaterialEnum.optional(),
  color: ColorEnum.optional(),
  description: z.string().optional(),
  magical_properties: z.string().optional(),
  location: z.string().optional(),
  special_features: z.array(z.string()).optional()
});

export const HairstyleSchema = z.object({
  length: z.enum([
    "BALD", "SHAVED", "VERY_SHORT", "SHORT",
    "MEDIUM", "LONG", "VERY_LONG"
  ]),
  color: ColorEnum,
  style: z.string().optional(),
  description: z.string().optional()
});

export const WeaponSchema = z.object({
  type: z.string(),
  material: MaterialEnum.optional(),
  appearance: z.string().optional(),
  magical_properties: z.string().optional(),
  condition: ClothingConditionEnum.optional(),
  origin: z.string().optional()
});

export const ArmorSchema = z.object({
  type: z.string(),
  material: MaterialEnum,
  coverage: z.enum([
    "LIGHT", "MEDIUM",
    "HEAVY", "PARTIAL"
  ]),
  color: ColorEnum.optional(),
  decoration: z.string().optional(),
  magical_properties: z.string().optional(),
  condition: ClothingConditionEnum,
  origin: z.string().optional()
});

export const BodyMarkSchema = z.object({
  type: z.enum([
    "TATTOO", "SCAR", "BIRTHMARK", "BRAND",
    "MAGICAL_MARK", "RITUAL_MARK", "TRIBAL_PAINT",
    "MAKEUP"
  ]),
  location: z.string(),
  description: z.string(),
  significance: z.string().optional()
});

export const OutfitSchema = z.object({
  style: ClothingStyleEnum,
  clothing: z.array(ClothingItemSchema),
  accessories: z.array(AccessorySchema).optional(),
  hairstyle: HairstyleSchema.optional(),
  weapons: z.array(WeaponSchema).optional(),
  armor: ArmorSchema.optional(),
  body_marks: z.array(BodyMarkSchema).optional(),
  overall_appearance: z.string(),
  distinguishing_features: z.array(z.string()).optional(),
  cultural_significance: z.string().optional(),
  weather_adaptation: z.enum([
    "COLD", "HOT", "VERSATILE", "RAIN",
    "SNOW", "DESERT", "AQUATIC"
  ]).optional()
});

export type Material = z.infer<typeof MaterialEnum>;
export type ClothingStyle = z.infer<typeof ClothingStyleEnum>;
export type Color = z.infer<typeof ColorEnum>;
export type Texture = z.infer<typeof TextureEnum>;
export type ClothingCondition = z.infer<typeof ClothingConditionEnum>;
export type OutfitType = z.infer<typeof OutfitSchema>;
