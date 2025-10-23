"use client";
import { useState } from "react";
import { Configuration } from "@/lib/configuration/types";
import { mapConfigurationFromApi } from "@/lib/utils";
export function useConfiguration() {
  const [configurationData, setConfigurationData] = useState<Configuration[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const getAllConfigurations: () => Promise<Configuration[]> = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/configuration`);
      if (!response.ok) {
        throw new Error("Failed to fetch configurations");
      }
      const data = await response.json();
      const configurationData = data.map(mapConfigurationFromApi);
      setConfigurationData(configurationData);
      return configurationData;
    } catch (error) {
      setError(error as Error);
      return [];
    } finally {
      setLoading(false);
    }
  };
  const createConfiguration: (
    newConfiguration: Omit<Configuration, "id">
  ) => Promise<Configuration> = async (newConfiguration) => {
    try {
      setLoading(true);
      const response = await fetch("api/configuration", {
        method: "POST",
        body: JSON.stringify(newConfiguration),
      });
      if (!response.ok) {
        throw new Error("Failed to create configuration");
      }
      const data = await response.json();
      const createdConfiguration = mapConfigurationFromApi(data);
      return createdConfiguration;
    } catch (error) {
      setError(error as Error);
      return {} as Configuration;
    } finally {
      setLoading(false);
    }
  };

  const deleteConfiguration = async (id: number) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/configuration?id=${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to delete configuration");
      }
      const result = await response.json();
      return result;
    } catch (error) {
      setError(error as Error);
      return {} as Configuration;
    } finally {
      setLoading(false);
    }
  };

  const updateConfiguration = async (configuration: Configuration) => {
    try {
      setLoading(true);
      const { id, ...updateData } = configuration;
      const response = await fetch(`/api/configuration?id=${id}`, {
        method: "PATCH",
        body: JSON.stringify(updateData),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to update configuration");
      }
      const result = await response.json();
      return result;
    } catch (error) {
      setError(error as Error);
      return {} as Configuration;
    } finally {
      setLoading(false);
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
