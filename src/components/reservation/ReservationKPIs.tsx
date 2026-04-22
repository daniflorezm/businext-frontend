"use client";

import { useMemo } from "react";
import { Reservation } from "@/lib/reservation/types";
import { Product } from "@/lib/product/types";
import { Card } from "@/components/ui/card";
import { CalendarDays, Clock, CheckCircle, DollarSign } from "lucide-react";

interface ReservationKPIsProps {
  reservationData: Reservation[];
  productData: Product[];
}

export function ReservationKPIs({
  reservationData,
  productData,
}: ReservationKPIsProps) {
  const kpis = useMemo(() => {
    const today = new Date();
    const isToday = (dateStr: string) => {
      const d = new Date(dateStr);
      return (
        d.getFullYear() === today.getFullYear() &&
        d.getMonth() === today.getMonth() &&
        d.getDate() === today.getDate()
      );
    };

    const todayReservations = reservationData.filter((r) =>
      isToday(r.reservationStartDate)
    );
    const pending = todayReservations.filter(
      (r) => r.status === "PENDING"
    ).length;
    const completed = todayReservations.filter(
      (r) => r.status === "COMPLETED"
    );

    const priceMap = new Map<string, number>();
    productData.forEach((p) => {
      priceMap.set(p.name.toLowerCase(), p.price);
    });

    const revenue = completed.reduce((sum, r) => {
      const price = priceMap.get(r.service.toLowerCase()) ?? 0;
      return sum + price;
    }, 0);

    return {
      total: todayReservations.length,
      pending,
      completed: completed.length,
      revenue,
    };
  }, [reservationData, productData]);

  const cards = [
    {
      label: "Reservas del día",
      value: kpis.total,
      icon: CalendarDays,
      color: "text-primary",
    },
    {
      label: "Pendientes",
      value: kpis.pending,
      icon: Clock,
      color: "text-warning",
    },
    {
      label: "Completadas",
      value: kpis.completed,
      icon: CheckCircle,
      color: "text-success",
    },
    {
      label: "Ingresos hoy",
      value: `$${kpis.revenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-accent",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card) => (
        <Card
          key={card.label}
          className="p-4 sm:p-6 flex flex-col gap-2 sm:gap-3 border border-border-subtle overflow-hidden"
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-caption sm:text-body-sm font-medium text-foreground-muted leading-tight min-w-0">
              {card.label}
            </p>
            <div
              className={`flex-shrink-0 flex items-center justify-center w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-surface-raised ${card.color}`}
            >
              <card.icon className="h-4 w-4 sm:h-6 sm:w-6" />
            </div>
          </div>
          <p className="text-h3 sm:text-h1 font-bold text-foreground leading-none truncate">
            {card.value}
          </p>
        </Card>
      ))}
    </div>
  );
}
