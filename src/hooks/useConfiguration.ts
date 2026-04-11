"use client";
import useSWR from "swr";
import { Configuration } from "@/lib/configuration/types";
import { fetcher } from "@/lib/fetcher";
import { mapConfigurationFromApi } from "@/lib/utils";

const SWR_KEY = "/api/configuration";

const configurationFetcher = (url: string) =>
  fetcher<Record<string, unknown>[]>(url).then((data) =>
    data.map(mapConfigurationFromApi)
  );

export function useConfiguration() {
  const {
    data: configurationData = [],
    isLoading: loading,
    error,
    mutate,
  } = useSWR<Configuration[]>(SWR_KEY, configurationFetcher);

  const getAllConfigurations = () => mutate();

  const createConfiguration = async (
    newConfiguration: Omit<Configuration, "id">
  ): Promise<Configuration | null> => {
    const optimistic: Configuration = { ...newConfiguration, id: -1 };
    try {
      await mutate(
        async (current: Configuration[] = []) => {
          const response = await fetch("/api/configuration", {
            method: "POST",
            body: JSON.stringify(newConfiguration),
            headers: { "Content-Type": "application/json" },
          });
          if (!response.ok) throw new Error("Failed to create configuration");
          const data = await response.json();
          return [
            ...current.filter((c) => c.id !== -1),
            mapConfigurationFromApi(data),
          ];
        },
        {
          optimisticData: (current: Configuration[] = []) => [
            ...current,
            optimistic,
          ],
          rollbackOnError: true,
          revalidate: false,
        }
      );
      return optimistic;
    } catch {
      return null;
    }
  };

  const deleteConfiguration = async (id: number) => {
    try {
      await mutate(
        async (current: Configuration[] = []) => {
          const response = await fetch(`/api/configuration?id=${id}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
          });
          if (!response.ok) throw new Error("Failed to delete configuration");
          return current.filter((c) => c.id !== id);
        },
        {
          optimisticData: (current: Configuration[] = []) =>
            current.filter((c) => c.id !== id),
          rollbackOnError: true,
          revalidate: false,
        }
      );
    } catch {
      return null;
    }
  };

  const updateConfiguration = async (
    configuration: Configuration
  ): Promise<true | null> => {
    const { id, ...updateData } = configuration;
    try {
      await mutate(
        async (current: Configuration[] = []) => {
          const response = await fetch(`/api/configuration?id=${id}`, {
            method: "PATCH",
            body: JSON.stringify(updateData),
            headers: { "Content-Type": "application/json" },
          });
          if (!response.ok) throw new Error("Failed to update configuration");
          const data = await response.json();
          return current.map((c) =>
            c.id === id ? mapConfigurationFromApi(data) : c
          );
        },
        {
          optimisticData: (current: Configuration[] = []) =>
            current.map((c) => (c.id === id ? { ...c, ...updateData } : c)),
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
    configurationData,
    loading,
    error,
    getAllConfigurations,
    createConfiguration,
    deleteConfiguration,
    updateConfiguration,
  };
}
