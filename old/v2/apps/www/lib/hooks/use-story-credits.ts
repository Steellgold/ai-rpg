"use client";

import { useCallback, useState } from "react";
import { StoryToolsConfig } from '@/components/story/story-tool';
import { useCredits } from './use-credits';

export const useStoryCredits = () => {
  const { credits, loading, refetch } = useCredits();
  const [isChecking, setIsChecking] = useState(false);

  const calculateTotalCost = useCallback((config: StoryToolsConfig): number => {
    const costs = {
      forChildren: 2,
      withItems: 5,
      betterCharacters: 8,
      multipleArcs: 12,
      withConflicts: 6,
    };

    return Object.entries(config).reduce((sum, [key, value]) => {
      return value ? sum + costs[key as keyof StoryToolsConfig] : sum;
    }, 0);
  }, []);

  const hasEnoughCredits = useCallback((config: StoryToolsConfig): boolean => {
    const totalCost = calculateTotalCost(config);
    return credits >= totalCost;
  }, [credits, calculateTotalCost]);

  const checkAndDeductCredits = useCallback(async (config: StoryToolsConfig): Promise<boolean> => {
    if (loading || isChecking) return false;
    
    setIsChecking(true);
    try {
      const totalCost = calculateTotalCost(config);
      
      if (credits < totalCost) {
        return false;
      }

      const response = await fetch('/api/credits/deduct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: totalCost,
          description: 'Story generation with tools',
          features: Object.entries(config)
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            .filter(([_, enabled]) => enabled)
            .map(([feature]) => feature),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to deduct credits');
      }

      await refetch();
      return true;
    } catch (error) {
      console.error('Error deducting credits:', error);
      return false;
    } finally {
      setIsChecking(false);
    }
  }, [credits, loading, isChecking, calculateTotalCost, refetch]);

  return {
    credits,
    loading,
    isChecking,
    calculateTotalCost,
    hasEnoughCredits,
    checkAndDeductCredits,
  };
}; 