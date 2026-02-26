import React, { useEffect, useState } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import {
  Reservation,
  ReservationModalProps,
  StatusOptions,
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
import { useConfiguration } from "@/hooks/useConfiguration";
import { useProduct } from "@/hooks/useProduct";
import { useFinances } from "@/hooks/useFinances";
import { useReservation } from "@/hooks/useReservation";

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
  const { getAllConfigurations, configurationData } = useConfiguration();
  const { getAllProducts, productData } = useProduct();
  const { createFinance } = useFinances();
  const staffNames = configurationData[0]?.staff ?? [];
  const staffOptions = Object.assign(
    {},
    ...staffNames.map((key: string) => ({ [key]: key }))
  );

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
      alert("Debes indicar una fecha y hora para la reserva");
      return;
    }
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
    window.location.reload();
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
    getAllConfigurations();
    getAllProducts();
    // In edition I want all the fields pre-filled
    if (operation === "Editar reserva" && reservationData) {
      for (const item in reservationData) {
        setValue(item, reservationData[item]);
      }
    }
  }, []);

  return (
    <>
      {configurationData[0]?.staff.length > 0 && productData.length > 0 && (
        <Dialog
          open={isOpen}
          onClose={() => handleOpenModal()}
          className="relative z-50"
        >
          <div className="fixed inset-0 flex w-screen items-center justify-center p-2 sm:p-4 bg-black/30 z-50">
            <DialogPanel className="w-full max-w-lg rounded-2xl shadow-2xl border border-gray-200 bg-white p-4 sm:p-8 space-y-6">
              <DialogTitle className="text-2xl font-bold text-purple-700 text-center mb-2">
                {operation}
              </DialogTitle>
              {/* Stepper indicator */}
              <div className="flex justify-center mb-4">
                {Array.from({ length: totalSteps }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-2 w-8 mx-1 rounded-full ${
                      step === idx + 1 ? "bg-purple-600" : "bg-gray-300"
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
                    <div className="mb-1 text-xs text-gray-500">
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
                    <div className="mb-1 text-xs text-gray-500">
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
                    <div className="mb-1 text-xs text-gray-500">
                      Encargado de la reserva
                    </div>
                    <ReservationInputSelect
                      label="inCharge"
                      register={register}
                      required={true}
                      options={staffOptions}
                    />
                    <ReservationInputError
                      error={errors.inCharge}
                      message="Indica un encargado"
                    />
                    <div className="mb-1 text-xs text-gray-500">
                      Fecha y hora de la reserva
                    </div>
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
                                className: "bg-blue-50 rounded-lg",
                              },
                            }}
                          />
                        )}
                      />
                    </LocalizationProvider>
                    <div className="mb-1 text-xs text-gray-500">
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
                        <button
                          key={dur}
                          type="button"
                          className="px-3 py-1 rounded border text-xs font-medium bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200"
                          onClick={() => {
                            // setValue actualiza el valor del campo en react-hook-form
                            setValue("timePerReservation", dur);
                          }}
                        >
                          {dur == 90
                            ? "1.5 h"
                            : dur == 60
                            ? "1 h"
                            : dur + " min"}
                        </button>
                      ))}
                    </div>
                    <ReservationInputError
                      error={errors.timePerReservation}
                      message="Indica un tiempo por reserva"
                    />
                  </>
                )}
                {/* Step 3: Estado y confirmación */}
                {/* {step === 3 && (
                  <>
                    <div className="mb-1 text-xs text-gray-500">
                      Estado de la reserva
                    </div>
                    <ReservationInputSelect
                      label="status"
                      register={register}
                      required={true}
                      options={StatusOptions}
                    />
                    <ReservationInputError
                      error={errors.status}
                      message="Indica un estado"
                    />
                  </>
                )} */}
                {/* Navigation buttons */}
                <div className="flex flex-col sm:flex-row justify-between gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => handleOpenModal()}
                    className="w-full sm:w-auto px-6 py-2  rounded-lg border border-gray-300 bg-white text-gray-700 font-semibold hover:bg-gray-100 transition shadow-sm"
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={handleBack}
                      className="w-full sm:w-auto px-6 py-2 rounded-lg font-semibold bg-gradient-to-r from-purple-400 to-purple-600 text-white shadow hover:from-purple-500 hover:to-purple-700 transition"
                      disabled={loading}
                    >
                      Atrás
                    </button>
                  )}
                  {step < totalSteps && (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="w-full sm:w-auto px-6 py-2 rounded-lg font-semibold bg-gradient-to-r from-purple-400 to-purple-600 text-white shadow hover:from-purple-500 hover:to-purple-700 transition"
                      disabled={loading}
                    >
                      Siguiente
                    </button>
                  )}
                  {step === totalSteps && (
                    <button
                      type="submit"
                      className="w-full sm:w-auto px-6 py-2 rounded-lg font-semibold bg-gradient-to-r from-green-400 to-green-600 text-white shadow hover:from-green-500 hover:to-green-700 transition flex items-center justify-center"
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <svg
                            className="animate-spin h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v8z"
                            ></path>
                          </svg>
                          Guardando...
                        </span>
                      ) : (
                        "Guardar"
                      )}
                    </button>
                  )}
                </div>
              </form>
            </DialogPanel>
          </div>
        </Dialog>
      )}
    </>
  );
};
