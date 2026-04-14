import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import {
  Reservation,
  ReservationModalProps,
} from "@/lib/reservation/types";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { createTheme, ThemeProvider } from "@mui/material/styles";
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
import {
  Modal,
  ModalHeader,
  ModalContent,
  ModalFooter,
} from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

const muiDarkTheme = createTheme({ palette: { mode: "dark" } });

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
  // Step state for wizard
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
    console.log(financeRecord);

    createFinance(financeRecord);
  };

  const onSubmit: SubmitHandler<Reservation> = async (data: Reservation) => {
    // Final submit only on last step
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

  // Step navigation handlers
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
    // Pre-fill form fields when editing
    if (operation === "Editar reserva" && reservationData) {
      for (const item in reservationData) {
        setValue(item, reservationData[item]);
      }
    }
  }, [operation, reservationData, setValue]);

  return (
    <>
      {productData.length > 0 && (
        <Modal open={isOpen} onClose={handleOpenModal}>
          <ModalHeader onClose={handleOpenModal}>{operation}</ModalHeader>
          <ModalContent>
            {/* Stepper indicator */}
            <div className="flex justify-center mb-6">
              {Array.from({ length: totalSteps }).map((_, idx) => (
                <div
                  key={idx}
                  className={`h-2 w-8 mx-1 rounded-full transition-colors duration-150 ${
                    step === idx + 1 ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              {/* Step 1: Nombre y servicio */}
              {step === 1 && (
                <>
                  <div className="mb-1 text-caption text-foreground-muted">
                    Nombre del cliente
                  </div>
                  <ReservationInput
                    label="customerName"
                    register={register}
                    required={true}
                  />
                  <ReservationInputError
                    error={errors.customerName}
                    message="Indica un nombre de cliente"
                  />
                  <div className="mb-1 text-caption text-foreground-muted">
                    Servicio a reservar
                  </div>
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
                </>
              )}
              {/* Step 2: Encargado, hora, tiempo */}
              {step === 2 && (
                <>
                  <div className="mb-1 text-caption text-foreground-muted">
                    Encargado de la reserva
                  </div>
                  <ReservationInput
                    label="inCharge"
                    register={register}
                    required={true}
                  />
                  <ReservationInputError
                    error={errors.inCharge}
                    message="Indica un encargado"
                  />
                  <div className="mb-1 text-caption text-foreground-muted">
                    Fecha y hora de la reserva
                  </div>
                  <ThemeProvider theme={muiDarkTheme}>
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
                              },
                            }}
                          />
                        )}
                      />
                    </LocalizationProvider>
                  </ThemeProvider>
                  <div className="mb-1 text-caption text-foreground-muted">
                    Duración (minutos)
                  </div>
                  <ReservationInput
                    label="timePerReservation"
                    register={register}
                    required={true}
                    type="number"
                  />
                  {/* Sugerencias de duración */}
                  <div className="flex gap-2 mt-2">
                    {DURATION_SUGGESTIONS.map((dur) => (
                      <Button
                        key={dur}
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setValue("timePerReservation", dur);
                        }}
                      >
                        {dur === 90
                          ? "1.5 h"
                          : dur === 60
                          ? "1 h"
                          : dur + " min"}
                      </Button>
                    ))}
                  </div>
                  <ReservationInputError
                    error={errors.timePerReservation}
                    message="Indica un tiempo por reserva"
                  />
                </>
              )}
              {/* Validation error */}
              {validationError && (
                <p
                  role="alert"
                  className="text-sm text-danger bg-danger/10 border border-danger/25 rounded-md px-3 py-2"
                >
                  {validationError}
                </p>
              )}
              {/* Step navigation */}
              <ModalFooter className="px-0 pb-0">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => handleOpenModal()}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                {step > 1 && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleBack}
                    disabled={loading}
                  >
                    Atrás
                  </Button>
                )}
                {step < totalSteps && (
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleNext}
                    disabled={loading}
                  >
                    Siguiente
                  </Button>
                )}
                {step === totalSteps && (
                  <Button
                    type="submit"
                    variant="primary"
                    loading={loading}
                  >
                    {loading ? "Guardando..." : "Guardar"}
                  </Button>
                )}
              </ModalFooter>
            </form>
          </ModalContent>
        </Modal>
      )}
    </>
  );
};
