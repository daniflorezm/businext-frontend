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
    className="w-full px-4 py-3 rounded-xl border border-border bg-secondary text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
    className="w-full px-4 py-3 rounded-xl border border-border bg-secondary text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer"
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
    <span className="text-sm text-danger font-medium mt-1.5 block">
      {message}
    </span>
  );
};
