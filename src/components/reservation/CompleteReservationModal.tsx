"use client";
import { useEffect } from "react";
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
    const completedReservation = { ...data, status: "COMPLETED" };
    const dataMapped = mapReservationToApi(completedReservation);
    const updated = await updateReservation(dataMapped);
    if (updated) {
      await createFinanceRecord(completedReservation);
    }
    handleOpenCompleteReservationModal();
    window.location.reload();
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
                className="w-full md:w-auto px-5 py-2 rounded-lg bg-gradient-to-r from-green-500 to-green-500 text-white font-semibold shadow-md hover:from-green-600 hover:to-green-600 transition border-0"
              >
                Completar
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
};
