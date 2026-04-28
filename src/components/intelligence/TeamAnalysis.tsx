"use client";

import type { WeeklySummaryKPIs, EmployeeStats } from "@/lib/intelligence/types";
import { Star, Users2, Euro, CalendarDays, ShoppingBag, Receipt } from "lucide-react";

/* ── Stat chip ────────────────────────────────────────────────────── */
function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-1.5 text-[14px] text-foreground-muted/60">
      {icon}
      <span>
        <span className="font-semibold text-foreground/90">{value}</span>
        {label && <span className="ml-0.5">{label}</span>}
      </span>
    </div>
  );
}

/* ── Employee row ────────────────────────────────────────────────── */
function EmployeeRow({
  employee,
  isStar,
  totalIncome,
}: {
  employee: EmployeeStats;
  isStar: boolean;
  totalIncome: number;
}) {
  const pct = totalIncome > 0 ? Math.round((employee.income / totalIncome) * 100) : 0;

  return (
    <div className={`flex items-center gap-3.5 px-4 py-3.5 transition-colors duration-150 hover:bg-surface-raised/20 ${isStar ? "bg-warning/[0.02]" : ""}`}>
      {/* Star indicator or initial */}
      {isStar ? (
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/10 border border-warning/15">
          <Star className="h-3.5 w-3.5 text-warning fill-warning" />
        </span>
      ) : (
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-raised/50 border border-border-subtle/50">
          <span className="text-[14px] font-semibold text-foreground-muted/70">
            {employee.name.charAt(0).toUpperCase()}
          </span>
        </span>
      )}

      {/* Name + share bar */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2.5">
          <p className={`text-[14px] font-medium truncate ${isStar ? "text-foreground" : "text-foreground/90"}`}>
            {employee.name}
          </p>
          {isStar && (
            <span className="text-[11px] font-bold text-warning/70 uppercase tracking-[0.12em] bg-warning/8 px-2 py-0.5 rounded-full">
              Estrella
            </span>
          )}
        </div>
        {/* Income share bar */}
        <div className="flex items-center gap-2.5 mt-2">
          <div className="flex-1 h-[3px] rounded-full bg-surface-raised/80 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${isStar ? "bg-warning/50" : "bg-primary/30"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-[14px] text-foreground-muted/60 shrink-0 tabular-nums font-medium">{pct}%</span>
        </div>
      </div>

      {/* Stats — desktop */}
      <div className="hidden sm:flex items-center gap-4 shrink-0">
        <Stat
          icon={<Euro className="h-2.5 w-2.5" />}
          label=""
          value={`${employee.income.toLocaleString("es-ES", { minimumFractionDigits: 2 })}€`}
        />
        <Stat
          icon={<CalendarDays className="h-2.5 w-2.5" />}
          label="res."
          value={String(employee.reservations)}
        />
        <Stat
          icon={<ShoppingBag className="h-2.5 w-2.5" />}
          label="prod."
          value={String(employee.product_sales)}
        />
        <Stat
          icon={<Receipt className="h-2.5 w-2.5" />}
          label="ticket"
          value={`${employee.avg_ticket.toLocaleString("es-ES", { minimumFractionDigits: 2 })}€`}
        />
      </div>

      {/* Stats — mobile */}
      <div className="sm:hidden text-right shrink-0">
        <p className="text-[14px] font-semibold text-foreground/90">
          {employee.income.toLocaleString("es-ES", { minimumFractionDigits: 2 })}€
        </p>
        <p className="text-[14px] text-foreground-muted/70">
          {employee.reservations} res. · {employee.product_sales} prod.
        </p>
      </div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────── */
export function TeamAnalysis({ kpis }: { kpis: WeeklySummaryKPIs }) {
  const employees = kpis.employee_stats ?? [];
  const teamNarrative = kpis.team_narrative ?? "";

  if (employees.length === 0) return null;

  const totalIncome = employees.reduce((s, e) => s + e.income, 0);

  return (
    <section className="h-full flex flex-col">
      <h2 className="text-[16px] font-semibold text-foreground mb-3 flex items-center gap-2.5 tracking-tight">
        <div className="h-6 w-6 rounded-lg bg-primary/10 border border-primary/10 flex items-center justify-center">
          <Users2 className="h-3 w-3 text-primary" />
        </div>
        Tu equipo
      </h2>

      {/* AI narrative */}
      {teamNarrative && (
        <div className="relative overflow-hidden rounded-xl border border-border-subtle bg-surface px-5 py-4 mb-3">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          <p className="text-[14px] text-foreground/90 leading-[1.8] whitespace-pre-line">
            {teamNarrative}
          </p>
        </div>
      )}

      {/* Employee rows */}
      <div className="flex-1 rounded-xl border border-border-subtle overflow-hidden divide-y divide-border-subtle/30">
        {employees.map((emp, i) => (
          <EmployeeRow
            key={emp.name}
            employee={emp}
            isStar={i === 0}
            totalIncome={totalIncome}
          />
        ))}
      </div>
    </section>
  );
}
