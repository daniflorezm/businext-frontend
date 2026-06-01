"use client";

import { useMemo } from "react";
import { Finances } from "@/lib/finances/types";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingBag } from "lucide-react";

interface SalesGroup {
  creator: string;
  records: Finances[];
  totalSales: number;
  totalCommission: number;
}

interface TodaySalesListProps {
  financesData: Finances[];
  currentUserName: string;
  isOwner: boolean;
  loading: boolean;
}

function parseUTC(dateStr: string): Date {
  // Backend stores UTC without timezone suffix — append Z to force UTC interpretation
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

export function TodaySalesList({
  financesData,
  currentUserName,
  isOwner,
  loading,
}: TodaySalesListProps) {
  const todaySales = useMemo(() => {
    let sales = financesData.filter(
      (f) =>
        f.reservation_id === null &&
        f.type === "INCOME" &&
        f.created_at &&
        isToday(f.created_at)
    );
    // Non-owners only see their own
    if (!isOwner && currentUserName) {
      sales = sales.filter(
        (f) => f.creator.toLowerCase() === currentUserName.toLowerCase()
      );
    }
    return sales;
  }, [financesData, isOwner, currentUserName]);

  const groupedByCreator = useMemo<SalesGroup[]>(() => {
    const groups = new Map<string, Finances[]>();
    for (const sale of todaySales) {
      const creator = sale.creator || "Sin nombre";
      const current = groups.get(creator) ?? [];
      current.push(sale);
      groups.set(creator, current);
    }

    return Array.from(groups.entries())
      .map(([creator, records]) => {
        const totalSales = records.reduce((sum, r) => sum + r.amount, 0);
        const totalCommission = records.reduce(
          (sum, r) => sum + (r.commission_amount ?? 0),
          0
        );
        return {
          creator,
          records: records.sort(
            (a, b) =>
              new Date(b.created_at ?? "").getTime() -
              new Date(a.created_at ?? "").getTime()
          ),
          totalSales,
          totalCommission,
        };
      })
      .sort((a, b) => b.totalCommission - a.totalCommission);
  }, [todaySales]);

  const totalCommissionToday = useMemo(
    () => groupedByCreator.reduce((sum, group) => sum + group.totalCommission, 0),
    [groupedByCreator]
  );

  if (loading) {
    return (
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-md" />
          ))}
        </div>
      </section>
    );
  }

  if (todaySales.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h2 className="font-heading text-h4 font-semibold text-foreground flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-accent" />
          Ventas del dia
        </h2>
        <span className="text-caption text-warning font-semibold">
          Comisiones del dia: {totalCommissionToday.toLocaleString("es-ES")}EUR
        </span>
      </div>
      <div className="space-y-2">
        {groupedByCreator.map((group) => (
          <div
            key={group.creator}
            className="bg-accent/5 border border-accent/15 rounded-md p-3 space-y-2"
          >
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-body-sm font-semibold text-foreground">
                {group.creator}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-foreground-muted">
                  Ventas: {group.totalSales.toLocaleString("es-ES")}EUR
                </span>
                <span className="text-caption text-warning font-semibold">
                  Comision: {group.totalCommission.toLocaleString("es-ES")}EUR
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              {group.records.map((sale) => {
                const time = sale.created_at
                  ? parseUTC(sale.created_at).toLocaleTimeString("es-ES", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "";
                const commission = sale.commission_amount ?? 0;

                return (
                  <div key={sale.id} className="flex items-center gap-2">
                    <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-accent" />
                    <div className="flex-1 min-w-0">
                      <p className="text-body-sm text-foreground truncate">
                        {sale.concept}
                      </p>
                      <p className="text-[11px] text-foreground-muted truncate">
                        {time}
                        {commission > 0 && (
                          <>
                            {" · "}
                            comision {commission.toLocaleString("es-ES")}EUR
                          </>
                        )}
                      </p>
                    </div>
                    <span className="text-body-sm font-bold text-accent flex-shrink-0">
                      {sale.amount.toLocaleString("es-ES")}EUR
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
