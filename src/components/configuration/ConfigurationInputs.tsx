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
      className="flex w-full rounded-md bg-surface px-3 py-2 text-body-sm text-foreground placeholder:text-foreground-subtle border border-input transition-colors duration-150 ease-snappy focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/25 disabled:cursor-not-allowed disabled:opacity-50"
    />
  );
};
