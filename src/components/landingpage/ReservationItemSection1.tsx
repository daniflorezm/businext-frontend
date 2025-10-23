import React from "react";

export const ReservationItemSection1 = () => {
  const reservations = [
    {
      name: "Juan Pérez",
      time: "12:30 PM",
      status: "PENDING",
      service: "Corte de cabello",
      inCharge: "Carlos Ruiz",
    },
    {
      name: "María García",
      time: "2:00 PM",
      status: "COMPLETED",
      service: "Manicura",
      inCharge: "Ana Torres",
    },
    {
      name: "Carlos López",
      time: "7:00 PM",
      status: "PENDING",
      service: "Coloración",
      inCharge: "Carlos Ruiz",
    },
  ];
  return (
    <div className="w-full max-w-2xl mx-auto bg-gradient-to-br from-blue-100 via-purple-100 to-purple-200 sm:bg-gradient-to-br sm:from-blue-500 sm:via-purple-500 sm:to-purple-600 rounded-2xl shadow-2xl p-2 xs:p-3 sm:p-6 md:p-8 flex flex-col gap-4 xs:gap-5 sm:gap-6 transition-colors">
      <div className="bg-gradient-to-br from-white via-white to-purple-50 sm:bg-white rounded-xl xs:rounded-2xl p-2 xs:p-4 sm:p-6 flex flex-col gap-4 xs:gap-5 sm:gap-6 transition-colors">
        <div className="flex xs:items-center justify-between mb-2 gap-3 xs:gap-0">
          <h3 className="font-bold text-gray-900 text-lg xs:text-xl sm:text-2xl break-words">
            Reservas de Hoy
          </h3>
          <span className="text-xl xs:text-2xl sm:text-3xl font-bold text-blue-600">
            {reservations.length}
          </span>
        </div>
        <div className="flex flex-col gap-4 xs:gap-5 sm:gap-6">
          {reservations.map((reservation, i) => (
            <div
              key={i}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-lg xs:rounded-xl border border-blue-100 shadow py-3 px-2 xs:py-4 xs:px-4 sm:p-4 mt-3"
            >
              <div className="flex-1 min-w-0">
                <h4 className="text-sm xs:text-base sm:text-lg font-bold text-gray-800 mb-2 tracking-tight truncate">
                  {reservation.name}
                </h4>
                <div className="flex flex-wrap gap-x-2 gap-y-2 text-xs sm:text-sm text-gray-600 items-center">
                  <span className="font-medium">Hora:</span>
                  <span className="font-semibold text-gray-700 bg-gray-100 rounded px-2 py-0.5">
                    {reservation.time}
                  </span>
                  <span className="font-medium ml-0 sm:ml-2">Servicio:</span>
                  <span className="font-semibold text-gray-700 bg-gray-100 rounded px-2 py-0.5">
                    {reservation.service}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="font-medium text-xs sm:text-sm text-blue-700">
                    Encargado:
                  </span>
                  <span className="font-semibold text-blue-700 bg-blue-100 rounded px-2 py-0.5">
                    {reservation.inCharge}
                  </span>
                </div>
              </div>
              <div className="flex flex-row sm:flex-col sm:items-end gap-2 min-w-[70px] xs:min-w-[90px] sm:min-w-[100px] mt-3 sm:mt-0">
                <span
                  className={`inline-flex items-center gap-1 px-2 xs:px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200 shadow-sm ${
                    reservation.status === "PENDING"
                      ? "text-yellow-600"
                      : "text-green-700"
                  }`}
                >
                  {reservation.status === "PENDING"
                    ? "Pendiente"
                    : "Completada"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
