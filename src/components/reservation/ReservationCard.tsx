"use client";

import { useState } from "react";
import { Reservation, StatusOptions } from "@/lib/reservation/types";
import { useReservation } from "@/hooks/useReservation";
import { ReservationModal } from "@/components/reservation/ReservationModal";
import { DeleteModal } from "@/components/reservation/DeleteReservationModal";
import { CompleteReservationModal } from "@/components/reservation/CompleteReservationModal";
import { Calendar, Clock, User, CheckCircle2, Edit3, Trash2, Sparkles } from "lucide-react";

interface ReservationCardProps {
  reservation: Reservation;
}

export function ReservationCard({ reservation }: ReservationCardProps) {
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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isPending = status === "PENDING";

  return (
    <>
      <div className="group relative bg-card border border-border rounded-2xl p-5 transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 animate-fade-in-up">
        {/* Status indicator */}
        <div className={`
          absolute top-4 right-4 px-2.5 py-1 rounded-full text-xs font-semibold
          ${isPending 
            ? "bg-warning/20 text-warning" 
            : "bg-success/20 text-success"
          }
        `}>
          {StatusOptions[status as keyof typeof StatusOptions]}
        </div>

        {/* Customer info */}
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <User className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-foreground text-lg truncate">{customerName}</h3>
            <p className="text-sm text-primary font-medium">{service}</p>
          </div>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 text-accent" />
            <span>{formatDate(reservationStartDate)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4 text-accent" />
            <span>{formatTime(reservationStartDate)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="truncate">{inCharge}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4 text-primary" />
            <span>{timePerReservation} min</span>
          </div>
        </div>

        {/* Actions */}
        {isPending && (
          <div className="flex gap-2 pt-3 border-t border-border">
            <button
              onClick={() => setOpenCompleteModal(true)}
              className="flex-1 py-2.5 px-3 rounded-xl bg-success/10 text-success font-medium text-sm hover:bg-success/20 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Completar
            </button>
            <button
              onClick={() => setOpenEditModal(true)}
              className="p-2.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-all"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setOpenDeleteModal(true)}
              className="p-2.5 rounded-xl bg-danger/10 text-danger hover:bg-danger/20 transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {openDeleteModal && (
        <DeleteModal
          id={id!}
          customerName={customerName}
          openDeleteModal={openDeleteModal}
          handleOpenDeleteModal={() => setOpenDeleteModal(false)}
          deleteReservation={deleteReservation}
        />
      )}
      {openCompleteModal && (
        <CompleteReservationModal
          data={reservation}
          openCompleteReservationModal={openCompleteModal}
          handleOpenCompleteReservationModal={() => setOpenCompleteModal(false)}
          updateReservation={updateReservation}
        />
      )}
      {openEditModal && (
        <ReservationModal
          isOpen={openEditModal}
          handleOpenModal={() => setOpenEditModal(false)}
          executeAction={updateReservation}
          operation="Editar reserva"
          reservationData={reservation}
          loading={loading}
        />
      )}
    </>
  );
}
