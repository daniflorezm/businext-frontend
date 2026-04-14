"use client";

import React, { useMemo } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  format,
} from "date-fns";
import { es } from "date-fns/locale/es";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CompactCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  reservationDates: Date[];
}

export function CompactCalendar({
  selectedDate,
  onDateSelect,
  reservationDates,
}: CompactCalendarProps) {
  const [viewMonth, setViewMonth] = React.useState(
    startOfMonth(selectedDate)
  );

  const today = useMemo(() => new Date(), []);

  // Build set of date strings that have reservations for fast lookup
  const reservationDateSet = useMemo(() => {
    const s = new Set<string>();
    reservationDates.forEach((d) => {
      s.add(format(d, "yyyy-MM-dd"));
    });
    return s;
  }, [reservationDates]);

  // Build grid of weeks
  const weeks = useMemo(() => {
    const monthStart = startOfMonth(viewMonth);
    const monthEnd = endOfMonth(viewMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const result: Date[][] = [];
    let current = calStart;
    let week: Date[] = [];

    while (current <= calEnd) {
      week.push(current);
      if (week.length === 7) {
        result.push(week);
        week = [];
      }
      current = addDays(current, 1);
    }

    return result;
  }, [viewMonth]);

  const dayLabels = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"];

  return (
    <div className="w-full max-w-[280px] bg-surface rounded-xl border border-border-subtle p-3">
      {/* Header navigation */}
      <div className="flex items-center justify-between mb-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => setViewMonth(subMonths(viewMonth, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-body-sm font-semibold text-foreground capitalize">
          {format(viewMonth, "MMMM yyyy", { locale: es })}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => setViewMonth(addMonths(viewMonth, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-0 mb-1">
        {dayLabels.map((label) => (
          <div
            key={label}
            className="text-center text-caption font-medium text-foreground-subtle py-1"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Date grid */}
      <div className="grid grid-cols-7 gap-0">
        {weeks.flat().map((date, idx) => {
          const inMonth = isSameMonth(date, viewMonth);
          const isToday = isSameDay(date, today);
          const isSelected = isSameDay(date, selectedDate);
          const dateKey = format(date, "yyyy-MM-dd");
          const hasReservation = reservationDateSet.has(dateKey);

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onDateSelect(date)}
              className={cn(
                "relative flex flex-col items-center justify-center w-full aspect-square rounded-md text-caption transition-colors duration-150 ease-snappy",
                !inMonth && "text-foreground-subtle opacity-40",
                inMonth && "text-foreground hover:bg-surface-raised",
                isToday &&
                  !isSelected &&
                  "bg-secondary/20 text-secondary font-semibold",
                isSelected &&
                  "bg-accent text-accent-foreground font-semibold"
              )}
            >
              {date.getDate()}
              {/* Dot indicator for reservations */}
              {hasReservation && (
                <span
                  className={cn(
                    "absolute bottom-0.5 h-1 w-1 rounded-full",
                    isSelected ? "bg-accent-foreground" : "bg-primary"
                  )}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
