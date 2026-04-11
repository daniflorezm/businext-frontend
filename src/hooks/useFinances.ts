"use client";
import useSWR from "swr";
import { Finances, AnualBalances } from "@/lib/finances/types";
import { fetcher } from "@/lib/fetcher";

const SWR_KEY = "/api/finances";

/**
 * year — when provided, also fetches annual balance data for that year via SWR.
 * Omit it in components that only need CRUD (modals, list items).
 */
export function useFinances(year?: number) {
  const {
    data: financesData = [],
    isLoading: loading,
    error,
    mutate,
  } = useSWR<Finances[]>(SWR_KEY, fetcher);

  const { data: anualFinancesData = [] } = useSWR<AnualBalances[]>(
    year ? `/api/finances/anual/${year}` : null,
    year ? fetcher : null
  );

  const getAllFinances = () => mutate();

  const createFinance = async (
    newFinance: Omit<Finances, "id">
  ): Promise<Finances | null> => {
    const tempId = -Date.now();
    const optimisticItem: Finances = { ...newFinance, id: tempId };
    try {
      await mutate(
        async (current: Finances[] = []) => {
          const response = await fetch("/api/finances", {
            method: "POST",
            body: JSON.stringify(newFinance),
            headers: { "Content-Type": "application/json" },
          });
          if (!response.ok) throw new Error("Failed to create finance");
          const data = await response.json();
          return [...current.filter((f) => f.id !== tempId), data];
        },
        {
          optimisticData: (current: Finances[] = []) => [...current, optimisticItem],
          rollbackOnError: true,
          revalidate: false,
        }
      );
      return optimisticItem;
    } catch {
      return null;
    }
  };

  const deleteFinance = async (id: number): Promise<void> => {
    try {
      await mutate(
        async (current: Finances[] = []) => {
          const response = await fetch(`/api/finances?id=${id}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
          });
          if (!response.ok) throw new Error("Failed to delete finance");
          return current.filter((f) => f.id !== id);
        },
        {
          optimisticData: (current: Finances[] = []) =>
            current.filter((f) => f.id !== id),
          rollbackOnError: true,
          revalidate: false,
        }
      );
    } catch {
      // SWR rollback restores previous state
    }
  };

  const updateFinance = async (finance: Finances): Promise<true | null> => {
    const { id, ...updateData } = finance;
    try {
      await mutate(
        async (current: Finances[] = []) => {
          const response = await fetch(`/api/finances?id=${id}`, {
            method: "PATCH",
            body: JSON.stringify(updateData),
            headers: { "Content-Type": "application/json" },
          });
          if (!response.ok) throw new Error("Failed to update finance");
          const updated = await response.json();
          return current.map((f) => (f.id === id ? updated : f));
        },
        {
          optimisticData: (current: Finances[] = []) =>
            current.map((f) => (f.id === id ? { ...f, ...updateData, id } : f)),
          rollbackOnError: true,
          revalidate: false,
        }
      );
      return true;
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
    createFinance,
    deleteFinance,
    updateFinance,
  };
}
