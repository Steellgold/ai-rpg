export type CreditPackId = "small" | "medium" | "large" | "xlarge";

const CREDIT_PACK_PRICE_IDS: Record<"development" | "production", Record<CreditPackId, string>> = {
  development: {
    small: "price_1RBsuLI1IWkhFRDRDpk1jArf",
    medium: "price_1RBsxII1IWkhFRDRuDJakxzY",
    large: "price_1RBsyBI1IWkhFRDRGKDSVJ2f",
    xlarge: "price_1RBsyqI1IWkhFRDR4rF6bx3A"
  },
  production: {
    small: "",
    medium: "",
    large: "",
    xlarge: ""
  }
};

const currentEnvironment = process.env.NODE_ENV === "production" ? "production" : "development";

export const getPriceId = (packId: CreditPackId): string => {
  return CREDIT_PACK_PRICE_IDS[currentEnvironment][packId];
};

export const PRICE_IDS = CREDIT_PACK_PRICE_IDS[currentEnvironment];