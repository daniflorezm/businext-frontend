import {
  ReservationInputProps,
  PlaceHoldersReservationMapping,
} from "@/lib/reservation/types";
import React from "react";
import { FieldError } from "react-hook-form";

export const ReservationInput = ({
  label,
  register,
  required,
  disabled,
  type,
}: ReservationInputProps) => (
  <input
    {...register(label, { required })}
    placeholder={PlaceHoldersReservationMapping[label]}
    disabled={disabled}
    type={type || "text"}
    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-blue-50 text-gray-800 placeholder-gray-400 transition disabled:bg-gray-100 disabled:cursor-not-allowed"
  />
);

export const ReservationInputSelect = ({
  label,
  register,
  required,
  disabled,
  options,
}: ReservationInputProps) => (
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

export const ReservationInputError = ({
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
