import { Control, UseFormRegister } from "react-hook-form";
export type Configuration = {
  id?: number;
  businessName: string;
  staff: string[];
};

export type InputConfig = {
  inputName: string;
  inputValue: string;
};

export type ConfigurationItemProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  addDeleteButton: boolean;
  inputConfig?: InputConfig;
  registerConf?: UseFormRegister<Configuration>;
  control?: Control<Configuration>;
  data?: Configuration;
};

export const PlaceHoldersConfigurationMapping = {
  id: "ID",
  businessName: "Introduce nombre del negocio",
  staff: "Introduce un miembro del equipo",
} as const;

export type ConfigurationInputProps = {
  label: keyof typeof PlaceHoldersConfigurationMapping;
  register: UseFormRegister<Configuration>;
  index?: number;
};
