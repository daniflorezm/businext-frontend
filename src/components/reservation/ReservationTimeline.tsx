"use client";

import React, { useState } from "react";
import { Reservation, StatusOptions } from "@/lib/reservation/types";
import { useReservation } from "@/hooks/useReservation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { ReservationModal } from "@/components/reservation/ReservationModal";
import { CompleteReservationModal } from "@/components/reservation/CompleteReservationModal";
import { DeleteModal } from "@/components/reservation/DeleteReservationModal";
import {
  Calendar,
  Clock,
  User,
  Edit3,
  CheckCircle,
  Trash2,
} from "lucide-react";

interface ReservationTimelineProps {
  reservations: Reservation[];
  loading: boolean;
}

export function ReservationTimeline({
  reservations,
  loading,
}: ReservationTimelineProps) {
  const { deleteReservation, updateReservation, loading: actionLoading } =
    useReservation();

  const [editTarget, setEditTarget] = useState<Reservation | null>(null);
  const [completeTarget, setCompleteTarget] = useState<Reservation | null>(
    null
  );
  const [deleteTarget, setDeleteTarget] = useState<Reservation | null>(null);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-start gap-4 rounded-lg border border-border-subtle bg-surface p-4"
          >
            <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-2/3" />
            </div>
            <Skeleton className="h-6 w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (reservations.length === 0) {
    return (
      <EmptyState
        icon={<Calendar />}
        title="Sin reservas"
        description="No hay reservas para mostrar con los filtros actuales."
      />
    );
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
    });
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const sorted = [...reservations].sort(
    (a, b) =>
      new Date(a.reservationStartDate).getTime() -
      new Date(b.reservationStartDate).getTime()
  );

  return (
    <>
      <div className="space-y-2">
        {sorted.map((reservation) => {
          const statusVariant =
            reservation.status === "PENDING"
              ? "accent"
              : reservation.status === "COMPLETED"
              ? "success"
              : "muted";

          return (
            <div
              key={reservation.id}
              className="group flex items-start gap-4 rounded-xl border border-border-subtle bg-surface p-4 sm:p-5 transition-all duration-150 ease-snappy hover:border-primary/40 hover:shadow-md hover:bg-surface-raised"
            >
              {/* Time column */}
              <div className="flex flex-col items-center flex-shrink-0 w-14 pt-0.5">
                <span className="text-body-sm font-bold text-foreground">
                  {formatTime(reservation.reservationStartDate)}
                </span>
                <span className="text-caption text-foreground-subtle">
                  {formatDate(reservation.reservationStartDate)}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-body font-bold text-foreground truncate">
                    {reservation.customerName}
                  </span>
                  <Badge variant={statusVariant}>
                    {
                      StatusOptions[
                        reservation.status as keyof typeof StatusOptions
                      ]
                    }
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-caption text-foreground-muted">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {reservation.service}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {reservation.timePerReservation} min
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {reservation.inCharge}
                  </span>
                </div>
              </div>

              {/* Actions - visible on hover (desktop) or always (mobile) */}
              <div className="flex items-center gap-1 flex-shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-150">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setEditTarget(reservation)}
                  title="Editar"
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCompleteTarget(reservation)}
                  title="Completar"
                >
                  <CheckCircle className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteTarget(reservation)}
                  title="Eliminar"
                >
                  <Trash2 className="h-4 w-4 text-danger" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      {editTarget && (
        <ReservationModal
          isOpen={!!editTarget}
          handleOpenModal={() => setEditTarget(null)}
          executeAction={updateReservation}
          operation="Editar reserva"
          reservationData={editTarget}
          loading={actionLoading}
        />
      )}
      {completeTarget && (
        <CompleteReservationModal
          data={completeTarget}
          openCompleteReservationModal={!!completeTarget}
          handleOpenCompleteReservationModal={() => setCompleteTarget(null)}
          updateReservation={updateReservation}
        />
      )}
      {deleteTarget && (
        <DeleteModal
          id={deleteTarget.id!}
          customerName={deleteTarget.customerName}
          openDeleteModal={!!deleteTarget}
          handleOpenDeleteModal={() => setDeleteTarget(null)}
          deleteReservation={deleteReservation}
        />
      )}
    </>
  );
}
