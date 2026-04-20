import React, { useState } from "react";
import { Reservation, StatusOptions } from "@/lib/reservation/types";
import { useReservation } from "@/hooks/useReservation";
import { ReservationModal } from "@/components/reservation/ReservationModal";
import { DeleteModal } from "@/components/reservation/DeleteReservationModal";
import { CompleteReservationModal } from "@/components/reservation/CompleteReservationModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User } from "lucide-react";

export const BookListItem = (reservation: Reservation) => {
  const {
    customerName,
    inCharge,
    reservationStartDate,
    status,
    id,
    timePerReservation,
    service,
  } = reservation;

  const { deleteReservation, updateReservation, loading } = useReservation();
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openCompleteModal, setOpenCompleteModal] = useState(false);
  const handleOpenDeleteModal = () => {
    setOpenDeleteModal(!openDeleteModal);
  };
  const handleOpenEditModal = () => {
    setOpenEditModal(!openEditModal);
  };
  const handleOpenCompleteReservationModal = () => {
    setOpenCompleteModal(!openCompleteModal);
  };
  const formatDate = (dateStr: string) => {
    const isodate = new Date(dateStr);

    const localedateformat = isodate.toLocaleDateString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return localedateformat;
  };

  const statusBadgeVariant =
    status === "PENDING"
      ? "accent"
      : status === "COMPLETED"
      ? "success"
      : "muted";

  return (
    <div className="w-full max-w-2xl mx-auto bg-surface rounded-xl border border-border-subtle p-5 sm:p-6 flex flex-col gap-3 transition-all duration-150 ease-snappy hover:border-primary/50 hover:shadow-glow-primary">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center mb-2">
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-surface-raised border border-border-subtle mr-3">
            <Calendar className="h-6 w-6 text-primary" />
          </span>
        </div>
        <div className="flex-1">
          <h2 className="text-h4 font-semibold text-foreground mb-1 tracking-tight">
            {customerName}
          </h2>
          <p className="text-body-sm text-foreground-muted flex items-center gap-1">
            <span className="font-medium text-foreground-muted">Reserva:</span>
            <span className="font-semibold text-foreground bg-surface-raised rounded px-2 py-0.5">
              {formatDate(reservationStartDate)}
            </span>
          </p>
          <h3 className="text-body-sm font-semibold text-foreground-muted py-2">
            {service}
          </h3>
        </div>
        <div className="flex flex-col sm:items-end gap-1.5">
          <Badge variant={statusBadgeVariant}>
            {StatusOptions[status as keyof typeof StatusOptions]}
          </Badge>
          <span className="inline-flex items-center gap-1.5 text-caption text-foreground-muted">
            <Clock className="h-3.5 w-3.5" />
            {timePerReservation} min
          </span>
          <span className="inline-flex items-center gap-1.5 text-caption text-foreground-muted">
            <User className="h-3.5 w-3.5" />
            {inCharge}
          </span>
        </div>
      </div>
      <div className="mt-2 w-full">
        <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
          <div className="w-full sm:w-auto">
            <Button
              variant="primary"
              size="sm"
              className="w-full sm:w-auto"
              onClick={() => setOpenCompleteModal(true)}
            >
              Completar
            </Button>
          </div>

          <div className="flex w-full sm:w-auto flex-col sm:flex-row sm:items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full sm:w-auto"
              onClick={() => setOpenEditModal(true)}
            >
              Editar
            </Button>
            <Button
              variant="danger"
              size="sm"
              className="w-full sm:w-auto"
              onClick={() => setOpenDeleteModal(true)}
            >
              Eliminar
            </Button>
          </div>
        </div>
      </div>
      {openDeleteModal && (
        <DeleteModal
          id={id!}
          customerName={customerName}
          openDeleteModal={openDeleteModal}
          handleOpenDeleteModal={handleOpenDeleteModal}
          deleteReservation={deleteReservation}
        />
      )}
      {openCompleteModal && (
        <CompleteReservationModal
          data={reservation}
          openCompleteReservationModal={openCompleteModal}
          handleOpenCompleteReservationModal={
            handleOpenCompleteReservationModal
          }
          updateReservation={updateReservation}
        />
      )}
      {openEditModal && (
        <ReservationModal
          isOpen={openEditModal}
          handleOpenModal={handleOpenEditModal}
          executeAction={updateReservation}
          operation="Editar reserva"
          reservationData={reservation}
          loading={loading}
        />
      )}
    </div>
  );
};
