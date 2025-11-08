"use client";
import React, { useEffect, useState } from "react";
import { useFinances } from "@/hooks/useFinances";
import InformationLoader from "@/components/common/InformationLoader";
import { FinanceRecordItem } from "@/components/finances/FinanceRecordItem";
import { useReservation } from "@/hooks/useReservation";
import { FinancesModal } from "@/components/finances/FinancesModal";
import { FinancesBalanceCard } from "@/components/finances/FinancesBalanceCard";
import { FinancesPieChart } from "@/components/finances/FinancesPieChart";
import { FinancesBarChart } from "@/components/finances/FinancesBarChart";
import { FinancesLineChart } from "@/components/finances/FinancesLineChart";
import { monthOptions } from "@/lib/finances/types";

export default function FinancesPage() {
  const {
    getAllFinances,
    getAnualFinances,
    financesData,
    anualFinancesData,
    loading,
  } = useFinances();
  const { reservationData, getAllReservations } = useReservation();
  const [openModal, setopenModal] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState<"ALL" | "INCOME" | "EXPENSE">(
    "ALL"
  );
  const itemsPerPage = 4;

  useEffect(() => {
    const currentYear = new Date().getFullYear().toString();
    getAllFinances();
    getAnualFinances(currentYear);
    getAllReservations();
  }, []);

  const handleOpenModal = () => {
    setopenModal(!openModal);
  };

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const monthName = monthOptions[selectedMonth];
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const yearOptions = Array.from(
    { length: 5 },
    (_, i) => now.getFullYear() - 2 + i
  ); // 2 años atras y 2 años adelante

  const filteredFinances = financesData.filter((f) => {
    if (!f.created_at) return false;
    const date = new Date(f.created_at);
    const matchesMonth =
      date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
    const matchesType = filterType === "ALL" ? true : f.type === filterType;
    return matchesMonth && matchesType;
  });

  const sortedReservations = [...filteredFinances].sort(
    (a, b) =>
      new Date(b.created_at ? b.created_at : "").getTime() -
      new Date(a.created_at ? a.created_at : "").getTime()
  );

  const totalPages = Math.ceil(sortedReservations.length / itemsPerPage);
  const paginatedReservations = sortedReservations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalIncome = filteredFinances
    .filter((f) => f.type === "INCOME")
    .reduce((sum, f) => sum + f.amount, 0);

  const totalExpense = filteredFinances
    .filter((f) => f.type === "EXPENSE")
    .reduce((sum, f) => sum + f.amount, 0);

  const totalBalance = totalIncome - totalExpense;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      {loading ? (
        <div className="flex justify-center items-center min-h-screen">
          <InformationLoader />
        </div>
      ) : (
        <>
          <div className="w-full flex flex-col sm:flex-row justify-center items-center px-4 sm:px-8 pt-8 gap-4">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center bg-white rounded-xl shadow px-4 py-3 border border-gray-200 w-full sm:w-auto">
              <div className="flex flex-col sm:flex-row gap-2 ml-0 sm:ml-4 w-full sm:w-auto">
                <button
                  className={`px-3 py-1 rounded-lg font-semibold border transition text-sm w-full sm:w-auto
                    ${
                      filterType === "ALL"
                        ? "bg-blue-500 text-white border-blue-500"
                        : "bg-white text-blue-700 border-blue-300 hover:bg-blue-100"
                    }`}
                  onClick={() => setFilterType("ALL")}
                >
                  Todos
                </button>
                <button
                  className={`px-3 py-1 rounded-lg font-semibold border transition text-sm w-full sm:w-auto
                    ${
                      filterType === "INCOME"
                        ? "bg-green-500 text-white border-green-500"
                        : "bg-white text-green-700 border-green-300 hover:bg-green-100"
                    }`}
                  onClick={() => setFilterType("INCOME")}
                >
                  Ingresos
                </button>
                <button
                  className={`px-3 py-1 rounded-lg font-semibold border transition text-sm w-full sm:w-auto
                    ${
                      filterType === "EXPENSE"
                        ? "bg-red-500 text-white border-red-500"
                        : "bg-white text-red-700 border-red-300 hover:bg-red-100"
                    }`}
                  onClick={() => setFilterType("EXPENSE")}
                >
                  Gastos
                </button>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
                  <label
                    htmlFor="month"
                    className="text-base font-semibold text-blue-700 sm:self-center"
                  >
                    Mes
                  </label>
                  <select
                    id="month"
                    value={selectedMonth}
                    onChange={(e) => {
                      setSelectedMonth(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-3 py-2 rounded-lg border-2 border-blue-200 bg-blue-50 text-blue-900 font-semibold text-base focus:outline-none focus:ring-2 focus:ring-blue-400 transition shadow-sm hover:border-blue-400 w-full sm:w-auto"
                  >
                    {monthOptions.map((m, idx) => (
                      <option key={m} value={idx}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
                  <label
                    htmlFor="year"
                    className="text-base font-semibold text-blue-700 sm:self-center sm:ml-2"
                  >
                    Año
                  </label>
                  <select
                    id="year"
                    value={selectedYear}
                    onChange={(e) => {
                      setSelectedYear(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-3 py-2 rounded-lg border-2 border-blue-200 bg-blue-50 text-blue-900 font-semibold text-base focus:outline-none focus:ring-2 focus:ring-blue-400 transition shadow-sm hover:border-blue-400 w-full sm:w-auto"
                  >
                    {yearOptions.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <button
              onClick={() => setopenModal(true)}
              className="px-5 py-2 bg-blue-600 text-white rounded-xl font-semibold shadow-lg hover:bg-blue-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Agregar Registro
            </button>
          </div>
          <div className="flex flex-col w-full justify-center items-center px-2 sm:px-6 py-7 gap-10">
            <div className="flex flex-col gap-6 justify-center items-center w-full max-w-2xl">
              {paginatedReservations?.map((finance) => {
                let customerName = undefined;
                if (finance.reservation_id) {
                  const reservation = reservationData.find(
                    (r) => r.id === finance.reservation_id
                  );
                  customerName = reservation?.customerName;
                }
                return (
                  <FinanceRecordItem
                    key={finance.id ?? finance.concept + finance.amount}
                    {...finance}
                    customerName={customerName}
                  />
                );
              })}
              {paginatedReservations.length === 0 && (
                <p className="text-center col-span-full text-gray-500">
                  No hay registros financieros para mostrar.
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
                        ? "bg-blue-500 text-white border-blue-500 scale-105"
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
            <div className="w-full flex flex-col md:flex-row justify-center items-center gap-6 md:gap-5 lg:gap-6 py-3 md:py-2 lg:py-2">
              <FinancesBalanceCard
                type="income"
                amount={totalIncome}
                monthName={monthName}
              />
              <FinancesBalanceCard
                type="expense"
                amount={totalExpense}
                monthName={monthName}
              />
              <FinancesBalanceCard
                type="balance"
                amount={totalBalance}
                monthName={monthName}
              />
            </div>
            <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              <div className="flex items-center justify-center min-w-[220px]">
                <FinancesPieChart financesData={financesData} />
              </div>
              <div className="flex items-center justify-center min-w-[220px]">
                <FinancesBarChart financesData={financesData} />
              </div>
              <div className="flex items-center justify-center min-w-[220px] md:col-span-2 lg:col-span-1">
                <FinancesLineChart financesData={anualFinancesData} />
              </div>
            </div>
          </div>
          {openModal && (
            <FinancesModal
              isOpen={openModal}
              handleOpenModal={handleOpenModal}
            />
          )}
        </>
      )}
    </div>
  );
}
