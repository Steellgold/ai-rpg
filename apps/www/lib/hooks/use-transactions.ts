"use client";

import { useEffect, useState } from "react";

export type Transaction = {
  id: string;
  amount: number;
  balanceAfter: number;
  description: string;
  transactionType: string;
  createdAt: string;
};

export const useTransactions = (limit: number = 5) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/transactions?limit=${limit}`);
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      const data = await response.json();
      setTransactions(data.transactions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [limit]);

  return { transactions, loading, error, refetch: fetchTransactions };
}; 