"use client";
import React, { useEffect, useState } from "react";
import { BookListItem } from "../../components/reservation/ReservationItem";
import { useReservation } from "@/hooks/useReservation";
import { Reservation } from "@/lib/reservation/types";
import { ReservationCalendar } from "@/components/reservation/ReservationCalendar";
import InformationLoader from "@/components/common/InformationLoader";

export default function ReservationPage() {
  const { getAllReservations, createReservation, reservationData, loading } =
    useReservation();
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState("OLDEST");
  const itemsPerPage = 6;

  useEffect(() => {
    getAllReservations();
  }, []);

  let filteredReservations = [...reservationData];
  if (filter === "OLDEST") {
    filteredReservations.sort(
      (a, b) =>
        new Date(a.reservationStartDate).getTime() -
        new Date(b.reservationStartDate).getTime()
    );
  } else if (filter === "NEWEST") {
    filteredReservations.sort(
      (a, b) =>
        new Date(b.reservationStartDate).getTime() -
        new Date(a.reservationStartDate).getTime()
    );
  }

  // Paginación
  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);
  const paginatedReservations = filteredReservations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="flex flex-col justify-center items-center p-7 gap-10">
        <h1 className="text-lg font-semibold text-black pb-2.5">
          Lista de reservas
        </h1>
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 mb-3 justify-center items-center w-full max-w-5xl">
          <span className="text-base font-semibold text-blue-700 mr-2">
            Ordenar por:
          </span>
          <div className="flex flex-row flex-wrap gap-2 w-full sm:w-auto justify-center">
            {[
              { label: "Reservas más antiguas", value: "OLDEST" },
              { label: "Reservas más recientes", value: "NEWEST" },
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
            <span className="font-bold text-blue-700">"ingreso"</span>.
          </span>
        </div>
        <div className="w-full max-w-5xl px-2 sm:px-0">
          {loading ? (
            <InformationLoader />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {paginatedReservations.map((reservation: Reservation) => (
                  <BookListItem key={reservation.id} {...reservation} />
                ))}
                {paginatedReservations.length === 0 && (
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
