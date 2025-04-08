"use server";

import { GenerationFeatureType, calculateTotalCreditCost } from "@/lib/features/generation-features";

interface CreditCostParams {
  activeFeatures: GenerationFeatureType[];
  promptLength: number;
}

export const calculateServerCreditCost = async(params: CreditCostParams): Promise<number> => {
  const { activeFeatures, promptLength } = params;
  
  const baseFeatureCost = calculateTotalCreditCost(activeFeatures);
  const lengthCost = Math.floor(promptLength / 500);

  const totalCost = baseFeatureCost + lengthCost;

  return totalCost;
};

export const validateCreditCost = async(clientCost: number, params: CreditCostParams): Promise<number> => {
  const serverCost = await calculateServerCreditCost(params);
  
  if (clientCost !== serverCost) {
    console.warn(`Client cost (${clientCost}) differs from server cost (${serverCost}). Using server calculation.`);
    return serverCost;
  }
  
  return clientCost;
};