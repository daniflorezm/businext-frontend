"use client";
import useSWR from "swr";
import {
  WorkingHours,
  mapWorkingHoursFromApi,
  mapWorkingHoursToApi,
} from "@/lib/working-hours/types";
import { fetcher } from "@/lib/fetcher";

const SWR_KEY = "/api/working-hours";

const workingHoursFetcher = (url: string) =>
  fetcher<Record<string, unknown>[]>(url).then((data) =>
    data.map(mapWorkingHoursFromApi)
  );

export function useWorkingHours() {
  const {
    data: workingHoursData = [],
    isLoading: loading,
    error,
    mutate,
  } = useSWR<WorkingHours[]>(SWR_KEY, workingHoursFetcher);

  const updateWorkingHours = async (
    hours: WorkingHours[]
  ): Promise<WorkingHours[] | null> => {
    const apiData = hours.map(mapWorkingHoursToApi);
    try {
      await mutate(
        async () => {
          const response = await fetch("/api/working-hours", {
            method: "PUT",
            body: JSON.stringify(apiData),
            headers: { "Content-Type": "application/json" },
          });
          if (!response.ok) throw new Error("Failed to update working hours");
          const data = await response.json();
          return (data as Record<string, unknown>[]).map(
            mapWorkingHoursFromApi
          );
        },
        {
          optimisticData: hours,
          rollbackOnError: true,
          revalidate: false,
        }
      );
      return hours;
    } catch {
      return null;
    }
  };

  return {
    workingHoursData,
    loading,
    error,
    updateWorkingHours,
  };
}
