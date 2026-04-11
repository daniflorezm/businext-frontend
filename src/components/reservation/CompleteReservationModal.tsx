"use client";

import { useState } from "react";
import { useFinances } from "@/hooks/useFinances";
import { useProduct } from "@/hooks/useProduct";
import {
  CompleteReservationModalProps,
  Reservation,
} from "@/lib/reservation/types";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { CheckCircle2, X } from "lucide-react";

export const CompleteReservationModal = ({
  data,
  openCompleteReservationModal,
  handleOpenCompleteReservationModal,
  updateReservation,
}: CompleteReservationModalProps) => {
  const { createFinance } = useFinances();
  const { productData } = useProduct();
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
      const updated = await updateReservation(completedReservation);
      if (updated) {
        await createFinanceRecord(completedReservation);
      }
      handleOpenCompleteReservationModal();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={openCompleteReservationModal}
      onClose={handleOpenCompleteReservationModal}
      className="relative z-50"
    >
      <div className="fixed inset-0 flex w-screen items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <DialogPanel className="max-w-md w-full rounded-2xl shadow-2xl border border-border bg-card p-6 space-y-5 animate-fade-in-up">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-success/10">
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
              <DialogTitle className="text-xl font-bold text-foreground">
                Completar reserva
              </DialogTitle>
            </div>
            <button
              onClick={handleOpenCompleteReservationModal}
              className="p-2 rounded-xl hover:bg-secondary text-muted-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <p className="text-muted-foreground">
            ¿Estás seguro que quieres completar la reserva para{" "}
            <span className="font-semibold text-primary">
              {customerName}
            </span>
            ? Se creará automáticamente un registro de ingreso.
          </p>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
            <button
              onClick={handleOpenCompleteReservationModal}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-secondary text-foreground font-medium hover:bg-muted transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleComplete}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-success text-white font-medium hover:bg-success/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Completando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Completar
                </>
              )}
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};
