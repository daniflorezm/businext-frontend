"use client";
import { useState } from "react";
import { useFinances } from "@/hooks/useFinances";
import { useProduct } from "@/hooks/useProduct";
import { useGlobalToast } from "@/context/ToastContext";
import {
  CompleteReservationModalProps,
  Reservation,
} from "@/lib/reservation/types";
import {
  Modal,
  ModalHeader,
  ModalContent,
  ModalFooter,
} from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

export const CompleteReservationModal = ({
  data,
  openCompleteReservationModal,
  handleOpenCompleteReservationModal,
  updateReservation,
}: CompleteReservationModalProps) => {
  const { createFinance } = useFinances();
  const { productData } = useProduct();
  const { showToast } = useGlobalToast();
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
      showToast("success", "Reserva completada correctamente.");
      handleOpenCompleteReservationModal();
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <Modal
      open={openCompleteReservationModal}
      onClose={handleOpenCompleteReservationModal}
    >
      <ModalHeader onClose={handleOpenCompleteReservationModal}>
        Completar reserva
      </ModalHeader>
      <ModalContent>
        <p className="text-body-sm text-foreground-muted">
          ¿Estás seguro que quieres completar la reserva para{" "}
          <span className="font-semibold text-foreground">{customerName}</span>?
        </p>
      </ModalContent>
      <ModalFooter>
        <Button variant="ghost" onClick={handleOpenCompleteReservationModal}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          onClick={handleComplete}
          loading={isSubmitting}
        >
          {isSubmitting ? "Completando..." : "Completar"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};
