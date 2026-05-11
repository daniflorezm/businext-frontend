"use client";
import useSWR from "swr";
import {
  WorkingHoursBlock,
  mapWorkingHoursFromApi,
  mapWorkingHoursToApi,
} from "@/lib/working-hours/types";
import { fetcher } from "@/lib/fetcher";

function buildKey(memberUserId?: string | null) {
  if (memberUserId) return `/api/working-hours?member_user_id=${memberUserId}`;
  return "/api/working-hours";
}

const workingHoursFetcher = (url: string) =>
  fetcher<Record<string, unknown>[]>(url).then((data) =>
    data.map(mapWorkingHoursFromApi)
  );

export function useWorkingHours(memberUserId?: string | null, enabled = true) {
  const key = enabled ? buildKey(memberUserId) : null;
  const {
    data: workingHoursData = [],
    isLoading: loading,
    error,
    mutate,
  } = useSWR<WorkingHoursBlock[]>(key, workingHoursFetcher);

  const updateWorkingHours = async (
    hours: WorkingHoursBlock[]
  ): Promise<WorkingHoursBlock[] | null> => {
    const apiData = hours.map(mapWorkingHoursToApi);
    const url = memberUserId
      ? `/api/working-hours?member_user_id=${memberUserId}`
      : "/api/working-hours";
    try {
      await mutate(
        async () => {
          const response = await fetch(url, {
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
