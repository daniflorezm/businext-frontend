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
    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-blue-50 text-gray-800 placeholder-gray-400 transition disabled:bg-gray-100 disabled:cursor-not-allowed"
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
    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-blue-50 text-gray-800 transition disabled:bg-gray-100 disabled:cursor-not-allowed"
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
    <span className="text-sm text-red-600 font-medium mt-1 block">
      {message}
    </span>
  );
};
