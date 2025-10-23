"use client";
import React, { useEffect } from "react";
import { ConfigurationItem } from "@/components/configuration/ConfigurationItem";
import { Building2, Users } from "lucide-react";
import { useConfiguration } from "@/hooks/useConfiguration";
import InformationLoader from "@/components/common/InformationLoader";
import { useForm, SubmitHandler } from "react-hook-form";
import { Configuration } from "@/lib/configuration/types";

export default function ConfigurationPage() {
  const {
    createConfiguration,
    updateConfiguration,
    getAllConfigurations,
    configurationData,
    loading,
  } = useConfiguration();
  const { register, handleSubmit, setValue, control } = useForm<Configuration>({
    defaultValues: {
      businessName: "",
      staff: "",
    },
  });

  const onSubmit: SubmitHandler<Configuration> = (data) => {
    let staffFormatted = Array.isArray(data.staff)
      ? data.staff.map((s) => s.trim()).filter((s) => s !== "")
      : typeof data.staff === "string"
      ? [data.staff.trim()].filter((s) => s !== "")
      : [];
    if (configurationData.length > 0) {
      const updateConfig = {
        id: configurationData[0].id,
        businessName: data.businessName,
        staff: staffFormatted.toString(),
      };
      updateConfiguration(updateConfig);
    } else {
      const createConfig = {
        businessName: data.businessName.toString(),
        staff: staffFormatted.toString(),
      };
      createConfiguration(createConfig);
    }
  };

  useEffect(() => {
    getAllConfigurations();
  }, []);
  useEffect(() => {
    if (configurationData.length > 0) {
      const config = configurationData[0];
      setValue("businessName", config.businessName || "");
    }
  }, [configurationData]);

  if (loading) {
    return <InformationLoader />;
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col w-full min-h-screen py-10 px-2 sm:px-4 md:px-8 items-center gap-6 bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
        <h1 className="text-3xl md:text-4xl font-extrabold text-center text-blue-700 drop-shadow-sm">
          Configuración de Negocio
        </h1>
        <p className="text-lg md:text-2xl text-center text-gray-600 max-w-2xl">
          Configura los distintos apartados para aprovechar al máximo esta
          aplicación
        </p>
        <div className="w-full max-w-2xl md:max-w-3xl lg:max-w-4xl p-4 sm:p-6 md:p-8 bg-white/90 rounded-2xl shadow-lg border border-gray-200 flex flex-col gap-6">
          <ConfigurationItem
            title="Información del negocio"
            description="Datos básicos de tu negocio"
            icon={<Building2 className="w-7 h-7 text-blue-600" />}
            addDeleteButton={false}
            inputConfig={{
              inputName: "Nombre del negocio",
              inputValue: "businessName",
            }}
            registerConf={register}
          />
          <ConfigurationItem
            title="Equipo de trabajo"
            description="Gestiona los miembros de tu equipo"
            icon={<Users className="w-7 h-7 text-blue-600" />}
            addDeleteButton={true}
            inputConfig={{
              inputName: "Staff",
              inputValue: "staff",
            }}
            registerConf={register}
            control={control}
            data={configurationData[0]}
          />
        </div>
        <div className="flex justify-center w-full">
          <button
            type="submit"
            className="rounded-xl px-6 py-3 font-semibold bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-lg hover:from-blue-600 hover:to-blue-800 transition text-lg md:text-xl mt-4"
          >
            Guardar configuración
          </button>
        </div>
      </div>
    </form>
  );
}
