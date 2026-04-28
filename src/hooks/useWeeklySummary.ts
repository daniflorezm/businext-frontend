"use client";
import useSWR from "swr";
import type { WeeklySummaryData } from "@/lib/intelligence/types";
import { fetcher } from "@/lib/fetcher";

const SWR_KEY = "/api/intelligence/summary";

export function useWeeklySummary() {
  const {
    data: summary,
    isLoading: loading,
    error,
    mutate,
  } = useSWR<WeeklySummaryData>(SWR_KEY, fetcher);

  const generateSummary = async (): Promise<WeeklySummaryData | null> => {
    try {
      const response = await fetch("/api/intelligence/summary/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || err.error || "Error al generar el resumen");
      }
      const data: WeeklySummaryData = await response.json();
      await mutate(data, { revalidate: false });
      return data;
    } catch (e) {
      throw e;
    }
  };

  return { summary, loading, error, generateSummary, mutate };
}
