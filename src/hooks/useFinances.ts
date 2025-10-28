"use client";
import { useState } from "react";
import { Finances, AnualBalances } from "@/lib/finances/types";
import { createClient } from "@/utils/supabase/client";

export function useFinances() {
  const [financesData, setFinancesData] = useState<Finances[]>([]);
  const [anualFinancesData, setAnualFinancesData] = useState<AnualBalances[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const supabase = createClient();

  const getAllFinances: () => Promise<Finances[]> = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/finances`);
      if (!response.ok) {
        throw new Error("Failed to fetch finances");
      }
      const data = await response.json();
      setFinancesData(data);
      return data;
    } catch (error) {
      setError(error as Error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getAnualFinances = async (year: string) => {
    try {
      setLoading(true);
      const { data: sessionData } = await supabase.auth.getSession();
      const jwt = sessionData?.session?.access_token;
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE;
      const response = await fetch(
        `${API_BASE}/finances/anual_finances/${year}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
          },
          credentials: "include",
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch annual finances");
      }
      const data = await response.json();
      setAnualFinancesData(data);
      return data;
    } catch (error) {
      setError(error as Error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createFinance: (
    newFinance: Omit<Finances, "id">
  ) => Promise<Finances> = async (newFinance) => {
    try {
      setLoading(true);
      const response = await fetch("/api/finances", {
        method: "POST",
        body: JSON.stringify(newFinance),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to create finance");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      setError(error as Error);
      return {} as Finances;
    } finally {
      setLoading(false);
    }
  };

  const deleteFinance = async (id: number) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/finances?id=${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to delete finance");
      }
      const result = await response.json();
      return result;
    } catch (error) {
      setError(error as Error);
      return {} as Finances;
    } finally {
      setLoading(false);
    }
  };

  const updateFinance = async (finance: Finances) => {
    try {
      setLoading(true);
      const { id, ...updateData } = finance;
      const response = await fetch(`/api/finances?id=${id}`, {
        method: "PATCH",
        body: JSON.stringify(updateData),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to update finance");
      }
      const result = await response.json();
      return result;
    } catch (error) {
      setError(error as Error);
      return {} as Finances;
    } finally {
      setLoading(false);
    }
  };

  return {
    financesData,
    anualFinancesData,
    loading,
    error,
    getAllFinances,
    getAnualFinances,
    createFinance,
    deleteFinance,
    updateFinance,
  };
}
