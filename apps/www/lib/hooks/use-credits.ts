"use client";

import { useEffect, useState, useCallback } from "react";

export const useCredits = (): { 
  credits: number; 
  loading: boolean; 
  refetch: () => Promise<void> 
} => {
  const [credits, setCredits] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCredits = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/auth/user-credits");
      const data = await response.json();
      setCredits(data.credits);
    } catch (error) {
      console.error("Error fetching credits:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  return { credits, loading, refetch: fetchCredits };
};