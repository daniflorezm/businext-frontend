"use client";
import React, { useState } from "react";
import { BookListItem } from "../../components/reservation/ReservationItem";
import { useReservation } from "@/hooks/useReservation";
import { Reservation } from "@/lib/reservation/types";
import { ReservationCalendar } from "@/components/reservation/ReservationCalendar";
import { SectionSkeleton } from "@/components/common/SkeletonLoader";

export default function ReservationPage() {
  const { createReservation, reservationData, loading } =
    useReservation();
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState("ALL");
  const [employeeFilter, setEmployeeFilter] = useState("ALL");
  const [customerSearch, setCustomerSearch] = useState("");
  const itemsPerPage = 6;

  const getStaffList = (reservations: Reservation[]) => {
    const set = new Set<string>();
    reservations.forEach((r) => {
      if (r.inCharge && typeof r.inCharge === "string") set.add(r.inCharge);
    });
    return ["ALL", ...Array.from(set)];
  };

  // Helpers for date filtering
  const isSameDay = (dateA: Date, dateB: Date) => {
    return (
      dateA.getFullYear() === dateB.getFullYear() &&
      dateA.getMonth() === dateB.getMonth() &&
      dateA.getDate() === dateB.getDate()
    );
  };

  const isWithinCurrentWeek = (date: Date) => {
    const now = new Date();
    // Start of week (Monday)
    const day = now.getDay();
    const daysSinceMonday = (day + 6) % 7; // 0->Mon, ...
    const monday = new Date(now);
    monday.setHours(0, 0, 0, 0);
    monday.setDate(now.getDate() - daysSinceMonday);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    return date >= monday && date <= sunday;
  };

  let filteredReservations = [...reservationData].filter(
    (res) => res.status === "PENDING"
  );
  // Filtro por nombre de cliente
  if (customerSearch.trim()) {
    filteredReservations = filteredReservations.filter((res) =>
      res.customerName
        ?.toLowerCase()
        .includes(customerSearch.trim().toLowerCase())
    );
  }

  // Apply employee filter
  if (employeeFilter !== "ALL") {
    filteredReservations = filteredReservations.filter(
      (res) => res.inCharge === employeeFilter
    );
  }

  // Apply time filter: TODAY, WEEK, ALL
  if (filter === "TODAY") {
    const today = new Date();
    filteredReservations = filteredReservations.filter((res) =>
      isSameDay(new Date(res.reservationStartDate), today)
    );
  } else if (filter === "WEEK") {
    filteredReservations = filteredReservations.filter((res) =>
      isWithinCurrentWeek(new Date(res.reservationStartDate))
    );
  } else if (filter === "ALL") {
    // no-op, keep all pending
  }

  // Always sort by reservationStartDate ascending (oldest first)
  filteredReservations.sort(
    (a, b) =>
      new Date(a.reservationStartDate).getTime() -
      new Date(b.reservationStartDate).getTime()
  );

  // Paginación
  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);
  const paginatedReservations = filteredReservations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen w-full bg-linear-to-br from-blue-50 via-white to-blue-100 pt-14 md:pt-0">
      <div className="flex flex-col justify-center items-center p-7 gap-10">
        <h1 className="text-lg font-semibold text-black pb-2.5">
          Lista de reservas
        </h1>
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 mb-3 justify-center items-center w-full max-w-5xl">
          <span className="text-base font-semibold text-blue-700 mr-2">
            Filtrar por:
          </span>
          <div className="flex flex-row flex-wrap gap-2 w-full sm:w-auto justify-center">
            {[
              { label: "Hoy", value: "TODAY" },
              { label: "Semana", value: "WEEK" },
              { label: "Todas", value: "ALL" },
            ].map((btn) => (
              <button
                key={btn.value}
                className={`px-2 py-1 rounded-md font-medium border border-blue-300 shadow-sm transition text-xs sm:text-sm whitespace-nowrap min-w-[90px] sm:min-w-[110px] ${
                  filter === btn.value
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white text-blue-700 hover:bg-blue-100 border-blue-200"
                }`}
                onClick={() => {
                  setFilter(btn.value);
                  setCurrentPage(1);
                }}
              >
                {btn.label}
              </button>
            ))}
          </div>
          <div className="w-full sm:w-auto flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-2 sm:mt-0">
            <label
              htmlFor="customer-search"
              className="text-sm text-blue-700 font-medium"
            >
              Cliente:
            </label>
            <input
              id="customer-search"
              type="text"
              value={customerSearch}
              onChange={(e) => {
                setCustomerSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Buscar por nombre"
              className="w-full sm:w-[180px] px-3 py-1.5 rounded-md text-sm font-medium transition border border-blue-200 bg-white text-blue-700 shadow-sm hover:bg-blue-50"
              aria-label="Filtrar por cliente"
            />
          </div>
          <div className="w-full sm:w-auto flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-2 sm:mt-0">
            <label
              htmlFor="employee-select"
              className="text-sm text-blue-700 font-medium"
            >
              Empleado:
            </label>

            <div className="relative w-full sm:inline-flex sm:w-auto">
              <select
                id="employee-select"
                value={employeeFilter}
                onChange={(e) => {
                  setEmployeeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full sm:w-[180px] appearance-none pr-8 pl-3 py-1.5 rounded-md text-sm font-medium transition border border-blue-200 bg-white text-blue-700 shadow-sm hover:bg-blue-50"
                aria-label="Filtrar por empleado"
              >
                {getStaffList(reservationData).map((s) => (
                  <option key={s} value={s}>
                    {s === "ALL" ? "Todos" : s}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-700">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 9l6 6 6-6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>
          </div>
        </div>
        <div className="w-full max-w-3xl mx-auto flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-6 shadow-sm">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 border border-blue-300">
            <svg
              width="22"
              height="22"
              fill="none"
              viewBox="0 0 24 24"
              stroke="#2563eb"
              strokeWidth="2"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                fill="#e0e7ff"
                stroke="#2563eb"
                strokeWidth="2"
              />
              <rect x="11" y="10" width="2" height="7" rx="1" fill="#2563eb" />
              <rect x="11" y="7" width="2" height="2" rx="1" fill="#2563eb" />
            </svg>
          </span>
          <span className="text-sm sm:text-base text-blue-900 font-medium">
            Cada vez que una reserva se marca como{" "}
            <span className="font-bold text-green-700">completada</span>, se
            crea automáticamente un registro financiero de tipo{" "}
            <span className="font-bold text-blue-700">&quot;ingreso&quot;</span>.
          </span>
        </div>
        <div className="w-full max-w-5xl px-2 sm:px-0">
          {loading ? (
            <SectionSkeleton />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {paginatedReservations && paginatedReservations.length > 0 ? (
                  paginatedReservations.map((reservation: Reservation) => (
                    <BookListItem key={reservation.id} {...reservation} />
                  ))
                ) : (
                  <p className="text-center col-span-full text-gray-500">
                    No hay reservas para mostrar.
                  </p>
                )}
              </div>
              {totalPages > 1 && (
                <div className="flex flex-wrap justify-center mt-8 gap-2">
                  <button
                    className="px-3 py-1 rounded-lg border bg-white text-gray-700 font-semibold shadow hover:bg-blue-100 transition"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      className={`px-3 py-1 rounded-lg font-semibold shadow border transition ${
                        currentPage === i + 1
                          ? "bg-blue-500 text-white border-blue-500"
                          : "bg-white text-gray-700 hover:bg-blue-100 border-gray-300"
                      }`}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    className="px-3 py-1 rounded-lg border bg-white text-gray-700 font-semibold shadow hover:bg-blue-100 transition"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <div className="w-full h-auto flex justify-center items-center">
        <ReservationCalendar
          reservationData={reservationData}
          apiCreateEvent={createReservation}
          loading={loading}
        />
      </div>
    </div>
  );
}
