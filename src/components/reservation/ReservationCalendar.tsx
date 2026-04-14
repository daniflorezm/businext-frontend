"use client";
import React, { useState, useEffect } from "react";
import { Calendar, dateFnsLocalizer, View } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format } from "date-fns/format";
import { parse } from "date-fns/parse";
import { startOfWeek } from "date-fns/startOfWeek";
import { getDay } from "date-fns/getDay";
import { es } from "date-fns/locale/es";
import { CalendarEvents } from "@/lib/reservation/types";
import { ReservationModal } from "@/components/reservation/ReservationModal";
import { Button } from "@/components/ui/button";
import { Plus, Info } from "lucide-react";

export const ReservationCalendar = ({
  reservationData,
  apiCreateEvent,
  loading,
}: CalendarEvents) => {
  const locales = {
    "es-ES": es,
  };

  const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
  });

  const [events, setEvents] = useState<
    {
      id: number | undefined;
      title: string;
      start: Date;
      end: Date;
      colorIdx: number;
      inCharge: string | undefined;
    }[]
  >([]);
  const [view, setView] = useState<View>("month");
  const [date, setDate] = useState(new Date());

  const [openModal, setOpenModal] = useState(false);

  const handleOpenModal = () => {
    setOpenModal(!openModal);
  };

  // Chart palette mapped to CSS variables for dark theme
  const eventColors = [
    "var(--color-primary)",
    "var(--color-secondary)",
    "var(--color-accent)",
    "var(--color-success)",
    "var(--color-danger)",
    "var(--color-chart-1, #7c3aed)",
    "var(--color-chart-2, #0ea5e9)",
    "var(--color-chart-3, #f59e42)",
    "var(--color-chart-4, #06b6d4)",
    "var(--color-chart-5, #f43f5e)",
  ];

  const loadEvents = async () => {
    try {
      // Build a stable mapping employee -> color index
      const staffList: string[] = [];
      reservationData.forEach((r) => {
        const name =
          r.inCharge && typeof r.inCharge === "string" ? r.inCharge : "";
        if (name && !staffList.includes(name)) staffList.push(name);
      });

      const staffColorMap: Record<string, number> = {};
      staffList.forEach((name, i) => {
        staffColorMap[name] = i % eventColors.length;
      });

      const mapped = reservationData.map((r) => ({
        id: r.id,
        // Include employee name next to customer name
        title: `${r.customerName} — ${r.inCharge ?? ""}`,
        start: new Date(r.reservationStartDate),
        end: new Date(r.reservationEndDate),
        colorIdx: staffColorMap[r.inCharge as string] ?? 0,
        inCharge: r.inCharge,
      }));

      setEvents(mapped);
    } catch (error) {
      console.error("Error loading events:", error);
      throw error;
    }
  };

  const handleViewChange = (newView: View) => {
    setView(newView);
  };

  // When clicking a day cell in month view, react-big-calendar calls onDrillDown
  // with the date for that cell. Use it to switch to 'day' view and center on
  // the clicked date.
  const handleDrillDown = (date: Date) => {
    // only perform drilldown when currently in month view (prevents loops)
    if (view === "month") {
      setDate(date);
      setView("day");
    }
  };

  const handleNavigate = (newDate: Date) => {
    setDate(newDate);
  };

  useEffect(() => {
    loadEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reservationData]);

  return (
    <div className="w-full max-w-5xl mx-auto bg-surface rounded-xl border border-border-subtle shadow-md p-2 sm:p-6 flex flex-col items-center gap-4 transition-all duration-150">
      {/* Layout para aviso y botón */}
      <div className="w-full flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-2">
        {/* Aviso */}
        <div className="flex items-center justify-center sm:justify-start select-none bg-surface-raised text-foreground-muted text-body-sm rounded-lg px-3 py-2 gap-2 border border-border-subtle max-w-[420px]">
          <Info className="h-5 w-5 text-primary flex-shrink-0" />
          Debes crear al menos un producto antes de crear una reserva.
        </div>
        {/* Botón */}
        <Button
          variant="primary"
          size="lg"
          className="w-full sm:w-auto"
          onClick={() => setOpenModal(true)}
        >
          <Plus className="h-5 w-5" />
          Crear reserva
        </Button>
      </div>
      {/* Calendario */}
      <div className="w-full rounded-xl bg-surface-raised p-1 sm:p-2 md:p-4 border border-border-subtle overflow-x-auto">
        <div className="min-w-[580px] w-full">
          <Calendar
            localizer={localizer}
            events={events}
            view={view}
            date={date}
            onView={handleViewChange}
            onNavigate={handleNavigate}
            onDrillDown={handleDrillDown}
            // Make cells selectable so we can detect clicks on month cells.
            selectable
            // When drilling down from month, target day view
            drilldownView="day"
            // Fallback: onSelectSlot is called for clicks on cells (start = date)
            onSelectSlot={(slotInfo) => {
              // slotInfo.start is the clicked date
              if (view === "month" && slotInfo?.start) {
                const clicked = slotInfo.start as Date;
                setDate(clicked);
                setView("day");
              }
            }}
            culture="es-ES"
            messages={{
              next: "Siguiente",
              previous: "Anterior",
              today: "Hoy",
              month: "Mes",
              day: "Día",
            }}
            views={["month", "day"]}
            style={{
              height: 600,
              width: "100%",
              background: "transparent",
            }}
            className="modern-calendar"
            eventPropGetter={(event) => {
              const color = eventColors[event.colorIdx || 0];
              return {
                style: {
                  background: color,
                  color: "var(--color-foreground)",
                  border: "none",
                  borderRadius: "0.375rem",
                  fontWeight: 600,
                  boxShadow: "var(--shadow-sm)",
                  fontSize: "0.93rem",
                  padding: "0.25rem 0.5rem",
                },
              };
            }}
          />
        </div>
      </div>
      <style jsx global>{`
        .modern-calendar .rbc-calendar {
          font-family: var(--font-sans);
          background: transparent;
        }
        .modern-calendar .rbc-toolbar {
          background: transparent;
          border-radius: var(--radius-lg);
          margin-bottom: 1.5rem;
          padding: 0.7rem 1.2rem;
        }
        .modern-calendar .rbc-toolbar-label {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--color-foreground);
        }
        .modern-calendar .rbc-btn-group button {
          background: var(--color-surface);
          color: var(--color-foreground-muted);
          border-radius: var(--radius-md);
          border: 1px solid var(--color-border-subtle);
          margin: 0 0.25rem;
          font-weight: 600;
          padding: 0.5rem 1rem;
          font-size: 1rem;
          transition: background 0.15s, color 0.15s, border-color 0.15s;
        }
        .modern-calendar .rbc-btn-group button.rbc-active,
        .modern-calendar .rbc-btn-group button:hover {
          background: var(--color-primary);
          color: var(--color-primary-foreground);
          border-color: var(--color-primary);
        }
        .modern-calendar .rbc-month-view,
        .modern-calendar .rbc-time-view {
          background: transparent;
          border-color: var(--color-border-subtle);
        }
        .modern-calendar .rbc-month-row {
          border-color: var(--color-border-subtle);
        }
        .modern-calendar .rbc-day-bg {
          border-color: var(--color-border-subtle);
        }
        .modern-calendar .rbc-month-view .rbc-month-row + .rbc-month-row {
          border-top-color: var(--color-border-subtle);
        }
        .modern-calendar .rbc-date-cell {
          font-weight: 500;
          padding: 0.5rem 0.2rem;
          color: var(--color-foreground);
        }
        .modern-calendar .rbc-date-cell > a {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--color-foreground);
        }
        .modern-calendar .rbc-today {
          background: var(--color-surface-raised) !important;
          border-radius: var(--radius-md);
        }
        .modern-calendar .rbc-event {
          border: none;
          border-radius: var(--radius-md);
          font-weight: 600;
          box-shadow: var(--shadow-sm);
          font-size: 0.93rem;
          padding: 0.25rem 0.5rem;
        }
        .modern-calendar .rbc-event:hover {
          box-shadow: var(--shadow-md);
        }
        .modern-calendar .rbc-off-range-bg {
          background: var(--color-background);
        }
        .modern-calendar .rbc-off-range a {
          color: var(--color-foreground-subtle);
        }
        .modern-calendar .rbc-header {
          font-size: 1rem;
          font-weight: 700;
          color: var(--color-primary);
          background: transparent;
          padding: 0.5rem 0;
          border-color: var(--color-border-subtle);
        }
        .modern-calendar .rbc-header + .rbc-header {
          border-left-color: var(--color-border-subtle);
        }
        .modern-calendar .rbc-time-header-content {
          border-color: var(--color-border-subtle);
        }
        .modern-calendar .rbc-time-content {
          border-top-color: var(--color-border-subtle);
        }
        .modern-calendar .rbc-time-content > * + * > * {
          border-left-color: var(--color-border-subtle);
        }
        .modern-calendar .rbc-timeslot-group {
          border-bottom-color: var(--color-border-subtle);
        }
        .modern-calendar .rbc-time-slot {
          color: var(--color-foreground-subtle);
        }
        .modern-calendar .rbc-current-time-indicator {
          background-color: var(--color-accent);
        }
        .modern-calendar .rbc-show-more {
          color: var(--color-primary);
          font-weight: 600;
        }
        @media (max-width: 900px) {
          .modern-calendar .rbc-calendar {
            font-size: 0.98rem;
          }
        }
        @media (max-width: 640px) {
          .modern-calendar .rbc-toolbar {
            padding: 0.4rem 0.3rem;
            flex-direction: column;
            gap: 0.5rem;
          }
          .modern-calendar .rbc-toolbar-label {
            font-size: 1rem;
            padding: 0.2rem 0;
          }
          .modern-calendar .rbc-btn-group {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            gap: 0.25rem;
          }
          .modern-calendar .rbc-btn-group button {
            padding: 0.35rem 0.75rem;
            font-size: 0.9rem;
          }
          .modern-calendar .rbc-header {
            font-size: 0.85rem;
            padding: 0.3rem 0;
          }
          .modern-calendar .rbc-date-cell {
            padding: 0.25rem 0.1rem;
          }
          .modern-calendar .rbc-date-cell > a {
            font-size: 0.9rem;
          }
          .modern-calendar .rbc-event {
            font-size: 0.8rem;
            padding: 0.15rem 0.25rem;
          }
          .modern-calendar .rbc-month-view {
            font-size: 0.9rem;
          }
        }
        @media (max-width: 380px) {
          .modern-calendar .rbc-toolbar-label {
            font-size: 0.95rem;
          }
          .modern-calendar .rbc-btn-group button {
            padding: 0.25rem 0.5rem;
            font-size: 0.85rem;
          }
          .modern-calendar .rbc-header {
            font-size: 0.8rem;
          }
          .modern-calendar .rbc-date-cell > a {
            font-size: 0.85rem;
          }
          .modern-calendar .rbc-event {
            font-size: 0.75rem;
            padding: 0.1rem 0.2rem;
          }
        }
      `}</style>
      {openModal && (
        <ReservationModal
          handleOpenModal={handleOpenModal}
          isOpen={openModal}
          operation="Crear reserva"
          executeAction={apiCreateEvent}
          loading={loading}
        />
      )}
    </div>
  );
};
