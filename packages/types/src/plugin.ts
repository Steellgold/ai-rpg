export enum PluginType {
  NARRATIVE = "NARRATIVE",
  INTRIGUE = "INTRIGUE",
  CHARACTER = "CHARACTER",
  WORLD = "WORLD",
  OBJECT = "OBJECT",
  THEME = "THEME",
  STYLE = "STYLE",
  MECHANICS = "MECHANICS"
}

export enum Pricing {
  FREE = "FREE",
  CREDITS = "CREDITS",
  PAID = "PAID",
}

export type Plugin = {
  id: string;
  title: string;
  description: string;
  icon?: string;
  banner?: string;
  
  version: string;
  createdAt: Date;
  updatedAt: Date;
  downloads: number;
  likes: number;
  rating?: number;
  
  authorId: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  
  configuration: any;
  code: string;
  examples?: string;
  
  type: PluginType;
  tags: Array<{
    id: string;
    name: string;
  }>;
  
  status: "PENDING" | "APPROVED" | "REJECTED";
  approved: boolean;
  featured: boolean;
  isOfficial: boolean;
  
  pricing: Pricing;
  creditPrice?: number;
  dollarPrice?: number;
  usageCredits?: number;
  promptTokens?: number;

  stripeProductId?: string;
  stripePriceId?: string;
}

export type PluginStatus = "PENDING" | "APPROVED" | "REJECTED";

export type SearchPluginsParams = {
  query?: string;
  type?: PluginType;
  pricing?: Pricing;
  authorId?: string;
  featured?: boolean;
  tags?: string[];
  limit?: number;
  offset?: number;
}

export type SearchPluginsResult = {
  plugins: Plugin[];
  total: number;
  pageCount: number;
}