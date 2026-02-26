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

  const [events, setEvents] = useState<{ id: number | undefined; title: string; start: Date; end: Date; colorIdx: number; inCharge: string | undefined }[]>([]);
  const [view, setView] = useState<View>("month");
  const [date, setDate] = useState(new Date());

  const [openModal, setOpenModal] = useState(false);

  const handleOpenModal = () => {
    setOpenModal(!openModal);
  };

  // Paleta de colores para eventos
  const eventColors = [
    "#2563eb", // azul
    "#06b6d4", // cyan
    "#f59e42", // naranja
    "#a21caf", // morado
    "#059669", // verde
    "#e11d48", // rojo
    "#fbbf24", // amarillo
    "#0ea5e9", // celeste
    "#7c3aed", // violeta
    "#f43f5e", // rosa
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
  const handleDrillDown = (date: Date, viewName: View) => {
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
  }, [reservationData]);

  return (
    <div className="w-full max-w-5xl mx-auto bg-gradient-to-br from-white via-blue-50 to-cyan-50 rounded-3xl shadow-2xl border border-blue-100 p-2 sm:p-6 flex flex-col items-center gap-4 transition-all duration-300 hover:shadow-blue-200">
      {/* Layout para aviso y botón */}
      <div className="w-full flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-2">
        {/* Aviso azulito */}
        <div
          className="flex items-center justify-center sm:justify-start select-none bg-blue-100 text-blue-800 text-sm rounded-lg px-3 py-2 gap-2 shadow-sm border border-blue-200 min-h-[40px]"
          style={{ maxWidth: "420px" }}
        >
          <svg
            className="w-5 h-5 text-blue-500 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="2"
            />
            <line
              x1="12"
              y1="8"
              x2="12"
              y2="12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="12" cy="16" r="1" fill="currentColor" />
          </svg>
          Debes crear al menos un producto y un staff antes de crear una
          reserva.
        </div>
        {/* Botón */}
        <button
          className="w-full sm:w-auto max-w-xs px-7 py-3 rounded-xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 text-lg tracking-wide ring-2 ring-blue-200 hover:ring-blue-400 focus:outline-none focus:ring-4 mb-2 sm:mb-0 mx-auto sm:mx-0"
          onClick={() => setOpenModal(true)}
        >
          <span className="flex items-center gap-2 justify-center">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Crear reserva
          </span>
        </button>
      </div>
      {/* Calendario */}
      <div className="w-full rounded-2xl bg-gradient-to-br from-blue-100/60 to-cyan-100/60 p-1 sm:p-2 md:p-4 shadow-inner border border-blue-200 overflow-x-auto">
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
                  background: `linear-gradient(90deg, ${color} 60%, #fff0 100%)`,
                  color: "#fff",
                  border: "none",
                  borderRadius: "0.5rem",
                  fontWeight: 600,
                  boxShadow: "0 2px 6px rgba(37,99,235,0.15)",
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
          font-family: "Inter", "Segoe UI", Arial, sans-serif;
          background: transparent;
        }
        .modern-calendar .rbc-toolbar {
          background: transparent;
          border-radius: 1rem;
          margin-bottom: 1.5rem;
          padding: 0.7rem 1.2rem;
          box-shadow: 0 2px 8px 0 rgba(59, 130, 246, 0.07);
        }
        .modern-calendar .rbc-toolbar-label {
          font-size: 1.25rem;
          font-weight: 700;
          color: #2563eb;
        }
        .modern-calendar .rbc-btn-group button {
          background: #e0e7ff;
          color: #2563eb;
          border-radius: 0.5rem;
          border: none;
          margin: 0 0.25rem;
          font-weight: 600;
          padding: 0.5rem 1rem;
          font-size: 1rem;
          transition: background 0.2s, color 0.2s;
        }
        .modern-calendar .rbc-btn-group button.rbc-active,
        .modern-calendar .rbc-btn-group button:hover {
          background: #2563eb;
          color: #fff;
        }
        .modern-calendar .rbc-month-view,
        .modern-calendar .rbc-time-view {
          background: transparent;
        }
        .modern-calendar .rbc-month-row {
          border-radius: 0.75rem;
        }
        .modern-calendar .rbc-date-cell {
          font-weight: 500;
          padding: 0.5rem 0.2rem;
        }
        .modern-calendar .rbc-date-cell > a {
          font-size: 1.1rem;
          font-weight: 600;
        }
        .modern-calendar .rbc-today {
          background: #bae6fd !important;
          border-radius: 0.5rem;
        }
        .modern-calendar .rbc-event {
          background: linear-gradient(90deg, #2563eb 60%, #06b6d4 100%);
          color: #fff;
          border: none;
          border-radius: 0.5rem;
          font-weight: 600;
          box-shadow: 0 2px 6px rgba(37, 99, 235, 0.15);
          font-size: 0.93rem;
          padding: 0.25rem 0.5rem;
        }

        .modern-calendar .rbc-event:hover {
          box-shadow: 0 3px 8px rgba(37, 99, 235, 0.25);
        }
        .modern-calendar .rbc-off-range-bg {
          background: #f1f5f9;
        }
        .modern-calendar .rbc-header {
          font-size: 1rem;
          font-weight: 700;
          color: #0ea5e9;
          background: transparent;
          padding: 0.5rem 0;
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
