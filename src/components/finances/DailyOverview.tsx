"use client";

import { useMemo, useState } from "react";
import { Finances } from "@/lib/finances/types";
import { Reservation } from "@/lib/reservation/types";
import { generateDailyCsv, downloadCsv } from "@/lib/finances/daily-csv";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CalendarDays,
  ShoppingBag,
  ChevronDown,
  ChevronRight,
  Download,
  TrendingUp,
} from "lucide-react";

interface DailyOverviewProps {
  financesData: Finances[];
  reservationData: Reservation[];
  loading: boolean;
}

function parseUTC(dateStr: string): Date {
  return new Date(dateStr.endsWith("Z") ? dateStr : dateStr + "Z");
}

function isToday(dateStr: string): boolean {
  const d = parseUTC(dateStr);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

interface EmployeeGroup {
  creator: string;
  records: Finances[];
  total: number;
}

export function DailyOverview({ financesData, reservationData, loading }: DailyOverviewProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set()
  );

  const { groups, grandTotal } = useMemo(() => {
    // Build a map of reservation dates for quick lookup
    const reservationDateMap = new Map<number, string>();
    for (const r of reservationData) {
      if (r.id != null) {
        reservationDateMap.set(r.id, r.reservationStartDate);
      }
    }

    const todayIncome = financesData.filter((f) => {
      if (f.type !== "INCOME") return false;
      // For reservation-linked records, use the reservation date
      if (f.reservation_id != null) {
        const resDate = reservationDateMap.get(f.reservation_id);
        return resDate ? isToday(resDate) : false;
      }
      // For manual entries / product sales, use created_at
      return f.created_at ? isToday(f.created_at) : false;
    });

    const groupMap = new Map<string, Finances[]>();
    for (const record of todayIncome) {
      const key = record.creator;
      const existing = groupMap.get(key) ?? [];
      existing.push(record);
      groupMap.set(key, existing);
    }

    const groups: EmployeeGroup[] = Array.from(groupMap.entries())
      .map(([creator, records]) => ({
        creator,
        records: records.sort(
          (a, b) =>
            new Date(b.created_at ?? "").getTime() -
            new Date(a.created_at ?? "").getTime()
        ),
        total: records.reduce((sum, r) => sum + r.amount, 0),
      }))
      .sort((a, b) => b.total - a.total);

    const grandTotal = groups.reduce((sum, g) => sum + g.total, 0);

    return { groups, grandTotal };
  }, [financesData, reservationData]);

  const toggleGroup = (creator: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(creator)) next.delete(creator);
      else next.add(creator);
      return next;
    });
  };

  const handleDownload = () => {
    const csv = generateDailyCsv(financesData, reservationData);
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    downloadCsv(csv, `resumen-dia-${dateStr}.csv`);
  };

  if (loading) {
    return (
      <section className="space-y-3">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-20 w-full rounded-md" />
        <Skeleton className="h-16 w-full rounded-md" />
      </section>
    );
  }

  if (groups.length === 0) {
    return (
      <section className="space-y-3">
        <h2 className="font-heading text-h4 font-semibold text-foreground flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          Resumen del día
        </h2>
        <Card>
          <div className="p-4 text-center">
            <p className="text-body-sm text-foreground-muted">
              No hay actividad de ingresos hoy.
            </p>
          </div>
        </Card>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-h4 font-semibold text-foreground flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          Resumen del día
        </h2>
        <Button variant="secondary" size="sm" onClick={handleDownload}>
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Descargar CSV</span>
        </Button>
      </div>

      {/* Grand total */}
      <Card className="border-primary/20">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span className="text-body-sm font-medium text-foreground-muted">
              Ingresos totales hoy
            </span>
          </div>
          <span className="text-h3 font-bold text-foreground">
            {grandTotal.toLocaleString("es-ES")}€
          </span>
        </div>
      </Card>

      {/* Employee groups */}
      <div className="space-y-2">
        {groups.map((group) => {
          const isExpanded = expandedGroups.has(group.creator);
          return (
            <Card key={group.creator}>
              {/* Employee header (clickable) */}
              <button
                type="button"
                onClick={() => toggleGroup(group.creator)}
                className="w-full flex items-center justify-between p-3 sm:p-4 text-left hover:bg-surface-raised/40 transition-colors rounded-md"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-foreground-muted flex-shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-foreground-muted flex-shrink-0" />
                  )}
                  {/* Avatar */}
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/15 text-primary text-[11px] font-bold flex-shrink-0">
                    {group.creator
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <span className="text-body-sm font-semibold text-foreground truncate">
                    {group.creator}
                  </span>
                  <Badge variant="muted" className="flex-shrink-0">
                    {group.records.length}
                  </Badge>
                </div>
                <span className="text-body-sm font-bold text-foreground flex-shrink-0 ml-2">
                  {group.total.toLocaleString("es-ES")}€
                </span>
              </button>

              {/* Expanded records */}
              {isExpanded && (
                <div className="border-t border-border-subtle px-3 sm:px-4 py-2 space-y-1.5">
                  {group.records.map((record) => {
                    const isReservation = record.reservation_id != null;
                    const customerName = isReservation
                      ? reservationData.find(
                          (r) => r.id === record.reservation_id
                        )?.customerName
                      : undefined;
                    const time = record.created_at
                      ? parseUTC(record.created_at).toLocaleTimeString(
                          "es-ES",
                          { hour: "2-digit", minute: "2-digit" }
                        )
                      : "";

                    return (
                      <div
                        key={record.id}
                        className="flex items-center gap-2 py-1.5"
                      >
                        {isReservation ? (
                          <CalendarDays className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                        ) : (
                          <ShoppingBag className="h-3.5 w-3.5 text-accent flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <span className="text-body-sm text-foreground truncate block">
                            {record.concept}
                          </span>
                          {customerName && (
                            <span className="text-[11px] text-foreground-muted truncate block">
                              {customerName}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-foreground-muted flex-shrink-0">
                          {time}
                        </span>
                        <span className="text-body-sm font-semibold text-foreground flex-shrink-0">
                          {record.amount.toLocaleString("es-ES")}€
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </section>
  );
}
