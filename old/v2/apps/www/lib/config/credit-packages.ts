export type CreditPackage = {
  id: string;
  name: string;
  description: string;
  credits: number;
  bonusCredits?: number;
  price: number;
  currency: string;
  image: string;
  popular?: boolean;
  discount?: {
    percentage: number;
    originalPrice: number;
  };
};

export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: "decouverte",
    name: "Discovery Pack",
    description: "Take your first steps into a universe of infinite possibilities",
    credits: 20,
    price: 2.99,
    currency: "EUR",
    image: "/assets/packages/p1.png",
  },
  {
    id: "aventurier",
    name: "Adventurer Pack",
    description: "Unleash your imagination and start shaping your stories",
    credits: 55,
    price: 5.99,
    currency: "EUR",
    image: "/assets/packages/p2.png",
    popular: true,
  },
  {
    id: "createur",
    name: "Creator Pack",
    description: "Create unique worlds, unforgettable characters, vibrant stories",
    credits: 135,
    bonusCredits: 15,
    price: 12.99,
    currency: "EUR",
    image: "/assets/packages/p3.png",
  },
  {
    id: "narrateur",
    name: "Storyteller Pack",
    description: "Master the art of storytelling, the legend begins here",
    credits: 350,
    bonusCredits: 50,
    price: 28.99,
    currency: "EUR",
    image: "/assets/packages/p4.png",
  }
];

// Helper functions
export const getPackageById = (id: string): CreditPackage | undefined => {
  return CREDIT_PACKAGES.find(pkg => pkg.id === id);
};

export const getPopularPackages = (): CreditPackage[] => {
  return CREDIT_PACKAGES.filter(pkg => pkg.popular);
};

export const getPackagesByPriceRange = (min: number, max: number): CreditPackage[] => {
  return CREDIT_PACKAGES.filter(pkg => pkg.price >= min && pkg.price <= max);
};

export const getBestValuePackage = (): CreditPackage => {
  return CREDIT_PACKAGES.reduce((best, current) => {
    const bestValue = best.credits / best.price;
    const currentValue = current.credits / current.price;
    return currentValue > bestValue ? current : best;
  });
}; 