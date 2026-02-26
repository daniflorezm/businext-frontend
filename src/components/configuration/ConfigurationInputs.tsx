import {
  ConfigurationInputProps,
  PlaceHoldersConfigurationMapping,
} from "@/lib/configuration/types";
export const ConfigurationInput = ({
  label,
  register,
  index,
}: ConfigurationInputProps) => {
  const fieldName =
    typeof index === "number" && label === "staff"
      ? `${label}.${index}`
      : label;

  return (
    <input
      {...register(fieldName as `${typeof label}` | `staff.${number}`)}
      placeholder={PlaceHoldersConfigurationMapping[label]}
      defaultValue=""
      className="w-full p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
    />
  );
};
