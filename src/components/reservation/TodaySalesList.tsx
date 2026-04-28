"use client";

import { useMemo } from "react";
import { Finances } from "@/lib/finances/types";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingBag } from "lucide-react";

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
      <h2 className="font-heading text-h4 font-semibold text-foreground flex items-center gap-2">
        <ShoppingBag className="h-5 w-5 text-accent" />
        Ventas del día
      </h2>
      <div className="space-y-2">
        {todaySales.map((sale) => {
          const time = sale.created_at
            ? parseUTC(sale.created_at).toLocaleTimeString("es-ES", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "";

          return (
            <div
              key={sale.id}
              className="flex items-center gap-3 bg-accent/5 border border-accent/15 rounded-md px-3 py-2.5"
            >
              {/* Accent dot */}
              <span className="flex-shrink-0 w-2 h-2 rounded-full bg-accent" />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-body-sm font-semibold text-foreground truncate">
                  {sale.concept}
                </p>
                <p className="text-[11px] text-foreground-muted truncate">
                  {sale.creator}
                  {time && <> · {time}</>}
                </p>
              </div>

              {/* Amount */}
              <span className="text-body-sm font-bold text-accent flex-shrink-0">
                {sale.amount.toLocaleString("es-ES")}€
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
