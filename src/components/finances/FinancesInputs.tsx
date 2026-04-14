import {
  FinancesInputProps,
  PlaceHoldersFinancesMapping,
} from "@/lib/finances/types";
import React from "react";
import { FieldError } from "react-hook-form";

export const FinancesInput = ({
  label,
  register,
  required,
  disabled,
  type,
}: FinancesInputProps) => (
  <input
    {...register(label, { required })}
    placeholder={PlaceHoldersFinancesMapping[label]}
    disabled={disabled}
    type={type || "text"}
    className="flex w-full rounded-md bg-surface px-3 py-2 text-body-sm text-foreground placeholder:text-foreground-subtle border border-input transition-colors duration-150 ease-snappy focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/25 disabled:cursor-not-allowed disabled:opacity-50"
  />
);

export const FinancesInputSelect = ({
  label,
  register,
  required,
  disabled,
  options,
}: FinancesInputProps) => (
  <select
    {...register(label, { required })}
    disabled={disabled}
    className="flex w-full appearance-none rounded-md bg-surface px-3 py-2 text-body-sm text-foreground border border-input transition-colors duration-150 ease-snappy focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/25 disabled:cursor-not-allowed disabled:opacity-50"
  >
    {Object.entries(options ?? {}).map(([key, value]) => (
      <option key={key} value={key}>
        {value}
      </option>
    ))}
  </select>
);

export const FinancesInputError = ({
  error,
  message,
}: {
  error?: FieldError;
  message: string;
}) => {
  if (!error) return null;
  return (
    <span className="text-caption text-danger font-medium mt-1 block">
      {message}
    </span>
  );
};
