import { getPriceId } from "../payment/prices";

export interface CreditPack {
  id: string;
  name: string;
  description: string;
  amount: number;
  priceInCents: number;
  isPopular?: boolean;
  isBestValue?: boolean;
  bonusAmount?: number;
}

export const CREDIT_PACKS: CreditPack[] = [
  {
    id: "small",
    name: "Utils.CreditPacks.Small.Name", // Discover
    description: "Utils.CreditPacks.Small.Description", // 20
    amount: 20,
    priceInCents: 299, // 2,99
  },
  {
    id: "medium",
    name: "Utils.CreditPacks.Medium.Name", // Adventurer
    description: "Utils.CreditPacks.Medium.Description", // 55
    amount: 55,
    priceInCents: 599, // 5,99
    isPopular: true
  },
  {
    id: "large",
    name: "Utils.CreditPacks.Large.Name", // Creator
    description: "Utils.CreditPacks.Large.Description", // 135
    amount: 135,
    bonusAmount: 15, // +15
    priceInCents: 1299, // 12,99
  },
  {
    id: "xlarge",
    name: "Utils.CreditPacks.XLarge.Name", // Narrator Pack
    description: "Utils.CreditPacks.XLarge.Description", // 350
    amount: 350,
    bonusAmount: 50, // +50
    priceInCents: 2899, // 28,99
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

export function getCreditPackPriceId(packId: string): string {
  try {
    return getPriceId(packId as any);
  } catch (e) {
    const isProd = process.env.NODE_ENV === 'production';
    return isProd ? `price_${packId}` : `price_test_${packId}`;
  }
}

export function getCreditPackById(packId: string): CreditPack | undefined {
  return CREDIT_PACKS.find(pack => pack.id === packId);
}