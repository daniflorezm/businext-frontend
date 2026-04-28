"use client";
import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useReservation } from "@/hooks/useReservation";
import { useProduct } from "@/hooks/useProduct";
import { useEmployee } from "@/hooks/useEmployee";
import { useAccessContext } from "@/hooks/useAccessContext";
import { useWorkingHours } from "@/hooks/useWorkingHours";
import { useFinances } from "@/hooks/useFinances";
import { Reservation } from "@/lib/reservation/types";
import { Product } from "@/lib/product/types";
import { getAvailableSlots, isDayClosed } from "@/lib/scheduling/availability";
import { AvailableSlots } from "@/components/reservation/AvailableSlots";
import { ServiceCards } from "@/components/reservation/ServiceCards";
import { QuickReservationForm } from "@/components/reservation/QuickReservationForm";
import {
  TodayTimeline,
  GroupedPendingList,
} from "@/components/reservation/ReservationTimeline";
import { CompactCalendar } from "@/components/reservation/CompactCalendar";
import { ReservationKPIs } from "@/components/reservation/ReservationKPIs";
import { Card, CardContent } from "@/components/ui/card";
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from "@/components/ui/tabs";
import { Select } from "@/components/ui/select";
import { SectionSkeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ProductSaleForm } from "@/components/reservation/ProductSaleForm";
import { TodaySalesList } from "@/components/reservation/TodaySalesList";
import { WalkInModal } from "@/components/reservation/WalkInModal";

import { Info, CalendarPlus, ClipboardList, CalendarClock, Zap } from "lucide-react";

export default function ReservationPage() {
  const {
    createReservation,
    reservationData,
    loading: reservationLoading,
  } = useReservation();
  const { productData, loading: productLoading } = useProduct();
  const { activeEmployees } = useEmployee();
  const { context, loading: contextLoading } = useAccessContext();
  const { workingHoursData, loading: workingHoursLoading } = useWorkingHours();
  const { financesData, createFinance, loading: financesLoading } = useFinances();

  const [selectedService, setSelectedService] = useState<Product | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const loading = reservationLoading;

  const isOwner = context?.role === "owner";
  const currentUserName =
    context?.profile?.displayName ?? context?.profile?.email ?? "";

  const [slotInCharge, setSlotInCharge] = useState("");

  useEffect(() => {
    if (!isOwner && !slotInCharge && currentUserName) {
      setSlotInCharge(currentUserName);
    }
  }, [currentUserName, slotInCharge, isOwner]);

  // Non-owners only see their own reservations
  const filteredReservations = useMemo(() => {
    if (isOwner || !currentUserName) return reservationData;
    return reservationData.filter(
      (r) => r.inCharge.toLowerCase() === currentUserName.toLowerCase()
    );
  }, [reservationData, isOwner, currentUserName]);

  const reservationDates = useMemo(
    () => filteredReservations.map((r) => new Date(r.reservationStartDate)),
    [filteredReservations]
  );

  const dayClosed = useMemo(
    () => isDayClosed(selectedDate, workingHoursData),
    [selectedDate, workingHoursData]
  );

  const availableSlots = useMemo(() => {
    if (dayClosed || !slotInCharge) return [];
    return getAvailableSlots(
      selectedDate,
      workingHoursData,
      reservationData, // all reservations for slot availability
      slotInCharge
    );
  }, [selectedDate, workingHoursData, reservationData, slotInCharge, dayClosed]);

  const handleServiceSelect = (product: Product) => {
    setSelectedService(
      selectedService?.id === product.id ? null : product
    );
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleInChargeChange = useCallback((name: string) => {
    if (name) setSlotInCharge(name);
    setSelectedSlot(null);
  }, []);

  const handleQuickReservation = async (data: Reservation) => {
    await createReservation(data);
    setSelectedService(null);
    setSelectedSlot(null);
  };

  // ── Walk-in (atención inmediata) ──
  const [walkInOpen, setWalkInOpen] = useState(false);

  const handleWalkIn = async (data: Reservation) => {
    const created = await createReservation(data);
    if (created) {
      // Create finance record for completed reservation
      const service = productData.find((p) => p.name === data.service);
      await createFinance({
        concept: data.service,
        amount: service?.price || 0,
        type: "INCOME",
        creator: data.inCharge,
        reservation_id: created.id,
      });
    }
  };

  // Today timeline: "timeline" (pending+completed) or "completed" (completed only)
  const [todayView, setTodayView] = useState<"timeline" | "completed">("timeline");

  // Highlight pending cards state
  const [highlightPending, setHighlightPending] = useState(false);
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const todayTimelineRef = useRef<HTMLDivElement>(null);

  const handleCompletedKpiClick = useCallback(() => {
    setTodayView("completed");
    todayTimelineRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handlePendingKpiClick = useCallback(() => {
    setTodayView("timeline");
    todayTimelineRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    // Highlight pending cards for 5s
    if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
    setHighlightPending(true);
    highlightTimerRef.current = setTimeout(() => setHighlightPending(false), 5000);
  }, []);

  // Clear highlight on any click outside
  useEffect(() => {
    if (!highlightPending) return;
    const handler = () => {
      setHighlightPending(false);
      if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
    };
    // Delay listener so the triggering click doesn't immediately clear it
    const id = setTimeout(() => document.addEventListener("click", handler, { once: true }), 100);
    return () => {
      clearTimeout(id);
      document.removeEventListener("click", handler);
    };
  }, [highlightPending]);

  // Check if there are non-today pending reservations
  const hasNonTodayPending = useMemo(() => {
    const today = new Date();
    return filteredReservations.some((r) => {
      if (r.status !== "PENDING") return false;
      const d = new Date(r.reservationStartDate);
      return (
        d.getFullYear() !== today.getFullYear() ||
        d.getMonth() !== today.getMonth() ||
        d.getDate() !== today.getDate()
      );
    });
  }, [filteredReservations]);

  return (
    <div className="min-h-screen w-full bg-background pt-14 md:pt-0">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 space-y-6">
        {/* Page header */}
        <h1 className="font-heading text-h2 font-bold text-foreground">
          Reservas
        </h1>

        {/* Info banner */}
        <div className="flex items-center gap-3 bg-surface-raised/60 border border-border-subtle rounded-md px-4 py-3">
          <span className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/15">
            <Info className="h-4 w-4 text-primary" />
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

        {/* ═══════════════════════════════════════════
            SECTION 1 — KPIs
            ═══════════════════════════════════════════ */}
        <ReservationKPIs
          reservationData={filteredReservations}
          productData={productData}
          financesData={financesData}
          onPendingClick={handlePendingKpiClick}
          onCompletedClick={handleCompletedKpiClick}
        />

        {/* ═══════════════════════════════════════════
            SECTION 2 — Crear reserva
            ═══════════════════════════════════════════ */}
        <Card>
          <CardContent className="p-4 sm:p-6 space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="font-heading text-h4 font-semibold text-foreground flex items-center gap-2">
                <CalendarPlus className="h-5 w-5 text-primary" />
                Crear reserva
              </h2>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setWalkInOpen(true)}
              >
                <Zap className="h-4 w-4" />
                Atención inmediata
              </Button>
            </div>

            <TabGroup>
              <TabList>
                <Tab>Servicios</Tab>
                <Tab>Productos</Tab>
              </TabList>
              <TabPanels>
                {/* ── Servicios tab ── */}
                <TabPanel>
                  <div className="space-y-5">
                    {/* Step 1: Service selection */}
                    <div className="space-y-2">
                      <p className="text-caption text-foreground-muted font-medium uppercase tracking-wider">
                        1. Servicio
                      </p>
                      <ServiceCards
                        services={productData}
                        selectedId={selectedService?.id ?? null}
                        onSelect={handleServiceSelect}
                        loading={productLoading}
                      />
                    </div>

                    {/* Step 2: Date + time (only when service selected) */}
                    {selectedService && (
                      <div className="space-y-3">
                        <p className="text-caption text-foreground-muted font-medium uppercase tracking-wider">
                          2. Fecha y hora
                        </p>

                        {/* Owner: select in-charge first */}
                        {isOwner && (
                          <div className="space-y-1.5 max-w-xs">
                            <label className="text-caption text-foreground-muted">
                              Encargado
                            </label>
                            <Select
                              value={slotInCharge}
                              onChange={(e) => {
                                const name = e.target.value;
                                setSlotInCharge(name);
                                setSelectedSlot(null);
                              }}
                            >
                              <option value="">Seleccionar encargado</option>
                              <option value={currentUserName}>{currentUserName} (Tú)</option>
                              {activeEmployees.map((emp) => (
                                <option key={emp.memberUserId} value={emp.displayName ?? ""}>
                                  {emp.displayName ?? emp.email}
                                </option>
                              ))}
                            </Select>
                            {!slotInCharge && (
                              <p className="text-[11px] text-warning">
                                Selecciona un encargado para ver los horarios disponibles.
                              </p>
                            )}
                          </div>
                        )}

                        {/* Show calendar + slots only when in-charge is set (always true for non-owners) */}
                        {slotInCharge && (
                        <div className="flex flex-col md:flex-row gap-4">
                          <CompactCalendar
                            selectedDate={selectedDate}
                            onDateSelect={handleDateSelect}
                            reservationDates={reservationDates}
                          />
                          <div className="flex-1 min-w-0 space-y-2">
                            <p className="text-caption text-foreground-muted">
                              Horarios disponibles para{" "}
                              <span className="font-semibold text-foreground">
                                {selectedDate.toLocaleDateString("es-ES", {
                                  weekday: "long",
                                  day: "numeric",
                                  month: "long",
                                })}
                              </span>
                              {slotInCharge && (
                                <>
                                  {" — "}
                                  <span className="font-semibold text-accent">
                                    {slotInCharge}
                                  </span>
                                </>
                              )}
                            </p>
                            <AvailableSlots
                              slots={availableSlots}
                              onSlotSelect={(slot) => setSelectedSlot(slot)}
                              loading={workingHoursLoading}
                              closedMessage={
                                dayClosed
                                  ? "Este día el negocio está cerrado."
                                  : undefined
                              }
                              selectedSlot={selectedSlot}
                            />
                          </div>
                        </div>
                        )}
                      </div>
                    )}

                    {/* Step 3: Form */}
                    {selectedService && (
                      <div className="space-y-2">
                        <p className="text-caption text-foreground-muted font-medium uppercase tracking-wider">
                          3. Datos de la reserva
                        </p>
                        <QuickReservationForm
                          selectedService={selectedService}
                          onSubmit={handleQuickReservation}
                          onCancel={() => setSelectedService(null)}
                          loading={loading}
                          isOwner={isOwner}
                          currentUserName={currentUserName}
                          employees={activeEmployees}
                          prefilledDate={selectedDate}
                          prefilledSlot={selectedSlot ?? undefined}
                          onInChargeChange={handleInChargeChange}
                          ownerSelectedInCharge={slotInCharge}
                        />
                      </div>
                    )}
                  </div>
                </TabPanel>

                {/* ── Productos tab ── */}
                <TabPanel>
                  <ProductSaleForm
                    productData={productData}
                    currentUserName={currentUserName}
                    loading={productLoading}
                    onSale={async (saleData) => {
                      await createFinance(saleData);
                    }}
                  />
                </TabPanel>
              </TabPanels>
            </TabGroup>
          </CardContent>
        </Card>

        {/* ═══════════════════════════════════════════
            SECTION 3 — Reservas de hoy
            ═══════════════════════════════════════════ */}
        <section className="space-y-3" ref={todayTimelineRef}>
          <h2 className="font-heading text-h4 font-semibold text-foreground flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            Reservas de hoy
          </h2>
          {loading || contextLoading ? (
            <SectionSkeleton />
          ) : (
            <TodayTimeline
              reservations={filteredReservations}
              loading={loading}
              view={todayView}
              onViewChange={setTodayView}
              highlightPending={highlightPending}
            />
          )}
        </section>

        {/* ═══════════════════════════════════════════
            SECTION 4 — Reservas pendientes (otros días) — only if they exist
            ═══════════════════════════════════════════ */}
        {!loading && !contextLoading && hasNonTodayPending && (
          <section className="space-y-3">
            <h2 className="font-heading text-h4 font-semibold text-foreground flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-warning" />
              Reservas pendientes
            </h2>
            <GroupedPendingList
              reservations={filteredReservations}
              loading={loading}
            />
          </section>
        )}

        {/* ═══════════════════════════════════════════
            SECTION 5 — Ventas del día (product sales)
            ═══════════════════════════════════════════ */}
        <TodaySalesList
          financesData={financesData}
          currentUserName={currentUserName}
          isOwner={isOwner}
          loading={financesLoading}
        />

        {/* Walk-in modal */}
        <WalkInModal
          open={walkInOpen}
          onClose={() => setWalkInOpen(false)}
          services={productData}
          isOwner={isOwner}
          currentUserName={currentUserName}
          employees={activeEmployees}
          onSubmit={handleWalkIn}
        />
      </div>
    </div>
  );
}
