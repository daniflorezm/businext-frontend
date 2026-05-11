"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  BookingServicesResponse,
  BookingService,
  AvailabilitySlot,
  BookingRequestCreate,
  BookingLocation,
  BookingLocationsResponse,
} from "@/lib/booking-request/types";
import { ProductPlaceholder } from "@/components/common/ProductPlaceholder";

type Step = "location" | "service" | "employee" | "date" | "details" | "confirmation";

const STEPS_WITH_LOCATION = ["Local", "Servicio", "Profesional", "Fecha y hora", "Datos"] as const;
const STEPS_WITHOUT_LOCATION = ["Servicio", "Profesional", "Fecha y hora", "Datos"] as const;

export default function PublicBookingPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const [businessId, setBusinessId] = useState<string>("");
  const [step, setStep] = useState<Step>("location");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data
  const [businessName, setBusinessName] = useState<string>("");
  const [bookingLocations, setBookingLocations] = useState<BookingLocation[]>([]);
  const [servicesData, setServicesData] =
    useState<BookingServicesResponse | null>(null);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  // Selections
  const [selectedLocation, setSelectedLocation] = useState<BookingLocation | null>(null);
  const [selectedService, setSelectedService] = useState<BookingService | null>(
    null
  );
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(
    null
  );
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");

  // Resolve params
  useEffect(() => {
    params.then((p) => setBusinessId(p.businessId));
  }, [params]);

  // Fetch locations first
  useEffect(() => {
    if (!businessId) return;
    setLoading(true);
    fetch(`/api/public-book/${businessId}/locations`)
      .then((r) => {
        if (!r.ok) throw new Error("Business not found");
        return r.json();
      })
      .then((data: BookingLocationsResponse) => {
        setBusinessName(data.business_name);
        setBookingLocations(data.locations);
        // If only 1 location, auto-select and skip to services
        if (data.locations.length === 1) {
          setSelectedLocation(data.locations[0]);
          setStep("service");
        } else {
          setStep("location");
        }
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, [businessId]);

  // Fetch services when location is selected
  useEffect(() => {
    if (!businessId || !selectedLocation) return;
    fetch(`/api/public-book/${businessId}/services?location_id=${selectedLocation.id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Error loading services");
        return r.json();
      })
      .then((data) => {
        setServicesData(data);
      })
      .catch((e) => {
        setError(e.message);
      });
  }, [businessId, selectedLocation]);

  // Fetch availability when date changes
  useEffect(() => {
    if (!selectedDate || !businessId) return;
    setSlotsLoading(true);
    const params = new URLSearchParams({ date: selectedDate });
    if (selectedEmployee) params.set("employee_name", selectedEmployee);
    fetch(`/api/public-book/${businessId}/availability?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setSlots(data.slots || []);
        setSlotsLoading(false);
      })
      .catch(() => setSlotsLoading(false));
  }, [selectedDate, selectedEmployee, businessId]);

  const handleSubmit = async () => {
    if (!selectedSlot || !selectedService) return;
    setSubmitting(true);
    setError(null);

    const [hours, minutes] = selectedSlot.time.split(":");
    const requestedDate = `${selectedDate}T${hours}:${minutes}:00`;

    const body: BookingRequestCreate = {
      client_name: clientName,
      client_email: clientEmail,
      client_phone: clientPhone,
      employee_name: selectedEmployee,
      service: selectedService.name,
      requested_date: requestedDate,
      location_id: selectedLocation?.id ?? null,
    };

    try {
      const res = await fetch(`/api/public-book/${businessId}/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Error al enviar solicitud");
      }
      setStep("confirmation");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setSubmitting(false);
    }
  };

  // Generate next 14 days
  const next14Days = useMemo(() => {
    const days: string[] = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      days.push(d.toISOString().split("T")[0]);
    }
    return days;
  }, []);

  const hasMultipleLocations = bookingLocations.length > 1;
  const STEPS = hasMultipleLocations ? STEPS_WITH_LOCATION : STEPS_WITHOUT_LOCATION;
  const stepOrder: string[] = hasMultipleLocations
    ? ["location", "service", "employee", "date", "details"]
    : ["service", "employee", "date", "details"];
  const stepIndex = stepOrder.indexOf(step);

  // ─── Loading ───
  if (loading) {
    return (
      <Shell>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="h-8 w-8 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-sm text-foreground-muted">Cargando...</p>
        </div>
      </Shell>
    );
  }

  // ─── Error ───
  if (error && step !== "details") {
    return (
      <Shell>
        <div className="text-center py-16 px-4">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-500/10 mb-4">
            <svg
              className="w-7 h-7 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            No se pudo cargar
          </h2>
          <p className="text-sm text-foreground-muted">{error}</p>
        </div>
      </Shell>
    );
  }

  // ─── Confirmation ───
  if (step === "confirmation") {
    return (
      <Shell>
        <div className="text-center py-12 px-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/10 mb-5">
            <svg
              className="w-8 h-8 text-success"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            ¡Solicitud enviada!
          </h2>
          <p className="text-sm text-foreground-muted mb-6 max-w-xs mx-auto">
            Te hemos enviado un email de confirmación a{" "}
            <strong className="text-foreground">{clientEmail}</strong>. Te
            notificaremos cuando el negocio responda.
          </p>
          <div className="bg-surface rounded-xl p-4 text-left text-sm space-y-1.5 max-w-xs mx-auto border border-border">
            <DetailRow label="Servicio" value={selectedService?.name ?? ""} />
            <DetailRow
              label="Fecha"
              value={`${formatDateLabel(selectedDate)} · ${selectedSlot?.time}`}
            />
            {selectedEmployee && (
              <DetailRow label="Profesional" value={selectedEmployee} />
            )}
            {selectedLocation && (
              <DetailRow label="Local" value={selectedLocation.name} />
            )}
            {selectedLocation?.address && (
              <DetailRow label="Dirección" value={selectedLocation.address} />
            )}
          </div>
        </div>
      </Shell>
    );
  }

  // ─── Main Form ───
  return (
    <Shell>
      {/* Header */}
      <div className="text-center pt-2 pb-6">
        <h1 className="text-xl font-bold text-foreground tracking-tight">
          {businessName || servicesData?.business_name}
        </h1>
        <p className="text-sm text-foreground-subtle mt-1">Solicita tu cita</p>
        {selectedLocation && hasMultipleLocations && (
          <p className="text-xs text-foreground-muted mt-1">
            {selectedLocation.name}
            {selectedLocation.address && ` · ${selectedLocation.address}`}
          </p>
        )}
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-1.5 mb-8 px-2">
        {STEPS.map((label, i) => {
          const isCompleted = i < stepIndex;
          const isActive = i === stepIndex;
          return (
            <div key={label} className="flex-1">
              <div className="flex items-center justify-center mb-1.5">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors duration-300 ${
                    isCompleted
                      ? "bg-success text-success-foreground"
                      : isActive
                        ? "bg-secondary text-white"
                        : "bg-border text-foreground-subtle"
                  }`}
                >
                  {isCompleted ? (
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
              </div>
              <div
                className={`h-1 rounded-full transition-colors duration-300 ${
                  isCompleted
                    ? "bg-success"
                    : isActive
                      ? "bg-secondary"
                      : "bg-border"
                }`}
              />
              <p
                className={`text-[10px] mt-1.5 text-center font-medium transition-colors duration-300 ${
                  isCompleted
                    ? "text-success"
                    : isActive
                      ? "text-secondary"
                      : "text-foreground-subtle"
                }`}
              >
                {label}
              </p>
            </div>
          );
        })}
      </div>

      {/* ─── Step 0: Location ─── */}
      {step === "location" && (
        <div>
          <StepTitle>¿En qué local?</StepTitle>
          <div className="space-y-2.5">
            {bookingLocations.map((loc) => (
              <button
                key={loc.id}
                onClick={() => {
                  setSelectedLocation(loc);
                  setStep("service");
                }}
                className={`w-full flex items-start gap-3.5 px-3.5 py-3 rounded-xl border-2 transition-all duration-200 text-left ${
                  selectedLocation?.id === loc.id
                    ? "border-secondary bg-secondary/10"
                    : "border-border bg-surface hover:border-secondary/40"
                }`}
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-secondary/15 flex items-center justify-center mt-0.5">
                  <svg
                    className="w-5 h-5 text-secondary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${
                    selectedLocation?.id === loc.id ? "text-secondary" : "text-foreground"
                  }`}>
                    {loc.name}
                  </p>
                  {loc.address && (
                    <p className="text-xs text-foreground-subtle mt-0.5">
                      {loc.address}
                    </p>
                  )}
                  {loc.phone && (
                    <p className="text-xs text-foreground-subtle">
                      {loc.phone}
                    </p>
                  )}
                </div>
                {loc.maps_link && (
                  <a
                    href={loc.maps_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex-shrink-0 text-foreground-subtle hover:text-secondary transition-colors mt-1"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ─── Step 1: Service ─── */}
      {step === "service" && (
        <div>
          <StepTitle>¿Qué servicio necesitas?</StepTitle>
          <div className="space-y-2.5">
            {servicesData?.services.map((svc) => {
              const isSelected = selectedService?.id === svc.id;
              return (
                <button
                  key={svc.id}
                  onClick={() => {
                    setSelectedService(svc);
                    setStep("employee");
                  }}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl border-2 transition-all duration-200 text-left ${
                    isSelected
                      ? "border-secondary bg-secondary/10"
                      : "border-border bg-surface hover:border-secondary/40"
                  }`}
                >
                  {/* Image / placeholder */}
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden">
                    {svc.image_url ? (
                      <img
                        src={svc.image_url}
                        alt={svc.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ProductPlaceholder
                        type={svc.type}
                        className="w-full h-full rounded-lg"
                      />
                    )}
                  </div>

                  {/* Name + duration */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-semibold truncate ${
                        isSelected ? "text-secondary" : "text-foreground"
                      }`}
                    >
                      {svc.name}
                    </p>
                    <p className="text-xs text-foreground-subtle mt-0.5">
                      30 min
                    </p>
                  </div>

                  {/* Price badge */}
                  <span className="flex-shrink-0 px-2.5 py-1 rounded-lg bg-secondary/15 text-secondary text-xs font-bold">
                    {svc.price.toFixed(2)} €
                  </span>
                </button>
              );
            })}
          </div>
          {hasMultipleLocations && (
            <BackButton onClick={() => {
              setStep("location");
              setServicesData(null);
              setSelectedService(null);
            }} />
          )}
        </div>
      )}

      {/* ─── Step 2: Employee ─── */}
      {step === "employee" && (
        <div>
          <StepTitle>¿Con quién?</StepTitle>
          <div className="space-y-2">
            <OptionButton
              selected={selectedEmployee === null}
              onClick={() => {
                setSelectedEmployee(null);
                setStep("date");
              }}
            >
              <span className="flex items-center gap-2.5">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-border text-foreground-subtle">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </span>
                Cualquier profesional disponible
              </span>
            </OptionButton>
            {servicesData?.employees.map((emp) => (
              <OptionButton
                key={emp.name}
                selected={selectedEmployee === emp.name}
                onClick={() => {
                  setSelectedEmployee(emp.name);
                  setStep("date");
                }}
              >
                <span className="flex items-center gap-2.5">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-secondary/15 text-secondary text-xs font-bold">
                    {emp.name.charAt(0)}
                  </span>
                  {emp.name}
                </span>
              </OptionButton>
            ))}
          </div>
          <BackButton onClick={() => setStep("service")} />
        </div>
      )}

      {/* ─── Step 3: Date & Time ─── */}
      {step === "date" && (
        <div>
          <StepTitle>Elige fecha y hora</StepTitle>

          {/* Date carousel */}
          <div className="flex gap-2 overflow-x-auto pb-3 mb-5 -mx-1 px-1 scrollbar-hide">
            {next14Days.map((d) => {
              const dateObj = new Date(d + "T12:00:00");
              const dayName = dateObj.toLocaleDateString("es-ES", {
                weekday: "short",
              });
              const dayNum = dateObj.getDate();
              const month = dateObj.toLocaleDateString("es-ES", {
                month: "short",
              });
              const isSelected = selectedDate === d;
              return (
                <button
                  key={d}
                  onClick={() => {
                    setSelectedDate(d);
                    setSelectedSlot(null);
                  }}
                  className={`flex-shrink-0 flex flex-col items-center w-[58px] py-2.5 rounded-xl border-2 transition-all duration-200 ${
                    isSelected
                      ? "border-secondary bg-secondary text-white shadow-md shadow-secondary/20"
                      : "border-border bg-surface text-foreground-muted hover:border-secondary/40"
                  }`}
                >
                  <span className="text-[10px] font-medium uppercase tracking-wide opacity-70">
                    {dayName}
                  </span>
                  <span className="text-lg font-bold leading-tight">
                    {dayNum}
                  </span>
                  <span className="text-[10px] uppercase tracking-wide opacity-70">
                    {month}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Time slots */}
          {selectedDate && (
            <div>
              <p className="text-xs font-semibold text-foreground-subtle uppercase tracking-wider mb-3">
                Horarios disponibles
              </p>
              {slotsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-5 w-5 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
                  <span className="ml-2 text-sm text-foreground-muted">
                    Cargando...
                  </span>
                </div>
              ) : slots.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-foreground-muted">
                    No hay horarios disponibles para este día.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {slots.map((slot) => {
                    const isSlotSelected =
                      selectedSlot?.time === slot.time &&
                      selectedSlot?.employee_name === slot.employee_name;
                    return (
                      <button
                        key={`${slot.time}-${slot.employee_name}`}
                        onClick={() => {
                          setSelectedSlot(slot);
                          if (
                            !selectedEmployee &&
                            slot.employee_name !== "Cualquiera"
                          ) {
                            setSelectedEmployee(slot.employee_name);
                          }
                        }}
                        className={`relative px-2 py-2.5 rounded-xl border-2 transition-all duration-200 ${
                          isSlotSelected
                            ? "border-secondary bg-secondary/10 shadow-sm"
                            : "border-border bg-surface hover:border-secondary/40"
                        }`}
                      >
                        <span
                          className={`text-sm font-semibold ${
                            isSlotSelected
                              ? "text-secondary"
                              : "text-foreground"
                          }`}
                        >
                          {slot.time}
                        </span>
                        {!selectedEmployee && (
                          <span
                            className={`block text-[10px] mt-0.5 ${
                              isSlotSelected
                                ? "text-secondary-hover"
                                : "text-foreground-subtle"
                            }`}
                          >
                            {slot.employee_name}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between mt-6">
            <BackButton onClick={() => setStep("employee")} />
            <button
              onClick={() => setStep("details")}
              disabled={!selectedSlot}
              className="px-5 py-2.5 bg-secondary text-white rounded-xl text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-secondary-hover transition-colors shadow-sm shadow-secondary/20"
            >
              Continuar
            </button>
          </div>
        </div>
      )}

      {/* ─── Step 4: Client Details ─── */}
      {step === "details" && (
        <div>
          <StepTitle>Tus datos</StepTitle>

          {error && (
            <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <FormField label="Nombre completo" required>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-foreground placeholder:text-foreground-subtle text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-colors"
                placeholder="Tu nombre"
              />
            </FormField>
            <FormField label="Email" required>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-foreground placeholder:text-foreground-subtle text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-colors"
                placeholder="tu@email.com"
              />
            </FormField>
            <FormField label="Teléfono" required>
              <input
                type="tel"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-foreground placeholder:text-foreground-subtle text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-colors"
                placeholder="+34 612 345 678"
              />
            </FormField>
          </div>

          {/* Summary */}
          <div className="mt-6 bg-surface rounded-xl p-4 border border-border space-y-1.5">
            <p className="text-[10px] font-semibold text-foreground-subtle uppercase tracking-wider mb-2">
              Resumen
            </p>
            <DetailRow label="Servicio" value={selectedService?.name ?? ""} />
            <DetailRow
              label="Fecha"
              value={`${formatDateLabel(selectedDate)} · ${selectedSlot?.time}`}
            />
            {selectedEmployee && (
              <DetailRow label="Profesional" value={selectedEmployee} />
            )}
            {selectedLocation && (
              <DetailRow label="Local" value={selectedLocation.name} />
            )}
            {selectedLocation?.address && (
              <DetailRow label="Dirección" value={selectedLocation.address} />
            )}
          </div>

          <div className="flex items-center justify-between mt-6">
            <BackButton onClick={() => setStep("date")} />
            <button
              onClick={handleSubmit}
              disabled={submitting || !clientName || !clientEmail || !clientPhone}
              className="px-5 py-2.5 bg-secondary text-white rounded-xl text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-secondary-hover transition-colors shadow-sm shadow-secondary/20 flex items-center gap-2"
            >
              {submitting && (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {submitting ? "Enviando..." : "Enviar solicitud"}
            </button>
          </div>
        </div>
      )}
    </Shell>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background py-6 px-4 sm:py-10">
      <div className="max-w-md mx-auto">
        <div className="bg-surface-raised/60 rounded-2xl shadow-xl shadow-black/20 border border-border p-6 sm:p-8">
          {children}
        </div>
        <p className="text-center text-[11px] text-foreground-subtle mt-4">
          Powered by <span className="font-semibold text-secondary">Businext</span>
        </p>
      </div>
    </div>
  );
}

function StepTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-base font-bold text-foreground mb-4">{children}</h2>
  );
}

function OptionButton({
  children,
  onClick,
  selected,
}: {
  children: React.ReactNode;
  onClick: () => void;
  selected?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all duration-200 text-sm font-medium ${
        selected
          ? "border-secondary bg-secondary/10 text-secondary"
          : "border-border text-foreground bg-surface hover:border-secondary/40"
      }`}
    >
      {children}
    </button>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-sm text-foreground-subtle hover:text-foreground transition-colors flex items-center gap-1 mt-4"
    >
      <svg
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 19l-7-7 7-7"
        />
      </svg>
      Volver
    </button>
  );
}

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-foreground-subtle uppercase tracking-wide mb-1.5">
        {label} {required && <span className="text-secondary">*</span>}
      </label>
      {children}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-foreground-subtle">{label}</span>
      <span className="text-foreground font-medium">{value}</span>
    </div>
  );
}

function formatDateLabel(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}
