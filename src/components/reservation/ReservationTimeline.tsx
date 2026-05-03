"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Reservation } from "@/lib/reservation/types";
import { useReservation } from "@/hooks/useReservation";
import { useProduct } from "@/hooks/useProduct";
import { useAccessContext } from "@/hooks/useAccessContext";
import { useEmployee } from "@/hooks/useEmployee";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { ReservationModal } from "@/components/reservation/ReservationModal";
import { CompleteReservationModal } from "@/components/reservation/CompleteReservationModal";
import { DeleteModal } from "@/components/reservation/DeleteReservationModal";
import {
  Calendar,
  Clock,
  User,
  Edit3,
  CheckCircle,
  Trash2,
  CalendarClock,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Helpers ── */

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}

function formatShortDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    weekday: "short",
  });
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function useNow() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);
  return now;
}

/* ── Date grouping for pending reservations ── */

interface DateGroup {
  label: string;
  reservations: Reservation[];
}

function groupPendingByDate(reservations: Reservation[]): DateGroup[] {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const todayMs = now.getTime();

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const dayAfterTomorrow = new Date(now);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  const lastWeek = new Date(now);
  lastWeek.setDate(lastWeek.getDate() - 7);

  const buckets: Record<string, Reservation[]> = {
    overdue_old: [],    // > 1 week ago
    overdue_week: [],   // 2-7 days ago
    overdue_yesterday: [], // yesterday
    tomorrow: [],       // tomorrow
    this_week: [],      // 2-6 days from now
    next_week: [],      // 7-14 days from now
    later: [],          // > 14 days
  };

  for (const r of reservations) {
    const d = new Date(r.reservationStartDate);
    d.setHours(0, 0, 0, 0);
    const ms = d.getTime();

    // Skip today — shown in timeline
    if (ms === todayMs) continue;

    if (ms < lastWeek.getTime()) {
      buckets.overdue_old.push(r);
    } else if (ms < yesterday.getTime()) {
      buckets.overdue_week.push(r);
    } else if (isSameDay(d, yesterday)) {
      buckets.overdue_yesterday.push(r);
    } else if (isSameDay(d, tomorrow)) {
      buckets.tomorrow.push(r);
    } else if (ms < nextWeek.getTime()) {
      buckets.this_week.push(r);
    } else if (ms < nextWeek.getTime() + 7 * 86400000) {
      buckets.next_week.push(r);
    } else {
      buckets.later.push(r);
    }
  }

  const labels: Record<string, string> = {
    overdue_old: "Hace más de una semana",
    overdue_week: "Hace menos de una semana",
    overdue_yesterday: "Ayer",
    tomorrow: "Mañana",
    this_week: "Esta semana",
    next_week: "Próxima semana",
    later: "Más adelante",
  };

  // Order: overdue first (oldest), then future (soonest)
  const order = [
    "overdue_old",
    "overdue_week",
    "overdue_yesterday",
    "tomorrow",
    "this_week",
    "next_week",
    "later",
  ];

  const groups: DateGroup[] = [];
  for (const key of order) {
    if (buckets[key].length > 0) {
      // Sort within group
      buckets[key].sort(
        (a, b) =>
          new Date(a.reservationStartDate).getTime() -
          new Date(b.reservationStartDate).getTime()
      );
      groups.push({ label: labels[key], reservations: buckets[key] });
    }
  }

  return groups;
}

/* ══════════════════════════════════════════════════
   ReservationCard — unified card for both statuses
   ══════════════════════════════════════════════════ */

interface ReservationCardProps {
  reservation: Reservation;
  price?: number;
  showDate?: boolean;
  actions?: React.ReactNode;
  compact?: boolean;
  highlight?: boolean;
}

function ReservationCard({
  reservation,
  price,
  showDate,
  actions,
  compact,
  highlight,
}: ReservationCardProps) {
  const isPending = reservation.status === "PENDING";

  const styles = isPending
    ? {
        bg: "bg-accent/[0.04]",
        border: "border-accent/15",
        hoverBorder: "hover:border-accent/30",
        avatar: "bg-accent/15 text-accent",
        amount: "text-accent",
        separator: "border-accent/10",
      }
    : {
        bg: "bg-success/[0.04]",
        border: "border-success/15",
        hoverBorder: "hover:border-success/30",
        avatar: "bg-success/15 text-success",
        amount: "text-success",
        separator: "border-success/10",
      };

  return (
    <div
      className={cn(
        "group rounded-md border transition-all duration-150 ease-snappy",
        compact ? "px-2.5 py-2 sm:px-3 sm:py-2.5" : "p-3 sm:p-4",
        styles.bg,
        styles.border,
        styles.hoverBorder,
        highlight && "ring-2 ring-highlight ring-offset-1 ring-offset-background animate-pulse"
      )}
    >
      {/* Row 1: Status dot + Name + Service + Amount + Actions */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span
            className={cn(
              "flex-shrink-0 h-1.5 w-1.5 rounded-full",
              isPending ? "bg-accent" : "bg-success"
            )}
          />
          <div
            className={cn(
              "flex-shrink-0 rounded-full flex items-center justify-center font-semibold",
              compact ? "h-7 w-7 text-[10px]" : "h-8 w-8 text-[11px]",
              styles.avatar
            )}
          >
            {getInitials(reservation.customerName)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-body-sm font-semibold text-foreground truncate leading-tight">
              {reservation.customerName}
            </p>
            <p className="text-[11px] text-foreground-muted truncate leading-tight">
              {reservation.service}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {showDate && (
            <span className="text-[10px] text-foreground-subtle capitalize tabular-nums">
              {formatShortDate(reservation.reservationStartDate)}
            </span>
          )}
          {typeof price === "number" && price > 0 && (
            <span
              className={cn(
                "text-body-sm font-semibold tabular-nums",
                styles.amount
              )}
            >
              {price.toLocaleString("es-ES")}€
            </span>
          )}
          {actions && (
            <div className="flex items-center gap-0.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-150">
              {actions}
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Metadata */}
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 mt-1.5 pl-[calc(0.375rem+0.5rem)] text-[11px] text-foreground-subtle">
        <span className="inline-flex items-center gap-1">
          <User className="h-2.5 w-2.5" />
          <span className="truncate max-w-[7rem]">{reservation.inCharge}</span>
        </span>
        <span className="text-foreground-subtle/40">·</span>
        <span className="tabular-nums">{reservation.timePerReservation} min</span>
        <span className="text-foreground-subtle/40">·</span>
        <span className="tabular-nums font-medium">
          {formatTime(reservation.reservationStartDate)} — {formatTime(reservation.reservationEndDate)}
        </span>
      </div>
    </div>
  );
}

/* ── Action buttons ── */

function PendingActions({
  reservation,
  onEdit,
  onComplete,
  onDelete,
}: {
  reservation: Reservation;
  onEdit: (r: Reservation) => void;
  onComplete: (r: Reservation) => void;
  onDelete: (r: Reservation) => void;
}) {
  const isToday = (() => {
    const now = new Date();
    const d = new Date(reservation.reservationStartDate);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
  })();

  return (
    <>
      <Button variant="ghost" size="icon" onClick={() => onEdit(reservation)} title="Editar">
        <Edit3 className="h-3.5 w-3.5" />
      </Button>
      {isToday && (
        <Button variant="ghost" size="icon" onClick={() => onComplete(reservation)} title="Completar">
          <CheckCircle className="h-3.5 w-3.5" />
        </Button>
      )}
      <Button variant="ghost" size="icon" onClick={() => onDelete(reservation)} title="Eliminar">
        <Trash2 className="h-3.5 w-3.5 text-danger" />
      </Button>
    </>
  );
}

/* ══════════════════════════════════════════════════
   TodayTimeline — ALL today reservations on axis
   ══════════════════════════════════════════════════ */

export function TodayTimeline({
  reservations,
  loading,
  view = "timeline",
  onViewChange,
  highlightPending = false,
}: {
  reservations: Reservation[];
  loading: boolean;
  view?: "timeline" | "completed";
  onViewChange?: (view: "timeline" | "completed") => void;
  highlightPending?: boolean;
}) {
  const { deleteReservation, updateReservation, loading: actionLoading } =
    useReservation();
  const { productData } = useProduct();
  const now = useNow();

  const [editTarget, setEditTarget] = useState<Reservation | null>(null);
  const [completeTarget, setCompleteTarget] = useState<Reservation | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Reservation | null>(null);

  const today = new Date();
  const todayReservations = useMemo(
    () =>
      reservations
        .filter((r) => isSameDay(new Date(r.reservationStartDate), today))
        .sort(
          (a, b) =>
            new Date(a.reservationStartDate).getTime() -
            new Date(b.reservationStartDate).getTime()
        ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [reservations]
  );

  // Group reservations by time slot (HH:MM) — must be before early returns
  const groupedByTime = useMemo(() => {
    const groups: { time: string; minutes: number; items: Reservation[] }[] = [];
    const map = new Map<string, Reservation[]>();
    for (const r of todayReservations) {
      const d = new Date(r.reservationStartDate);
      const key = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    }
    for (const [time, items] of map) {
      const [h, m] = time.split(":").map(Number);
      groups.push({ time, minutes: h * 60 + m, items });
    }
    groups.sort((a, b) => a.minutes - b.minutes);
    return groups;
  }, [todayReservations]);

  const pendingCount = todayReservations.filter((r) => r.status === "PENDING").length;
  const completedCount = todayReservations.filter((r) => r.status === "COMPLETED").length;

  // Filter for completed-only view
  const completedToday = useMemo(
    () => todayReservations.filter((r) => r.status === "COMPLETED"),
    [todayReservations]
  );

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-md" />
        ))}
      </div>
    );
  }

  if (todayReservations.length === 0) {
    return (
      <EmptyState
        icon={<Calendar />}
        title="Día libre"
        description="No hay reservas programadas para hoy."
      />
    );
  }

  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  return (
    <>
      {/* Summary — badges act as view toggles */}
      <div className="flex items-center gap-2 mb-4 text-[11px] text-foreground-muted">
        <span className="tabular-nums">{todayReservations.length} reserva{todayReservations.length !== 1 ? "s" : ""}</span>
        <span className="text-foreground-subtle/40">·</span>
        <button
          type="button"
          onClick={() => onViewChange?.("timeline")}
          className="focus:outline-none"
        >
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium transition-all cursor-pointer",
              view === "timeline"
                ? "bg-accent/20 text-accent ring-1 ring-accent/30"
                : "bg-accent/8 text-accent/60 hover:text-accent hover:bg-accent/15"
            )}
          >
            <Clock className="h-2.5 w-2.5" />
            {pendingCount}
          </span>
        </button>
        <button
          type="button"
          onClick={() => onViewChange?.("completed")}
          className="focus:outline-none"
        >
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium transition-all cursor-pointer",
              view === "completed"
                ? "bg-success/20 text-success ring-1 ring-success/30"
                : "bg-success/8 text-success/60 hover:text-success hover:bg-success/15"
            )}
          >
            <CheckCircle className="h-2.5 w-2.5" />
            {completedCount}
          </span>
        </button>
      </div>

      {/* Completed-only view */}
      {view === "completed" ? (
        completedToday.length === 0 ? (
          <EmptyState
            icon={<CheckCircle />}
            title="Sin completadas hoy"
            description="Las reservas completadas de hoy aparecerán aquí."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {completedToday.map((reservation) => {
              const price =
                productData.find((p) => p.name === reservation.service)?.price ?? 0;
              return (
                <ReservationCard
                  key={reservation.id}
                  reservation={reservation}
                  price={price}
                  compact
                />
              );
            })}
          </div>
        )
      ) : (
      /* Flow-based timeline */
      <div className="relative pl-14 sm:pl-16 space-y-4">
        {/* Vertical axis line */}
        <div className="absolute left-[2.85rem] sm:left-[3.35rem] top-0 bottom-0 w-px bg-border-subtle/50" />

        {groupedByTime.map(({ time, minutes, items }, gi) => {
          const isPast = minutes + 30 <= nowMinutes;
          const isCurrent = nowMinutes >= minutes && nowMinutes < minutes + 30;

          return (
            <div key={time} className="relative">
              {/* Time label + dot on the axis */}
              <div className="absolute -left-14 sm:-left-16 top-0 flex items-center w-14 sm:w-16">
                <span
                  className={cn(
                    "flex-1 text-right pr-2 text-[11px] tabular-nums font-medium",
                    isCurrent ? "text-danger" : isPast ? "text-foreground-subtle" : "text-foreground-muted"
                  )}
                >
                  {time}
                </span>
                <span
                  className={cn(
                    "h-2.5 w-2.5 rounded-full flex-shrink-0 ring-2 ring-surface-base",
                    isCurrent ? "bg-danger" : isPast ? "bg-foreground-subtle" : "bg-accent"
                  )}
                />
              </div>

              {/* Cards for this time slot */}
              <div className="space-y-2">
                {items.map((reservation) => {
                  const isPending = reservation.status === "PENDING";
                  const price = !isPending
                    ? productData.find((p) => p.name === reservation.service)?.price ?? 0
                    : undefined;

                  return (
                    <ReservationCard
                      key={reservation.id}
                      reservation={reservation}
                      price={price}
                      compact
                      highlight={highlightPending && isPending}
                      actions={
                        isPending ? (
                          <PendingActions
                            reservation={reservation}
                            onEdit={setEditTarget}
                            onComplete={setCompleteTarget}
                            onDelete={setDeleteTarget}
                          />
                        ) : undefined
                      }
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Modals */}
      <Modals
        editTarget={editTarget}
        completeTarget={completeTarget}
        deleteTarget={deleteTarget}
        onCloseEdit={() => setEditTarget(null)}
        onCloseComplete={() => setCompleteTarget(null)}
        onCloseDelete={() => setDeleteTarget(null)}
        updateReservation={updateReservation}
        deleteReservation={deleteReservation}
        actionLoading={actionLoading}
      />
    </>
  );
}

/* ══════════════════════════════════════════════════
   GroupedPendingList — non-today pending, grouped
   ══════════════════════════════════════════════════ */

export function GroupedPendingList({
  reservations,
  loading,
}: {
  reservations: Reservation[];
  loading: boolean;
}) {
  const { deleteReservation, updateReservation, loading: actionLoading } =
    useReservation();

  const [editTarget, setEditTarget] = useState<Reservation | null>(null);
  const [completeTarget, setCompleteTarget] = useState<Reservation | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Reservation | null>(null);

  const pending = useMemo(
    () => reservations.filter((r) => r.status === "PENDING"),
    [reservations]
  );

  const groups = useMemo(() => groupPendingByDate(pending), [pending]);

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-md" />
        ))}
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <EmptyState
        icon={<CalendarClock />}
        title="Sin pendientes"
        description="No hay reservas pendientes de otros días."
      />
    );
  }

  return (
    <>
      <div className="space-y-5">
        {groups.map((group) => (
          <div key={group.label}>
            {/* Group header */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-caption font-semibold text-foreground-muted uppercase tracking-wider">
                {group.label}
              </span>
              <span className="text-caption text-foreground-subtle tabular-nums">
                ({group.reservations.length})
              </span>
              <div className="flex-1 border-t border-border-subtle/40" />
            </div>
            {/* Cards */}
            <div className="space-y-2">
              {group.reservations.map((reservation) => (
                <ReservationCard
                  key={reservation.id}
                  reservation={reservation}
                  showDate
                  actions={
                    <PendingActions
                      reservation={reservation}
                      onEdit={setEditTarget}
                      onComplete={setCompleteTarget}
                      onDelete={setDeleteTarget}
                    />
                  }
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <Modals
        editTarget={editTarget}
        completeTarget={completeTarget}
        deleteTarget={deleteTarget}
        onCloseEdit={() => setEditTarget(null)}
        onCloseComplete={() => setCompleteTarget(null)}
        onCloseDelete={() => setDeleteTarget(null)}
        updateReservation={updateReservation}
        deleteReservation={deleteReservation}
        actionLoading={actionLoading}
      />
    </>
  );
}

/* ══════════════════════════════════════════════════
   CompletedList — grid of completed reservations
   ══════════════════════════════════════════════════ */

export function CompletedList({
  reservations,
  loading,
}: {
  reservations: Reservation[];
  loading: boolean;
}) {
  const { productData } = useProduct();

  const completed = useMemo(
    () =>
      reservations
        .filter((r) => r.status === "COMPLETED")
        .sort(
          (a, b) =>
            new Date(b.reservationStartDate).getTime() -
            new Date(a.reservationStartDate).getTime()
        ),
    [reservations]
  );

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-md" />
        ))}
      </div>
    );
  }

  if (completed.length === 0) {
    return (
      <EmptyState
        icon={<CheckCircle />}
        title="Sin completadas"
        description="Las reservas completadas aparecerán aquí."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {completed.map((reservation) => {
        const price =
          productData.find((p) => p.name === reservation.service)?.price ?? 0;
        return (
          <ReservationCard
            key={reservation.id}
            reservation={reservation}
            price={price}
            showDate
          />
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════════════
   Shared Modals component
   ══════════════════════════════════════════════════ */

function Modals({
  editTarget,
  completeTarget,
  deleteTarget,
  onCloseEdit,
  onCloseComplete,
  onCloseDelete,
  updateReservation,
  deleteReservation,
  actionLoading,
}: {
  editTarget: Reservation | null;
  completeTarget: Reservation | null;
  deleteTarget: Reservation | null;
  onCloseEdit: () => void;
  onCloseComplete: () => void;
  onCloseDelete: () => void;
  updateReservation: (data: Reservation) => Promise<Reservation | null>;
  deleteReservation: (id: number) => Promise<void>;
  actionLoading: boolean;
}) {
  const { context } = useAccessContext();
  const { activeEmployees } = useEmployee();
  const isOwner = context?.role === "owner";
  const currentUserName = context?.profile?.displayName ?? context?.profile?.email ?? "";
  return (
    <>
      {editTarget && (
        <ReservationModal
          isOpen={!!editTarget}
          handleOpenModal={onCloseEdit}
          executeAction={updateReservation}
          operation="Editar reserva"
          reservationData={editTarget}
          loading={actionLoading}
          isOwner={isOwner}
          currentUserName={currentUserName}
          employees={activeEmployees}
        />
      )}
      {completeTarget && (
        <CompleteReservationModal
          data={completeTarget}
          openCompleteReservationModal={!!completeTarget}
          handleOpenCompleteReservationModal={onCloseComplete}
          updateReservation={updateReservation}
        />
      )}
      {deleteTarget && (
        <DeleteModal
          id={deleteTarget.id!}
          customerName={deleteTarget.customerName}
          openDeleteModal={!!deleteTarget}
          handleOpenDeleteModal={onCloseDelete}
          deleteReservation={deleteReservation}
        />
      )}
    </>
  );
}

/* ══════════════════════════════════════════════════
   Legacy export for backwards compat (unused now)
   ══════════════════════════════════════════════════ */

export function ReservationTimeline({
  reservations,
  loading,
}: {
  reservations: Reservation[];
  loading: boolean;
}) {
  return (
    <div className="space-y-8">
      <TodayTimeline reservations={reservations} loading={loading} />
      <GroupedPendingList reservations={reservations} loading={loading} />
      <CompletedList reservations={reservations} loading={loading} />
    </div>
  );
}
