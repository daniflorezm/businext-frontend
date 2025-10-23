import React, { useState } from "react";
import { Reservation, StatusOptions } from "@/lib/reservation/types";
import { useReservation } from "@/hooks/useReservation";
import { ReservationModal } from "@/components/reservation/ReservationModal";
import { DeleteModal } from "@/components/reservation/DeleteReservationModal";

export const BookListItem = (reservation: Reservation) => {
  const {
    customerName,
    inCharge,
    reservationStartDate,
    status,
    id,
    timePerReservation,
    service,
  } = reservation;

  const { deleteReservation, updateReservation, loading } = useReservation();
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const handleOpenDeleteModal = () => {
    setOpenDeleteModal(!openDeleteModal);
  };
  const handleOpenEditModal = () => {
    setOpenEditModal(!openEditModal);
  };

  const formatDate = (dateStr: string) => {
    const isodate = new Date(dateStr);

    const localedateformat = isodate.toLocaleDateString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return localedateformat;
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-2xl shadow-lg border border-blue-100 p-6 sm:p-8 flex flex-col gap-4 transition hover:shadow-2xl hover:border-blue-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center mb-2">
          <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 border-2 border-blue-400 shadow-lg mr-4">
            <svg
              width="36"
              height="36"
              fill="none"
              viewBox="0 0 24 24"
              stroke="#2563eb"
              strokeWidth="2.2"
              className="w-8 h-8"
            >
              <rect
                x="3.5"
                y="5.5"
                width="17"
                height="15"
                rx="2.5"
                fill="#e0e7ff"
              />
              <rect
                x="3.5"
                y="5.5"
                width="17"
                height="15"
                rx="2.5"
                stroke="#2563eb"
                strokeWidth="2"
              />
              <path
                d="M8 2v4M16 2v4"
                stroke="#2563eb"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path d="M3.5 9.5h17" stroke="#2563eb" strokeWidth="1.5" />
            </svg>
          </span>
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-extrabold text-gray-800 mb-1 tracking-tight">
            {customerName}
          </h2>
          <p className="text-sm text-gray-500 flex items-center gap-1">
            <span className="font-medium text-gray-600">Reserva:</span>
            <span className="font-semibold text-gray-700 bg-gray-100 rounded px-2 py-0.5">
              {formatDate(reservationStartDate)}
            </span>
          </p>
          <h3 className="text-base font-semibold text-gray-600 py-2">
            {service}
          </h3>
        </div>
        <div className="flex flex-col sm:items-end gap-1">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200 shadow-sm mb-1">
            <span className="font-medium">Estado:</span>
            <span
              className={
                status === "PENDING"
                  ? "text-yellow-600"
                  : status === "COMPLETED"
                  ? "text-green-700"
                  : "text-gray-600"
              }
            >
              {StatusOptions[status as keyof typeof StatusOptions]}
            </span>
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200 shadow-sm">
            <span className="font-medium">Duración:</span>
            <span className="text-gray-700">{timePerReservation} min</span>
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200 shadow-sm">
            <span className="font-medium">Encargado:</span>
            <span className="text-gray-700">{inCharge}</span>
          </span>
        </div>
      </div>
      <div className="flex justify-end gap-4 mt-2">
        <button
          className="px-4 py-2 rounded-lg font-semibold bg-gradient-to-r from-blue-400 to-blue-600 text-white shadow hover:from-blue-500 hover:to-blue-700 transition border border-blue-500"
          onClick={() => setOpenEditModal(true)}
        >
          Editar
        </button>
        <button
          className="px-4 py-2 rounded-lg font-semibold bg-gradient-to-r from-red-400 to-red-600 text-white shadow hover:from-red-500 hover:to-red-700 transition border border-red-500"
          onClick={() => setOpenDeleteModal(true)}
        >
          Eliminar
        </button>
      </div>
      {openDeleteModal && (
        <DeleteModal
          id={id!}
          customerName={customerName}
          openDeleteModal={openDeleteModal}
          handleOpenDeleteModal={handleOpenDeleteModal}
          deleteReservation={deleteReservation}
        />
      )}
      {openEditModal && (
        <ReservationModal
          isOpen={openEditModal}
          handleOpenModal={handleOpenEditModal}
          executeAction={updateReservation}
          operation="Editar reserva"
          reservationData={reservation}
          loading={loading}
        />
      )}
    </div>
  );
};
