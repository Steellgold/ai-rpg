export enum SubscriptionTier {
  BASIC = "basic",
  STARTER = "starter",
  CREATOR = "creator",
  PROFESSIONAL = "pro"
}

export type SubscriptionPlan = {
  id: SubscriptionTier;
  name: string;
  description: string;
  monthlyPriceInCents: number;
  yearlyPriceInCents: number;
  currency: string;
  features: string[];
  monthlyCredits: number;
  maxGenerationsPerDay?: number;
  priorityLevel: number;
  isPopular?: boolean;
  color?: string;
  maxStories?: number | null; // null for unlimited
}

export const SUBSCRIPTION_PLANS: Record<SubscriptionTier, SubscriptionPlan> = {
  [SubscriptionTier.BASIC]: {
    id: SubscriptionTier.BASIC,
    name: "Utils.Subscription.Tiers.Basic.Name", // Free
    description: "Utils.Subscription.Tiers.Basic.Description", // For start to explore
    monthlyPriceInCents: 0,
    yearlyPriceInCents: 0,
    currency: "EUR",
    features: [
      "Utils.Subscription.Tiers.Basic.Features.InitialCredits", // 5 initial credits
      "Utils.Subscription.Tiers.Basic.Features.BasicStories", // Basic stories
      "Utils.Subscription.Tiers.Basic.Features.LimitedGenerations", // 3 generations per day
      "Utils.Subscription.Tiers.Basic.Features.BasicFeatures" // Basic features
    ],
    monthlyCredits: 0,  // No monthly renewal
    maxGenerationsPerDay: 3,
    priorityLevel: 0,
    maxStories: 3
  },
  
  [SubscriptionTier.STARTER]: {
    id: SubscriptionTier.STARTER,
    name: "Utils.Subscription.Tiers.Starter.Name", // Starter
    description: "Utils.Subscription.Tiers.Starter.Description", // For occasional creators
    monthlyPriceInCents: 499, // $4.99/month
    yearlyPriceInCents: 4990, // $49.90/year (≈ $4.16/month)
    currency: "EUR",
    features: [
      "Utils.Subscription.Tiers.Starter.Features.MonthlyCredits", // 30 credits per month
      "Utils.Subscription.Tiers.Starter.Features.BannerImages", // Banner images
      "Utils.Subscription.Tiers.Starter.Features.LimitedSceneImages", // Limited scene images
      "Utils.Subscription.Tiers.Starter.Features.ImprovedPriority", // Improved generation priority
      "Utils.Subscription.Tiers.Starter.Features.BasicItemSystem" // Basic item system
    ],
    monthlyCredits: 30,
    priorityLevel: 1,
    maxStories: 10
  },
  
  [SubscriptionTier.CREATOR]: {
    id: SubscriptionTier.CREATOR,
    name: "Utils.Subscription.Tiers.Creator.Name", // Creator
    description: "Utils.Subscription.Tiers.Creator.Description", // For passionate authors
    monthlyPriceInCents: 999, // $9.99/month
    yearlyPriceInCents: 9990, // $99.90/year (≈ $8.33/month)
    currency: "EUR",
    features: [
      "Utils.Subscription.Tiers.Creator.Features.MonthlyCredits", // 100 credits per month
      "Utils.Subscription.Tiers.Creator.Features.AllImages", // All images (banners, scenes, items)
      "Utils.Subscription.Tiers.Creator.Features.HighPriority", // High generation priority
      "Utils.Subscription.Tiers.Creator.Features.ComplexCharacters", // Complex characters
      "Utils.Subscription.Tiers.Creator.Features.LongStories", // Long stories
      "Utils.Subscription.Tiers.Creator.Features.AdvancedItemSystem" // Advanced item system
    ],
    monthlyCredits: 100,
    priorityLevel: 2,
    isPopular: true,
    color: "#3482F6",
    maxStories: null // Unlimited
  },
  
  [SubscriptionTier.PROFESSIONAL]: {
    id: SubscriptionTier.PROFESSIONAL,
    name: "Utils.Subscription.Tiers.Professional.Name", // Professional
    description: "Utils.Subscription.Tiers.Professional.Description", // For serious content creators
    monthlyPriceInCents: 1999, // $19.99/year
    yearlyPriceInCents: 19990, // $199.90/year (≈ $16.66/month)
    currency: "EUR",
    features: [
      "Utils.Subscription.Tiers.Professional.Features.MonthlyCredits", // 250 credits per month
      "Utils.Subscription.Tiers.Professional.Features.AllPremiumFeatures", // All premium features
      "Utils.Subscription.Tiers.Professional.Features.MaximumPriority", // Maximum generation priority
      "Utils.Subscription.Tiers.Professional.Features.DedicatedSupport", // Dedicated support
      "Utils.Subscription.Tiers.Professional.Features.AdvancedExport", // Advanced export
      "Utils.Subscription.Tiers.Professional.Features.TotalCustomization" // Total customization
    ],
    monthlyCredits: 250,
    priorityLevel: 3,
    color: "#9333EA",
    maxStories: null // Unlimited
  }
};

export interface CreditPack {
  id: string;
  name: string;
  description: string;
  amount: number;
  priceInCents: number; 
  currency: string;
  isPopular?: boolean;
  isBestValue?: boolean;
  bonusAmount?: number;
}

export const CREDIT_PACKS: CreditPack[] = [
  {
    id: "small",
    name: "Utils.CreditPacks.Small.Name", // Starter Pack
    description: "Utils.CreditPacks.Small.Description", // 20 credits to get started
    amount: 20,
    priceInCents: 499, // $4.99€
    currency: "EUR"
  },
  {
    id: "medium",
    name: "Utils.CreditPacks.Medium.Name", // Standard Pack
    description: "Utils.CreditPacks.Medium.Description", // 50 credits to develop your stories
    amount: 50,
    priceInCents: 999, // $9.99€
    currency: "EUR",
    isPopular: true
  },
  {
    id: "large",
    name: "Utils.CreditPacks.Large.Name", // Premium Pack
    description: "Utils.CreditPacks.Large.Description", // 120 credits for elaborate stories
    amount: 120,
    bonusAmount: 10, // 10 bonus credits
    priceInCents: 1999, // $19.99
    currency: "EUR"
  },
  {
    id: "xlarge",
    name: "Utils.CreditPacks.XLarge.Name", // Creator Pack
    description: "Utils.CreditPacks.XLarge.Description", // 300 credits for serious authors
    amount: 300,
    bonusAmount: 50, // 50 bonus credits
    priceInCents: 3999, // $39.99
    currency: "EUR",
    isBestValue: true
  }
];

export function formatPrice(priceInCents: number, currency: string = "EUR", numberFormat = "en-US"): string {
  const formatter = new Intl.NumberFormat(numberFormat, {
    style: "currency",
    currency,
    minimumFractionDigits: 2
  });
  
  return formatter.format(priceInCents / 100);
}

export function calculateYearlySavings(plan: SubscriptionPlan): number {
  const monthlyCostForYear = plan.monthlyPriceInCents * 12;
  return monthlyCostForYear - plan.yearlyPriceInCents;
}

export function calculateYearlySavingsPercentage(plan: SubscriptionPlan): number {
  const monthlyCostForYear = plan.monthlyPriceInCents * 12;
  return Math.round((1 - plan.yearlyPriceInCents / monthlyCostForYear) * 100);
}

export function getCostPerCredit(pack: CreditPack): number {
  const totalCredits = pack.amount + (pack.bonusAmount || 0);
  return pack.priceInCents / totalCredits;
}

export function getBestValueCreditPack(): CreditPack {
  return CREDIT_PACKS.reduce((best, current) => {
    const bestCostPerCredit = getCostPerCredit(best);
    const currentCostPerCredit = getCostPerCredit(current);
    
    return currentCostPerCredit < bestCostPerCredit ? current : best;
  }, CREDIT_PACKS[0]);
}