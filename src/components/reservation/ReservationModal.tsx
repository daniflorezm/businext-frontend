import React, { useEffect, useState } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import {
  Reservation,
  ReservationModalProps,
} from "@/lib/reservation/types";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import dayjs from "dayjs";
import "dayjs/locale/es";
import moment from "moment-timezone";
import {
  ReservationInput,
  ReservationInputSelect,
  ReservationInputError,
} from "@/components/reservation/ReservationInputs";
import { useProduct } from "@/hooks/useProduct";
import { useFinances } from "@/hooks/useFinances";
import { X, CalendarDays, ChevronLeft, ChevronRight, Save } from "lucide-react";

export const ReservationModal = ({
  handleOpenModal,
  isOpen,
  operation,
  executeAction,
  reservationData,
  loading,
}: ReservationModalProps) => {
  const { id } = reservationData || {};
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
    control,
    trigger,
  } = useForm<Reservation>();
  
  const DURATION_SUGGESTIONS = [30, 60, 90];
  const [step, setStep] = useState(1);
  const totalSteps = 2;
  const [validationError, setValidationError] = useState("");
  const { productData } = useProduct();
  const { createFinance } = useFinances();

  const productOptions = Object.assign(
    {},
    ...productData?.map((product) => ({ [product.name]: product.name }))
  );

  const createFinanceRecord = (data: Reservation) => {
    const getService = productData.filter((p) => p.name === data.service);
    const financeRecord = {
      concept: data.service,
      amount: getService[0]?.price || 0,
      type: "INCOME",
      creator: data.inCharge,
      reservation_id: data.id,
    };
    createFinance(financeRecord);
  };

  const onSubmit: SubmitHandler<Reservation> = async (data: Reservation) => {
    if (step < totalSteps) return;
    if (!data.reservationStartDate) {
      setValidationError("Debes indicar una fecha y hora para la reserva");
      return;
    }
    setValidationError("");
    const reservationStartDate = moment
      .utc(data.reservationStartDate)
      .tz("Europe/Madrid")
      .format("YYYY-MM-DDTHH:mm:ss");
    const reservationEndDate = moment(reservationStartDate)
      .add(data.timePerReservation, "m")
      .format("YYYY-MM-DDTHH:mm:ss");
    if (operation === "Crear reserva") {
      data = {
        ...data,
        reservationStartDate,
        reservationEndDate,
        status: "PENDING",
      };
    } else {
      if (data.status === "COMPLETED") {
        createFinanceRecord(data);
      }
      const dataUpdated = getValues();
      data = { ...dataUpdated, id, reservationStartDate, reservationEndDate };
    }
    await executeAction(data);
    handleOpenModal();
  };

  const handleNext = async () => {
    let valid = false;
    if (step === 1) {
      valid = await trigger(["customerName", "service"]);
    } else if (step === 2) {
      valid = await trigger([
        "inCharge",
        "reservationStartDate",
        "timePerReservation",
      ]);
    }
    if (valid) setStep((s) => s + 1);
  };
  const handleBack = () => setStep((s) => s - 1);

  useEffect(() => {
    if (operation === "Editar reserva" && reservationData) {
      for (const item in reservationData) {
        setValue(item, reservationData[item]);
      }
    }
  }, [operation, reservationData, setValue]);

  return (
    <>
      {productData.length > 0 && (
        <Dialog
          open={isOpen}
          onClose={() => handleOpenModal()}
          className="relative z-50"
        >
          <div className="fixed inset-0 flex w-screen items-center justify-center p-4 bg-black/60 backdrop-blur-sm z-50">
            <DialogPanel className="w-full max-w-lg rounded-2xl shadow-2xl border border-border bg-card p-6 space-y-5 animate-fade-in-up">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10">
                    <CalendarDays className="w-5 h-5 text-primary" />
                  </div>
                  <DialogTitle className="text-xl font-bold text-foreground">
                    {operation}
                  </DialogTitle>
                </div>
                <button
                  onClick={() => handleOpenModal()}
                  className="p-2 rounded-xl hover:bg-secondary text-muted-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Stepper */}
              <div className="flex gap-2">
                {Array.from({ length: totalSteps }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
                      step > idx ? "bg-primary" : step === idx + 1 ? "bg-primary/50" : "bg-secondary"
                    }`}
                  />
                ))}
              </div>

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-4"
              >
                {/* Step 1 */}
                {step === 1 && (
                  <div className="space-y-4 animate-fade-in-up">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Nombre del cliente
                      </label>
                      <ReservationInput
                        label="customerName"
                        register={register}
                        required={true}
                      />
                      <ReservationInputError
                        error={errors.customerName}
                        message="Indica un nombre de cliente"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Servicio a reservar
                      </label>
                      <ReservationInputSelect
                        label="service"
                        register={register}
                        required={true}
                        options={productOptions}
                      />
                      <ReservationInputError
                        error={errors.service}
                        message="Selecciona un servicio"
                      />
                    </div>
                  </div>
                )}

                {/* Step 2 */}
                {step === 2 && (
                  <div className="space-y-4 animate-fade-in-up">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Encargado de la reserva
                      </label>
                      <ReservationInput
                        label="inCharge"
                        register={register}
                        required={true}
                      />
                      <ReservationInputError
                        error={errors.inCharge}
                        message="Indica un encargado"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Fecha y hora de la reserva
                      </label>
                      <LocalizationProvider
                        dateAdapter={AdapterDayjs}
                        adapterLocale="es"
                      >
                        <Controller
                          name="reservationStartDate"
                          control={control}
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
                                  sx: {
                                    "& .MuiOutlinedInput-root": {
                                      backgroundColor: "var(--color-secondary)",
                                      borderRadius: "0.75rem",
                                      color: "var(--color-foreground)",
                                      "& fieldset": {
                                        borderColor: "var(--color-border)",
                                      },
                                      "&:hover fieldset": {
                                        borderColor: "var(--color-primary)",
                                      },
                                      "&.Mui-focused fieldset": {
                                        borderColor: "var(--color-primary)",
                                      },
                                    },
                                    "& .MuiInputLabel-root": {
                                      color: "var(--color-muted-foreground)",
                                    },
                                    "& .MuiSvgIcon-root": {
                                      color: "var(--color-primary)",
                                    },
                                  },
                                },
                              }}
                            />
                          )}
                        />
                      </LocalizationProvider>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Duración (minutos)
                      </label>
                      <ReservationInput
                        label="timePerReservation"
                        register={register}
                        required={true}
                        type="number"
                      />
                      <div className="flex gap-2 mt-2">
                        {DURATION_SUGGESTIONS.map((dur) => (
                          <button
                            key={dur}
                            type="button"
                            className="px-3 py-1.5 rounded-xl text-xs font-medium bg-secondary text-foreground border border-border hover:bg-primary hover:text-white hover:border-primary transition-all"
                            onClick={() => setValue("timePerReservation", dur)}
                          >
                            {dur === 90 ? "1.5 h" : dur === 60 ? "1 h" : dur + " min"}
                          </button>
                        ))}
                      </div>
                      <ReservationInputError
                        error={errors.timePerReservation}
                        message="Indica un tiempo por reserva"
                      />
                    </div>
                  </div>
                )}

                {/* Validation error */}
                {validationError && (
                  <p className="text-sm text-danger bg-danger/10 border border-danger/20 rounded-xl px-4 py-2.5">
                    {validationError}
                  </p>
                )}

                {/* Navigation */}
                <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => handleOpenModal()}
                    className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-secondary text-foreground font-medium hover:bg-muted transition-colors"
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                  
                  <div className="flex gap-2 flex-1 sm:flex-none">
                    {step > 1 && (
                      <button
                        type="button"
                        onClick={handleBack}
                        className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-secondary text-foreground font-medium hover:bg-muted transition-colors flex items-center justify-center gap-2"
                        disabled={loading}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Atrás
                      </button>
                    )}
                    
                    {step < totalSteps ? (
                      <button
                        type="button"
                        onClick={handleNext}
                        className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                        disabled={loading}
                      >
                        Siguiente
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-success text-white font-medium hover:bg-success/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Guardando...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            Guardar
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </DialogPanel>
          </div>
        </Dialog>
      )}
    </>
  );
};
