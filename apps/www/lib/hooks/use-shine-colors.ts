import { useMemo } from "react";

export interface ShineFeatureStates {
  forChildren?: boolean;
  withItems?: boolean;
  betterCharacters?: boolean;
  multipleArcs?: boolean;
  withConflicts?: boolean;
}

export const useShineColors = ({
  forChildren,
  withItems,
  betterCharacters,
  multipleArcs,
  withConflicts
}: ShineFeatureStates): string[] => {
  return useMemo(() => {
    const base = ["#fff"];
    
    if (forChildren) base.push("#0f9b8e");
    if (withItems) base.push("#4f46e5");
    if (betterCharacters) base.push("#f97316");
    if (multipleArcs) base.push("#c27aff");
    if (withConflicts) base.push("#ef4444");

    base.push("#fff");
    return base;
  }, [forChildren, withItems, betterCharacters, multipleArcs, withConflicts]);
};