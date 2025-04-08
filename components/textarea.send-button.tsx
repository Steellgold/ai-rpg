"use client";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowUpIcon, Loader } from 'lucide-react';
import { cn } from "@/lib/utils";
import { calculateTotalCreditCost, GENERATION_FEATURES, GenerationFeatureType } from "@/lib/features/generation-features";
import { useTranslations } from "next-intl";

interface EnhancedSendButtonProps {
  isGenerating: boolean;
  isInputValid: boolean;
  handleSend: () => void;
  activeFeatures: GenerationFeatureType[];
  promptLength: number;
  generateText: string;
  calculateCreditCost: number;
  creditHave: number;
}

export const EnhancedSendButton = ({
  isGenerating, isInputValid,
  handleSend,
  activeFeatures,
  promptLength,
  generateText,
  calculateCreditCost,
  creditHave
}: EnhancedSendButtonProps) => {
  const lengthCost = Math.floor(promptLength / 500);
  const baseCost = calculateTotalCreditCost(activeFeatures);

  const u = useTranslations();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={handleSend}
            disabled={!isInputValid}
            className={cn(
              "rounded-full transition-opacity flex items-center gap-2", {
                "!h-8 !w-8": !isInputValid || isGenerating,
                "!h-8 !px-4": isInputValid && !isGenerating,
                "cursor-not-allowed": !isInputValid,
                "bg-blue-600 hover:bg-blue-500": !isGenerating || isInputValid,
                "cursor-not-allowed bg-blue-600/50 hover:bg-blue-600/50": isGenerating,
                "text-white": true
              }
            )}
          >
            <div className="flex items-center gap-2">
              {isGenerating ? <Loader className="animate-spin h-4 w-4 text-white" /> : <ArrowUpIcon className="h-4 w-4 text-white" />}
              {isInputValid && !isGenerating && <span>{generateText}</span>}
            </div>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top" className="w-64 bg-white py-3 px-3 rounded-lg shadow-md text-gray-800">
          <div className="space-y-1">
            <div className="space-y-1">
              <p className="text-sm font-medium">Détails des crédits</p>
              {activeFeatures.map((featureId) => {
                if (!featureId) return null;
                if (!GENERATION_FEATURES[featureId]) return null;
                if (!GENERATION_FEATURES[featureId].creditCost) return null;
                if (GENERATION_FEATURES[featureId].creditCost == 0) return null;

                return (
                  <div key={featureId} className="flex justify-between text-sm">
                    <span>{u(GENERATION_FEATURES[featureId].name)}</span>
                    <span>{GENERATION_FEATURES[featureId].creditCost} crédits</span>
                  </div>
                )
              })}
            </div>

            {lengthCost > 0 && (
              <div className="flex justify-between text-sm">
                <span>Longueur du prompt</span>
                <span>+{lengthCost}</span>
              </div>
            )}

            <div className="my-2 border-t border-[#00000010]" />

            <div>
              <div className="flex justify-between text-sm font-medium">
                <span>Crédits disponibles</span>
                <span>{creditHave} crédits</span>
              </div>

              <div className="flex justify-between text-sm font-medium">
                <span></span>
                <span className="text-red-600">-{calculateCreditCost} crédits</span>
              </div>

              <div className="flex justify-between text-sm font-medium">
                <span></span>
                <span>{creditHave - calculateCreditCost} crédits</span>
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
