import {
  ConfigurationInputProps,
  PlaceHoldersConfigurationMapping,
} from "@/lib/configuration/types";
export const ConfigurationInput = ({
  label,
  register,
}: ConfigurationInputProps) => {
  return (
    <input
      {...register(label)}
      placeholder={PlaceHoldersConfigurationMapping[label]}
      defaultValue=""
      className="w-full p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
    />
  );
};
