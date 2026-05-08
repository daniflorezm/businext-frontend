"use client";

import React from "react";
import { BookingRequestList } from "@/components/booking-request/BookingRequestList";
import { Bell } from "lucide-react";

export default function NotificationsPage() {
  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <Bell className="h-6 w-6 text-foreground-muted" />
        <h1 className="font-heading text-h2 font-bold text-foreground">
          Notificaciones
        </h1>
      </div>

      {/* Booking requests section */}
      <section className="space-y-3">
        <h2 className="text-body font-semibold text-foreground">
          Solicitudes de reserva
        </h2>
        <BookingRequestList />
      </section>
    </div>
  );
}
