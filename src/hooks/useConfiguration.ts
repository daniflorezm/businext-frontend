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
    try {
      const response = await fetch("api/configuration", {
        method: "POST",
        body: JSON.stringify(newConfiguration),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to create configuration");
      const data = await response.json();
      await mutate();
      return mapConfigurationFromApi(data);
    } catch {
      return null;
    }
  };

  const deleteConfiguration = async (id: number) => {
    try {
      const response = await fetch(`/api/configuration?id=${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to delete configuration");
      await mutate();
      return response.json();
    } catch {
      return null;
    }
  };

  const updateConfiguration = async (configuration: Configuration) => {
    try {
      const { id, ...updateData } = configuration;
      const response = await fetch(`/api/configuration?id=${id}`, {
        method: "PATCH",
        body: JSON.stringify(updateData),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to update configuration");
      await mutate();
      return response.json();
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
