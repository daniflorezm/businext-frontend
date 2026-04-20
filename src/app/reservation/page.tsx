"use client";
import React, { useState, useMemo } from "react";
import { useReservation } from "@/hooks/useReservation";
import { useProduct } from "@/hooks/useProduct";
import { Reservation } from "@/lib/reservation/types";
import { Product } from "@/lib/product/types";
import { ReservationCalendar } from "@/components/reservation/ReservationCalendar";
import { ServiceCards } from "@/components/reservation/ServiceCards";
import { QuickReservationForm } from "@/components/reservation/QuickReservationForm";
import { ReservationTimeline } from "@/components/reservation/ReservationTimeline";
import { CompactCalendar } from "@/components/reservation/CompactCalendar";
import { SectionSkeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from "@/components/ui/tabs";
import { Info, Search, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ReservationPage() {
  const {
    createReservation,
    reservationData,
    loading: reservationLoading,
  } = useReservation();
  const { productData, loading: productLoading } = useProduct();

  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState("ALL");
  const [employeeFilter, setEmployeeFilter] = useState("ALL");
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedService, setSelectedService] = useState<Product | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const itemsPerPage = 6;

  const loading = reservationLoading;

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
    const day = now.getDay();
    const daysSinceMonday = (day + 6) % 7;
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

  // Filter by customer name
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
  }

  // Always sort by reservationStartDate ascending
  filteredReservations.sort(
    (a, b) =>
      new Date(a.reservationStartDate).getTime() -
      new Date(b.reservationStartDate).getTime()
  );

  // Pagination
  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);
  const paginatedReservations = filteredReservations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reservation dates for compact calendar dot indicators
  const reservationDates = useMemo(
    () => reservationData.map((r) => new Date(r.reservationStartDate)),
    [reservationData]
  );

  const handleServiceSelect = (product: Product) => {
    setSelectedService(
      selectedService?.id === product.id ? null : product
    );
  };

  const handleQuickReservation = async (data: Reservation) => {
    await createReservation(data);
    setSelectedService(null);
  };

  return (
    <div className="min-h-screen w-full bg-background pt-14 md:pt-0">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 space-y-6">
        {/* Page header */}
        <h1 className="font-heading text-h2 font-semibold text-foreground">
          Reservas
        </h1>

        {/* Info banner */}
        <div className="flex items-center gap-3 bg-surface-raised border border-border-subtle rounded-lg px-4 py-3">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/15">
            <Info className="h-5 w-5 text-primary" />
          </span>
          <span className="text-body-sm text-foreground-muted">
            Cada vez que una reserva se marca como{" "}
            <span className="font-semibold text-success">completada</span>, se
            crea automáticamente un registro financiero de tipo{" "}
            <span className="font-semibold text-primary">
              &quot;ingreso&quot;
            </span>
            .
          </span>
        </div>

        {/* ── Service-first creation flow ── */}
        <section className="space-y-2">
          <h2 className="font-heading text-h4 font-semibold text-foreground">
            Selecciona un servicio
          </h2>
          <ServiceCards
            services={productData}
            selectedId={selectedService?.id ?? null}
            onSelect={handleServiceSelect}
            loading={productLoading}
          />
          <QuickReservationForm
            selectedService={selectedService}
            onSubmit={handleQuickReservation}
            onCancel={() => setSelectedService(null)}
            loading={loading}
          />
        </section>

        {/* ── Filters ── */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 items-start sm:items-center">
          <span className="text-body-sm font-semibold text-foreground-muted mr-1">
            Filtrar por:
          </span>
          <div className="flex flex-row flex-wrap gap-2">
            {[
              { label: "Hoy", value: "TODAY" },
              { label: "Semana", value: "WEEK" },
              { label: "Todas", value: "ALL" },
            ].map((btn) => (
              <Button
                key={btn.value}
                variant={filter === btn.value ? "primary" : "secondary"}
                size="sm"
                onClick={() => {
                  setFilter(btn.value);
                  setCurrentPage(1);
                }}
              >
                {btn.label}
              </Button>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
            <label
              htmlFor="customer-search"
              className="text-caption text-foreground-muted font-medium flex items-center gap-1"
            >
              <Search className="h-3.5 w-3.5" />
              Cliente:
            </label>
            <Input
              id="customer-search"
              type="text"
              value={customerSearch}
              onChange={(e) => {
                setCustomerSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Buscar por nombre"
              className="w-full sm:w-[180px] h-8 text-caption"
            />
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
            <label
              htmlFor="employee-select"
              className="text-caption text-foreground-muted font-medium"
            >
              Empleado:
            </label>
            <Select
              id="employee-select"
              value={employeeFilter}
              onChange={(e) => {
                setEmployeeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full sm:w-[180px] h-8 text-caption"
            >
              {getStaffList(reservationData).map((s) => (
                <option key={s} value={s}>
                  {s === "ALL" ? "Todos" : s}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {/* ── Main content ── */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: Tabs (Timeline / Calendar) */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <SectionSkeleton />
            ) : (
              <TabGroup>
                <TabList>
                  <Tab>Lista</Tab>
                  <Tab>Calendario</Tab>
                </TabList>
                <TabPanels>
                  <TabPanel>
                    <ReservationTimeline
                      reservations={paginatedReservations}
                      loading={loading}
                    />

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex flex-wrap justify-center mt-6 gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            setCurrentPage((p) => Math.max(1, p - 1))
                          }
                          disabled={currentPage === 1}
                        >
                          Anterior
                        </Button>
                        {Array.from({ length: totalPages }, (_, i) => (
                          <Button
                            key={i}
                            variant={
                              currentPage === i + 1 ? "primary" : "secondary"
                            }
                            size="sm"
                            onClick={() => setCurrentPage(i + 1)}
                          >
                            {i + 1}
                          </Button>
                        ))}
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            setCurrentPage((p) =>
                              Math.min(totalPages, p + 1)
                            )
                          }
                          disabled={currentPage === totalPages}
                        >
                          Siguiente
                        </Button>
                      </div>
                    )}
                  </TabPanel>
                  <TabPanel>
                    <ReservationCalendar
                      reservationData={reservationData}
                      apiCreateEvent={createReservation}
                      loading={loading}
                    />
                  </TabPanel>
                </TabPanels>
              </TabGroup>
            )}
          </div>

          {/* Right sidebar: CompactCalendar (desktop) */}
          <aside className="hidden lg:block flex-shrink-0">
            <CompactCalendar
              selectedDate={selectedDate}
              onDateSelect={(date) => {
                setSelectedDate(date);
                // When a date is picked, filter to today for that date
                setFilter("TODAY");
                setCurrentPage(1);
              }}
              reservationDates={reservationDates}
            />
          </aside>

          {/* Mobile: collapsible calendar section */}
          <div className="lg:hidden">
            <button
              type="button"
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-lg border border-border-subtle bg-surface text-body-sm font-medium text-foreground transition-colors duration-150",
                calendarOpen && "border-primary/50"
              )}
              onClick={() => setCalendarOpen(!calendarOpen)}
            >
              <span>Calendario</span>
              {calendarOpen ? (
                <ChevronUp className="h-4 w-4 text-foreground-muted" />
              ) : (
                <ChevronDown className="h-4 w-4 text-foreground-muted" />
              )}
            </button>
            {calendarOpen && (
              <div className="mt-2 flex justify-center">
                <CompactCalendar
                  selectedDate={selectedDate}
                  onDateSelect={(date) => {
                    setSelectedDate(date);
                    setFilter("TODAY");
                    setCurrentPage(1);
                  }}
                  reservationDates={reservationDates}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
