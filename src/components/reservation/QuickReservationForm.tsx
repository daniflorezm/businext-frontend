"use client";

import { Product } from "@/lib/product/types";
import { Reservation } from "@/lib/reservation/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useForm, Controller } from "react-hook-form";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import dayjs from "dayjs";
import "dayjs/locale/es";
import moment from "moment-timezone";

const muiDarkTheme = createTheme({ palette: { mode: "dark" } });

interface QuickReservationFormProps {
  selectedService: Product | null;
  onSubmit: (data: Reservation) => void;
  onCancel: () => void;
  loading: boolean;
}

const DURATION_SUGGESTIONS = [30, 60, 90];

export function QuickReservationForm({
  selectedService,
  onSubmit,
  onCancel,
  loading,
}: QuickReservationFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
  } = useForm<{
    customerName: string;
    inCharge: string;
    reservationStartDate: string;
    timePerReservation: number;
  }>();

  if (!selectedService) return null;

  const handleFormSubmit = handleSubmit((data) => {
    const reservationStartDate = moment
      .utc(data.reservationStartDate)
      .tz("Europe/Madrid")
      .format("YYYY-MM-DDTHH:mm:ss");
    const reservationEndDate = moment(reservationStartDate)
      .add(data.timePerReservation, "m")
      .format("YYYY-MM-DDTHH:mm:ss");

    const reservation: Reservation = {
      customerName: data.customerName,
      inCharge: data.inCharge,
      reservationStartDate,
      reservationEndDate,
      timePerReservation: data.timePerReservation,
      status: "PENDING",
      service: selectedService.name,
    };
    onSubmit(reservation);
  });

  return (
    <div
      className={cn(
        "overflow-hidden transition-all duration-200 ease-snappy",
        selectedService
          ? "max-h-[600px] opacity-100 mt-4"
          : "max-h-0 opacity-0"
      )}
    >
      <div className="rounded-xl border border-border-subtle bg-surface p-4 sm:p-6 space-y-4">
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
            ${selectedService.price.toLocaleString("es-ES")}
          </span>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-4">
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
              <Input
                {...register("inCharge", { required: true })}
                placeholder="Encargado de la reserva"
                state={errors.inCharge ? "error" : "default"}
              />
              {errors.inCharge && (
                <span className="text-caption text-danger">
                  Campo requerido
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-caption text-foreground-muted">
                Fecha y hora
              </label>
              <ThemeProvider theme={muiDarkTheme}>
                <LocalizationProvider
                  dateAdapter={AdapterDayjs}
                  adapterLocale="es"
                >
                  <Controller
                    name="reservationStartDate"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <DateTimePicker
                        label="Hora de la reserva"
                        value={field.value ? dayjs(field.value) : null}
                        onChange={(newValue) => {
                          field.onChange(
                            newValue ? newValue.toISOString() : ""
                          );
                        }}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            size: "small",
                            error: !!errors.reservationStartDate,
                          },
                        }}
                      />
                    )}
                  />
                </LocalizationProvider>
              </ThemeProvider>
              {errors.reservationStartDate && (
                <span className="text-caption text-danger">
                  Campo requerido
                </span>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-caption text-foreground-muted">
                Duración (minutos)
              </label>
              <Input
                type="number"
                {...register("timePerReservation", {
                  required: true,
                  valueAsNumber: true,
                })}
                placeholder="Duración"
                state={errors.timePerReservation ? "error" : "default"}
              />
              <div className="flex gap-2 mt-1.5">
                {DURATION_SUGGESTIONS.map((dur) => (
                  <Button
                    key={dur}
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setValue("timePerReservation", dur)}
                  >
                    {dur === 90 ? "1.5 h" : dur === 60 ? "1 h" : dur + " min"}
                  </Button>
                ))}
              </div>
              {errors.timePerReservation && (
                <span className="text-caption text-danger">
                  Campo requerido
                </span>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" loading={loading}>
              Reservar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
