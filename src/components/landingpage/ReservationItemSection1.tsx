import React from "react";
import { Badge } from "@/components/ui/badge";

export const ReservationItemSection1 = () => {
  const reservations = [
    {
      name: "Juan Pérez",
      time: "12:30 PM",
      status: "PENDING",
      service: "Corte de cabello",
      inCharge: "Carlos Ruiz",
    },
    {
      name: "María García",
      time: "2:00 PM",
      status: "COMPLETED",
      service: "Manicura",
      inCharge: "Ana Torres",
    },
    {
      name: "Carlos López",
      time: "7:00 PM",
      status: "PENDING",
      service: "Coloración",
      inCharge: "Carlos Ruiz",
    },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto bg-gradient-to-br from-primary/80 via-secondary/60 to-secondary/80 rounded-2xl shadow-lg p-2 xs:p-3 sm:p-6 md:p-8 flex flex-col gap-4 xs:gap-5 sm:gap-6 transition-colors">
      <div className="bg-surface rounded-xl xs:rounded-2xl p-2 xs:p-4 sm:p-6 flex flex-col gap-4 xs:gap-5 sm:gap-6 transition-colors">
        <div className="flex xs:items-center justify-between mb-2 gap-3 xs:gap-0">
          <h3 className="font-heading font-bold text-foreground text-body sm:text-h4 break-words">
            Reservas de Hoy
          </h3>
          <span className="text-h3 sm:text-h2 font-bold text-primary">
            {reservations.length}
          </span>
        </div>
        <div className="flex flex-col gap-4 xs:gap-5 sm:gap-6">
          {reservations.map((reservation, i) => (
            <div
              key={i}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-surface-raised rounded-lg xs:rounded-xl border border-border-subtle shadow-sm py-3 px-2 xs:py-4 xs:px-4 sm:p-4 mt-3 transition-colors duration-150"
            >
              <div className="flex-1 min-w-0">
                <h4 className="text-body-sm sm:text-body font-bold text-foreground mb-2 tracking-tight truncate">
                  {reservation.name}
                </h4>
                <div className="flex flex-wrap gap-x-2 gap-y-2 text-caption text-foreground-muted items-center">
                  <span className="font-medium">Hora:</span>
                  <span className="font-semibold text-foreground bg-surface rounded px-2 py-0.5">
                    {reservation.time}
                  </span>
                  <span className="font-medium ml-0 sm:ml-2">Servicio:</span>
                  <span className="font-semibold text-foreground bg-surface rounded px-2 py-0.5">
                    {reservation.service}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="font-medium text-caption text-primary">
                    Encargado:
                  </span>
                  <span className="font-semibold text-primary bg-primary/10 rounded px-2 py-0.5 text-caption">
                    {reservation.inCharge}
                  </span>
                </div>
              </div>
              <div className="flex flex-row sm:flex-col sm:items-end gap-2 min-w-[70px] xs:min-w-[90px] sm:min-w-[100px] mt-3 sm:mt-0">
                <Badge
                  variant={
                    reservation.status === "PENDING" ? "accent" : "success"
                  }
                >
                  {reservation.status === "PENDING"
                    ? "Pendiente"
                    : "Completada"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
