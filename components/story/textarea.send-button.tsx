"use client";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowUpIcon, Loader } from 'lucide-react';
import { cn } from "@/lib/utils";
import { GENERATION_FEATURES, GenerationFeatureType } from "@/lib/features/generation-features";
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

  const t = useTranslations("Components.EnhancedSendButton");
  const u = useTranslations();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={handleSend}
            disabled={
              !isInputValid ||
              isGenerating
            }
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
              <p className="text-sm font-medium">{t("creditDetails")}</p>
              {activeFeatures.map((featureId) => {
                if (!featureId) return null;
                if (!GENERATION_FEATURES[featureId]) return null;
                if (!GENERATION_FEATURES[featureId].creditCost) return null;
                if (GENERATION_FEATURES[featureId].creditCost === 0) return null;

                return (
                  <div key={featureId} className="flex justify-between text-sm">
                    <span>{u(GENERATION_FEATURES[featureId].name)}</span>
                    <span>{t("credits", {
                      count: GENERATION_FEATURES[featureId].creditCost,
                      s: GENERATION_FEATURES[featureId].creditCost > 1 ? "s" : ""
                    })}</span>
                  </div>
                )
              })}
            </div>

            {lengthCost > 0 && (
              <div className="flex justify-between text-sm">
                <span>{t("promptLength")}</span>
                <span>{lengthCost} {t("credit", { s: lengthCost > 1 ? "s" : "" })}</span>
              </div>
            )}

            <div className="my-2 border-t border-[#00000010]" />

            <div>
              <div className="flex justify-between text-sm font-medium">
                <span>{t("availableCredits")}</span>
                <span>{t("creditsAmount", { count: creditHave, s: creditHave > 1 ? "s" : "" })}</span>
              </div>

              <div className="flex justify-between text-sm font-medium">
                <span></span>
                <span className="text-red-600">-{t("creditsAmount", { count: calculateCreditCost, s: calculateCreditCost > 1 ? "s" : "" })}</span>
              </div>

              <div className="flex justify-between text-sm font-medium">
                <span></span>
                <span>{t("creditsAmount", { count: Math.max(0, creditHave - calculateCreditCost), s: creditHave - calculateCreditCost > 1 ? "s" : "" })}</span>
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};