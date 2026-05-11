import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { LocationData, LocationCreate, LocationUpdate } from "@/lib/location/types";

export function useLocations() {
  const { data, error, isLoading, mutate } = useSWR<LocationData[]>(
    "/api/locations",
    fetcher,
    { dedupingInterval: 60_000 },
  );

  const createLocation = async (input: LocationCreate): Promise<LocationData | null> => {
    try {
      const response = await fetch("/api/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Error al crear el local");
      }
      const created = (await response.json()) as LocationData;
      await mutate();
      return created;
    } catch {
      return null;
    }
  };

  const updateLocation = async (
    id: number,
    input: LocationUpdate,
  ): Promise<LocationData | null> => {
    try {
      const response = await fetch(`/api/locations?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Error al actualizar el local");
      }
      const updated = (await response.json()) as LocationData;
      await mutate();
      return updated;
    } catch {
      return null;
    }
  };

  const deleteLocation = async (id: number): Promise<boolean> => {
    try {
      const response = await fetch(`/api/locations?id=${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Error al eliminar el local");
      }
      await mutate();
      return true;
    } catch {
      return false;
    }
  };

  return {
    locations: data ?? [],
    loading: isLoading,
    error,
    createLocation,
    updateLocation,
    deleteLocation,
    mutate,
  };
}
