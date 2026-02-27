"use client";
import { useState } from "react";
import useSWR from "swr";
import { Finances, AnualBalances } from "@/lib/finances/types";
import { fetcher } from "@/lib/fetcher";
import { createClient } from "@/utils/supabase/client";

const SWR_KEY = "/api/finances";

export function useFinances() {
  const {
    data: financesData = [],
    isLoading: swrLoading,
    error,
    mutate,
  } = useSWR<Finances[]>(SWR_KEY, fetcher);

  const [anualFinancesData, setAnualFinancesData] = useState<AnualBalances[]>(
    []
  );
  const [anualLoading, setAnualLoading] = useState(false);

  const loading = swrLoading || anualLoading;

  const supabase = createClient();

  const getAllFinances = () => mutate();

  const getAnualFinances = async (year: string) => {
    try {
      setAnualLoading(true);
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
      if (!response.ok) throw new Error("Failed to fetch annual finances");
      const data = await response.json();
      setAnualFinancesData(data);
      return data;
    } catch {
      return null;
    } finally {
      setAnualLoading(false);
    }
  };

  const createFinance = async (
    newFinance: Omit<Finances, "id">
  ): Promise<Finances | null> => {
    try {
      const response = await fetch("/api/finances", {
        method: "POST",
        body: JSON.stringify(newFinance),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to create finance");
      const data = await response.json();
      await mutate();
      return data;
    } catch {
      return null;
    }
  };

  const deleteFinance = async (id: number) => {
    try {
      const response = await fetch(`/api/finances?id=${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to delete finance");
      await mutate();
      return response.json();
    } catch {
      return null;
    }
  };

  const updateFinance = async (finance: Finances) => {
    try {
      const { id, ...updateData } = finance;
      const response = await fetch(`/api/finances?id=${id}`, {
        method: "PATCH",
        body: JSON.stringify(updateData),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to update finance");
      await mutate();
      return response.json();
    } catch {
      return null;
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
