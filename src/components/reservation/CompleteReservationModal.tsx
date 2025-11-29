"use client";
import { useEffect, useState } from "react";
import { useFinances } from "@/hooks/useFinances";
import { useProduct } from "@/hooks/useProduct";
import {
  CompleteReservationModalProps,
  Reservation,
} from "@/lib/reservation/types";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { mapReservationToApi } from "@/lib/utils";

export const CompleteReservationModal = ({
  data,
  openCompleteReservationModal,
  handleOpenCompleteReservationModal,
  updateReservation,
}: CompleteReservationModalProps) => {
  const { createFinance } = useFinances();
  const { getAllProducts, productData } = useProduct();
  const { customerName } = data;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createFinanceRecord = async (data: Reservation) => {
    const getService = productData.filter((p) => p.name === data.service);
    const financeRecord = {
      concept: data.service,
      amount: getService[0]?.price || 0,
      type: "INCOME",
      creator: data.inCharge,
      reservation_id: data.id,
    };
    await createFinance(financeRecord);
  };
  const handleComplete = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const completedReservation = { ...data, status: "COMPLETED" };
      const dataMapped = mapReservationToApi(completedReservation);
      const updated = await updateReservation(dataMapped);
      if (updated) {
        await createFinanceRecord(completedReservation);
      }
      handleOpenCompleteReservationModal();
      window.location.reload();
    } finally {
      setIsSubmitting(false);
    }
  };
  useEffect(() => {
    getAllProducts();
  }, []);
  return (
    <>
      <Dialog
        open={openCompleteReservationModal}
        onClose={handleOpenCompleteReservationModal}
        className="relative z-50"
      >
        <div className="fixed inset-0 flex w-screen items-center justify-center bg-black/30 p-4">
          <DialogPanel className="max-w-md w-full rounded-2xl shadow-2xl border border-gray-200 bg-white px-6 py-8 md:px-12 md:py-10 space-y-6 animate-fade-in">
            <DialogTitle className="text-xl font-bold text-gray-900 mb-2">
              Completar reserva
            </DialogTitle>
            <p className="text-gray-700 text-base mb-4">
              ¿Estás seguro que quieres completar la reserva para{" "}
              <span className="font-semibold text-blue-600">
                {customerName}
              </span>
              ?
            </p>
            <div className="flex flex-col-reverse md:flex-row gap-3 md:gap-4 justify-end">
              <button
                onClick={handleOpenCompleteReservationModal}
                className="w-full md:w-auto px-5 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 font-semibold hover:bg-gray-100 transition shadow-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleComplete}
                className="w-full md:w-auto px-5 py-2 rounded-lg bg-gradient-to-r from-green-500 to-green-500 text-white font-semibold shadow-md hover:from-green-600 hover:to-green-600 transition border-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
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
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Completando...
                  </span>
                ) : (
                  "Completar"
                )}
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
};
