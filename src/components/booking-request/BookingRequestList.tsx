"use client";

import React, { useState } from "react";
import { useBookingRequests } from "@/hooks/useBookingRequests";
import { useAccessContext } from "@/hooks/useAccessContext";
import { useGlobalToast } from "@/context/ToastContext";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Check, X, CalendarClock, Clock, User, Phone, Mail } from "lucide-react";

export function BookingRequestList() {
  const { bookingRequests, loading, acceptRequest, rejectRequest } =
    useBookingRequests();
  const { context } = useAccessContext();
  const { showToast } = useGlobalToast();
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const isOwner = context?.role === "owner";
  const currentUserName =
    context?.profile?.displayName ?? context?.profile?.email ?? "";

  // Owner sees all; employees see only requests assigned to them
  const visible = bookingRequests.filter((r) => {
    if (isOwner) return true;
    if (!r.employeeName) return true;
    return r.employeeName.toLowerCase() === currentUserName.toLowerCase();
  });

  const pending = visible.filter((r) => r.status === "REQUESTED");

  const handleAccept = async (id: number) => {
    setActionLoading(id);
    const ok = await acceptRequest(id);
    setActionLoading(null);
    if (ok) {
      showToast("success", "Solicitud aceptada. Reserva creada.");
    } else {
      showToast("error", "Error al aceptar la solicitud.");
    }
  };

  const handleReject = async (id: number) => {
    setActionLoading(id);
    const ok = await rejectRequest(id);
    setActionLoading(null);
    if (ok) {
      showToast("success", "Solicitud rechazada.");
    } else {
      showToast("error", "Error al rechazar la solicitud.");
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (pending.length === 0) {
    return (
      <EmptyState
        icon={<CalendarClock />}
        title="Sin solicitudes pendientes"
        description="Las solicitudes de reserva de clientes aparecerán aquí."
      />
    );
  }

  return (
    <div className="space-y-3">
      {pending.map((request) => (
        <div
          key={request.id}
          className="rounded-lg border border-border-subtle bg-surface-raised p-4"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <User className="h-3.5 w-3.5 text-foreground-muted" />
                <span className="font-medium text-sm truncate">
                  {request.clientName}
                </span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-foreground-subtle">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(request.requestedDate).toLocaleDateString("es-ES", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span>{request.service}</span>
                {request.employeeName && (
                  <span>Con: {request.employeeName}</span>
                )}
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {request.clientPhone}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {request.clientEmail}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleAccept(request.id)}
                disabled={actionLoading === request.id}
                title="Aceptar"
              >
                <Check className="h-4 w-4 text-success" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleReject(request.id)}
                disabled={actionLoading === request.id}
                title="Rechazar"
              >
                <X className="h-4 w-4 text-danger" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
