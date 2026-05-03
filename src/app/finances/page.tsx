"use client";
import React, { useMemo, useState } from "react";
import { useFinances } from "@/hooks/useFinances";
import SkeletonLoader, { SectionSkeleton } from "@/components/common/SkeletonLoader";
import { FinanceRecordItem } from "@/components/finances/FinanceRecordItem";
import { useReservation } from "@/hooks/useReservation";
import { FinancesModal } from "@/components/finances/FinancesModal";
import { FinancesBalanceCard } from "@/components/finances/FinancesBalanceCard";
import { FinancesPieChart } from "@/components/finances/FinancesPieChart";
import { FinancesBarChart } from "@/components/finances/FinancesBarChart";
import { FinancesLineChart } from "@/components/finances/FinancesLineChart";
import { DailyOverview } from "@/components/finances/DailyOverview";
import { monthOptions } from "@/lib/finances/types";
import { useAccessContext } from "@/hooks/useAccessContext";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from "@/components/ui/tabs";
import { Plus, ShieldAlert, ChevronLeft, ChevronRight, Receipt } from "lucide-react";
import "@/lib/chartjs-dark-theme";

export default function FinancesPage() {
  const { capabilities, loading: contextLoading } = useAccessContext();

  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());

  const {
    financesData,
    anualFinancesData,
    loading,
  } = useFinances(selectedYear);
  const { reservationData } = useReservation();
  const [openModal, setopenModal] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState<"ALL" | "INCOME" | "EXPENSE">(
    "ALL"
  );
  const [issuerFilter, setIssuerFilter] = useState<string>("");
  const itemsPerPage = 5;

  const handleOpenModal = () => {
    setopenModal(!openModal);
  };

  const monthName = monthOptions[selectedMonth];

  const yearOptions = Array.from(
    { length: 5 },
    (_, i) => now.getFullYear() - 2 + i
  );

  const filteredFinances = useMemo(
    () =>
      financesData.filter((f) => {
        if (!f.created_at) return false;
        const date = new Date(f.created_at);
        const matchesMonth =
          date.getMonth() === selectedMonth &&
          date.getFullYear() === selectedYear;
        const matchesType = filterType === "ALL" ? true : f.type === filterType;
        const matchesIssuer = issuerFilter
          ? f.creator?.toLowerCase().includes(issuerFilter.toLowerCase())
          : true;
        return matchesMonth && matchesType && matchesIssuer;
      }),
    [financesData, selectedMonth, selectedYear, filterType, issuerFilter]
  );

  const sortedReservations = useMemo(
    () =>
      [...filteredFinances].sort(
        (a, b) =>
          new Date(b.created_at ?? "").getTime() -
          new Date(a.created_at ?? "").getTime()
      ),
    [filteredFinances]
  );

  const totalPages = Math.ceil(sortedReservations.length / itemsPerPage);
  const paginatedReservations = sortedReservations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalIncome = useMemo(
    () =>
      financesData
        .filter((f) => {
          if (!f.created_at) return false;
          const date = new Date(f.created_at);
          return (
            date.getMonth() === selectedMonth &&
            date.getFullYear() === selectedYear &&
            f.type === "INCOME"
          );
        })
        .reduce((sum, f) => sum + f.amount, 0),
    [financesData, selectedMonth, selectedYear]
  );

  const totalExpense = useMemo(
    () =>
      financesData
        .filter((f) => {
          if (!f.created_at) return false;
          const date = new Date(f.created_at);
          return (
            date.getMonth() === selectedMonth &&
            date.getFullYear() === selectedYear &&
            f.type === "EXPENSE"
          );
        })
        .reduce((sum, f) => sum + f.amount, 0),
    [financesData, selectedMonth, selectedYear]
  );

  const totalBalance = totalIncome - totalExpense;

  /* ── Loading state ── */
  if (contextLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen p-6">
        <SkeletonLoader rows={6} />
      </div>
    );
  }

  /* ── Access denied ── */
  if (!capabilities.canManageFinances) {
    return (
      <div className="flex justify-center items-center min-h-screen px-4">
        <Card variant="elevated" className="max-w-xl border-warning/40">
          <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
            <ShieldAlert className="h-10 w-10 text-warning" />
            <h2 className="font-heading text-h3 font-bold text-warning">
              Acceso restringido
            </h2>
            <p className="text-body-sm text-foreground-muted">
              No tienes permisos para ver las finanzas del negocio.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full pt-14 md:pt-0">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* ── Header + Create button ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-h2 font-bold text-foreground">
              Finanzas
            </h1>
            <p className="text-body-sm text-foreground-muted mt-1">
              Resumen financiero de {monthName} {selectedYear}
            </p>
          </div>
          <Button variant="primary" onClick={() => setopenModal(true)}>
            <Plus className="h-4 w-4" />
            Agregar Registro
          </Button>
        </div>

        {/* ── Balance cards row ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

        {/* ── Daily overview ── */}
        <DailyOverview financesData={financesData} reservationData={reservationData} loading={loading} />

        {/* ── Filters bar ── */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row flex-wrap items-start md:items-center gap-3">
              {/* Type filter buttons */}
              <div className="flex gap-2">
                {(
                  [
                    { key: "ALL", label: "Todos" },
                    { key: "INCOME", label: "Ingresos" },
                    { key: "EXPENSE", label: "Gastos" },
                  ] as const
                ).map(({ key, label }) => (
                  <Button
                    key={key}
                    variant={filterType === key ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => {
                      setFilterType(key);
                      setCurrentPage(1);
                    }}
                  >
                    {label}
                  </Button>
                ))}
              </div>

              {/* Month / Year selectors */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <label
                  htmlFor="month"
                  className="text-label font-semibold text-foreground-muted"
                >
                  Mes
                </label>
                <Select
                  id="month"
                  value={selectedMonth}
                  onChange={(e) => {
                    setSelectedMonth(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="w-full sm:w-auto"
                >
                  {monthOptions.map((m, idx) => (
                    <option key={m} value={idx}>
                      {m}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <label
                  htmlFor="year"
                  className="text-label font-semibold text-foreground-muted"
                >
                  Año
                </label>
                <Select
                  id="year"
                  value={selectedYear}
                  onChange={(e) => {
                    setSelectedYear(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="w-full sm:w-auto"
                >
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Issuer search */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 flex-1 min-w-0">
                <label
                  htmlFor="issuer"
                  className="text-label font-semibold text-foreground-muted whitespace-nowrap"
                >
                  Emisor
                </label>
                <Input
                  id="issuer"
                  type="text"
                  placeholder="Buscar por emisor..."
                  value={issuerFilter}
                  onChange={(e) => {
                    setIssuerFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full sm:w-auto sm:min-w-[180px]"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Main content: two-column on desktop ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left column: record list */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-h4 font-semibold text-foreground">
                Registros
              </h2>
              <span className="text-caption text-foreground-muted">
                {sortedReservations.length} registro{sortedReservations.length !== 1 && "s"}
              </span>
            </div>

            {loading ? (
              <SectionSkeleton />
            ) : paginatedReservations.length === 0 ? (
              <EmptyState
                icon={<Receipt />}
                title="Sin registros"
                description="No hay registros financieros para los filtros seleccionados."
                action={{
                  label: "Agregar Registro",
                  onClick: () => setopenModal(true),
                }}
              />
            ) : (
              <div className="flex flex-col gap-3">
                {paginatedReservations.map((finance) => {
                  return (
                    <FinanceRecordItem
                      key={finance.id ?? finance.concept + finance.amount}
                      {...finance}
                      customerName={finance?.customer_name ?? ""}
                    />
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <span className="text-caption text-foreground-muted">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Right column: charts */}
          <div className="lg:col-span-2">
            <TabGroup>
              <TabList>
                <Tab>Barras</Tab>
                <Tab>Pastel</Tab>
                <Tab>Línea</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <FinancesBarChart financesData={financesData} />
                </TabPanel>
                <TabPanel>
                  <FinancesPieChart financesData={financesData} />
                </TabPanel>
                <TabPanel>
                  <FinancesLineChart financesData={anualFinancesData} />
                </TabPanel>
              </TabPanels>
            </TabGroup>
          </div>
        </div>
      </div>

      {/* ── Create modal ── */}
      {openModal && (
        <FinancesModal isOpen={openModal} handleOpenModal={handleOpenModal} />
      )}
    </div>
  );
}
