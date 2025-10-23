import React, { useEffect } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import {
  Reservation,
  ReservationModalProps,
  StatusOptions,
} from "@/lib/reservation/types";
import { mapReservationToApi } from "@/lib/utils";
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
  } = useForm<Reservation>();
  const { getAllConfigurations, configurationData } = useConfiguration();
  const { getAllProducts, productData } = useProduct();
  const { createFinance } = useFinances();
  const staffNames = configurationData[0]?.staff
    ? configurationData[0].staff.split(",")
    : [];
  const staffOptions = Object.assign(
    {},
    ...staffNames?.map((key) => ({ [key]: key }))
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
    };
    createFinance(financeRecord);
  };

  const onSubmit: SubmitHandler<Reservation> = async (data: Reservation) => {
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

    // I need to set the end date depending on the start date + timePerReservation but in edition I need ID additionally
    if (operation === "Crear reserva") {
      data = { ...data, reservationStartDate, reservationEndDate };
    } else {
      if (data.status === "COMPLETED") {
        createFinanceRecord(data);
      }
      const dataUpdated = getValues();
      data = { ...dataUpdated, id, reservationStartDate, reservationEndDate };
    }

    const dataMapped = mapReservationToApi(data);

    await executeAction(dataMapped);
    window.location.reload();
  };

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
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-4"
              >
                <ReservationInput
                  label="customerName"
                  register={register}
                  required={true}
                />
                <ReservationInputError
                  error={errors.customerName}
                  message="Indica un nombre de cliente"
                />
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
                <ReservationInput
                  label="timePerReservation"
                  register={register}
                  required={true}
                  type="number"
                />
                <ReservationInputError
                  error={errors.timePerReservation}
                  message="Indica un tiempo por reserva"
                />
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
                <div className="flex flex-col sm:flex-row justify-between gap-2 mt-4">
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
                  <button
                    type="button"
                    onClick={() => handleOpenModal()}
                    className="w-full sm:w-auto px-6 py-2 rounded-lg font-semibold bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800 shadow hover:from-gray-400 hover:to-gray-500 transition"
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </DialogPanel>
          </div>
        </Dialog>
      )}
    </>
  );
};
