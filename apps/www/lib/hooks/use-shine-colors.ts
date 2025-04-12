import { useMemo } from "react";

export interface ShineFeatureStates {
  forChildren?: boolean;
  withItems?: boolean;
  betterCharacters?: boolean;
}

export const useShineColors = ({ forChildren, withItems, betterCharacters }: ShineFeatureStates): string[] => {
  return useMemo(() => {
    const base = ["#fff"];
    if (forChildren) base.push("#0f9b8e");
    if (withItems) base.push("#4f46e5");
    if (betterCharacters) base.push("#f97316");

    base.push("#fff");
    return base;
  }, [forChildren, withItems, betterCharacters]);
};