"use client";

import { useEffect } from "react";
import { Product } from "@/lib/product/types";
import { Reservation } from "@/lib/reservation/types";
import { Employee } from "@/lib/employee/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import moment from "moment-timezone";

interface QuickReservationFormProps {
  selectedService: Product | null;
  onSubmit: (data: Reservation) => void;
  onCancel: () => void;
  loading: boolean;
  isOwner: boolean;
  currentUserName: string;
  employees: Employee[];
  prefilledDate?: Date;
  prefilledSlot?: string;
  onInChargeChange?: (name: string) => void;
  /** For owners: the in-charge selected in step 2 */
  ownerSelectedInCharge?: string;
}

const FIXED_DURATION = 30;

export function QuickReservationForm({
  selectedService,
  onSubmit,
  onCancel,
  loading,
  isOwner,
  currentUserName,
  employees,
  prefilledDate,
  prefilledSlot,
  onInChargeChange,
  ownerSelectedInCharge,
}: QuickReservationFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<{
    customerName: string;
    inCharge: string;
  }>({
    defaultValues: {
      inCharge: currentUserName,
    },
  });

  const watchedInCharge = watch("inCharge");

  // Notify parent when in-charge changes so slots can recompute (non-owner only)
  useEffect(() => {
    if (!isOwner) {
      onInChargeChange?.(watchedInCharge);
    }
  }, [watchedInCharge, onInChargeChange, isOwner]);

  if (!selectedService) return null;

  const hasSlotSelected = !!prefilledDate && !!prefilledSlot;

  const formattedDate = prefilledDate
    ? prefilledDate.toLocaleDateString("es-ES", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

  const handleFormSubmit = handleSubmit((data) => {
    if (!prefilledDate || !prefilledSlot) return;

    // For owners, use the in-charge selected in step 2
    const inCharge = isOwner ? (ownerSelectedInCharge ?? "") : data.inCharge;
    if (!inCharge) return;

    const year = prefilledDate.getFullYear();
    const month = String(prefilledDate.getMonth() + 1).padStart(2, "0");
    const day = String(prefilledDate.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;
    const startDateTimeStr = `${dateStr}T${prefilledSlot}:00`;

    const reservationStartDate = moment(startDateTimeStr)
      .format("YYYY-MM-DDTHH:mm:ss");
    const reservationEndDate = moment(reservationStartDate)
      .add(FIXED_DURATION, "m")
      .format("YYYY-MM-DDTHH:mm:ss");

    const reservation: Reservation = {
      customerName: data.customerName,
      inCharge,
      reservationStartDate,
      reservationEndDate,
      timePerReservation: FIXED_DURATION,
      status: "PENDING",
      service: selectedService.name,
    };
    onSubmit(reservation);
  });

  return (
    <div
      className={cn(
        "overflow-hidden transition-all duration-150 ease-snappy",
        selectedService
          ? "max-h-[600px] opacity-100"
          : "max-h-0 opacity-0"
      )}
    >
      <div className="rounded-xl border border-border-subtle bg-surface-raised/30 p-4 sm:p-6 space-y-4">
        {/* Selected service info */}
        <div className="flex items-center gap-3 pb-3 border-b border-border-subtle">
          <div className="flex-1">
            <p className="text-caption text-foreground-muted">
              Servicio seleccionado
            </p>
            <p className="text-body-sm font-semibold text-foreground">
              {selectedService.name}
            </p>
          </div>
          <span className="text-body-sm font-semibold text-accent">
            {selectedService.price.toLocaleString("es-ES")}€
          </span>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          {/* Row 1: Customer + In-charge */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-caption text-foreground-muted">
                Nombre del cliente
              </label>
              <Input
                {...register("customerName", { required: true })}
                placeholder="Nombre del cliente"
                state={errors.customerName ? "error" : "default"}
              />
              {errors.customerName && (
                <span className="text-caption text-danger">
                  Campo requerido
                </span>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-caption text-foreground-muted">
                Encargado
              </label>
              {isOwner ? (
                <div className="flex items-center h-10 px-3 rounded-lg border border-border-subtle bg-surface-raised text-body-sm text-foreground-muted">
                  {ownerSelectedInCharge || "—"}
                </div>
              ) : (
                <Input
                  {...register("inCharge", { required: true })}
                  value={currentUserName}
                  readOnly
                  className="bg-surface-raised text-foreground-muted"
                />
              )}
              {errors.inCharge && (
                <span className="text-caption text-danger">
                  Campo requerido
                </span>
              )}
            </div>
          </div>

          {/* Row 2: Date + Slot + Duration (read-only, from step 2) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-caption text-foreground-muted">
                Fecha
              </label>
              <div className={cn(
                "flex items-center h-10 px-3 rounded-lg border text-body-sm",
                hasSlotSelected
                  ? "border-border-subtle bg-surface-raised text-foreground"
                  : "border-warning/40 bg-warning/5 text-foreground-muted"
              )}>
                {formattedDate}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-caption text-foreground-muted">
                Horario
              </label>
              <div className={cn(
                "flex items-center h-10 px-3 rounded-lg border text-body-sm",
                hasSlotSelected
                  ? "border-border-subtle bg-surface-raised text-foreground font-semibold"
                  : "border-warning/40 bg-warning/5 text-foreground-muted"
              )}>
                {prefilledSlot ?? "Selecciona un horario arriba"}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-caption text-foreground-muted">
                Duración
              </label>
              <div className="flex items-center h-10 px-3 rounded-lg border border-border-subtle bg-surface-raised text-body-sm text-foreground-muted">
                {FIXED_DURATION} min
              </div>
            </div>
          </div>

          {/* Hint if no slot selected */}
          {!hasSlotSelected && (
            <p className="text-caption text-warning">
              Selecciona una fecha y horario en el paso 2 de arriba para continuar.
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={!hasSlotSelected}
            >
              Reservar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
