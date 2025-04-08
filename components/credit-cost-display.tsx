"use client";

import { Component } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Coins } from "lucide-react";
import { useTranslations } from "next-intl";
import { calculateTotalCreditCost, GenerationFeatureType } from "@/lib/features/generation-features";

type CreditCostDisplayProps = {
  activeFeatures: GenerationFeatureType[];
  promptLength: number;
  isPremium?: boolean;
};

export const CreditCostDisplay: Component<CreditCostDisplayProps> = ({ 
  activeFeatures, 
  promptLength, 
  isPremium = false 
}) => {
  const t = useTranslations("Utils.CreditCost");
  
  const baseFeatureCost = calculateTotalCreditCost(activeFeatures);
  const lengthCost = Math.floor(promptLength / 500);
  const totalCost = baseFeatureCost + lengthCost;
  const finalCost = isPremium ? Math.max(1, Math.ceil(totalCost * 0.9)) : totalCost;

  return (
    <Badge 
      variant="outline" 
      className="gap-1.5 py-1 px-2 text-xs flex items-center"
    >
      <Coins className="h-3.5 w-3.5" />
      {t("cost", { count: finalCost })}

      {isPremium && totalCost !== finalCost && (
        <span className="ml-1.5 text-green-400 text-[10px]">
          ({t("discount")})
        </span>
      )}
      
      {promptLength >= 500 && (
        <span className="ml-1.5 text-gray-400 text-[10px]">
          +{lengthCost}
        </span>
      )}
    </Badge>
  );
};