"use client";

import { useState } from "react";

export type CreditPackage = {
  id: string;
  name: string;
  credits: number;
  price: number;
  currency: string;
};

export const useStripe = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCheckoutSession = async (packageId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ packageId }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getCreditPackages = async (): Promise<CreditPackage[]> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/stripe/packages");
      if (!response.ok) {
        throw new Error("Failed to fetch credit packages");
      }

      const data = await response.json();
      return data.packages;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createCheckoutSession,
    getCreditPackages,
  };
}; 