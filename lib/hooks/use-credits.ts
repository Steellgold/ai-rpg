"use client";

import { useEffect, useState } from "react";

export const useCredits = (): { credits: number; loading: boolean } => {
  const [credits, setCredits] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCredits = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/user-credits');
        const data = await response.json();
        setCredits(data.credits);
      } catch (error) {
        console.error('Erreur lors de la récupération des crédits :', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCredits();
  }, []);

  return { credits, loading };
};