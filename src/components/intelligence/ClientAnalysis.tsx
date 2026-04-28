"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { useReservation } from "@/hooks/useReservation";
import { useFinances } from "@/hooks/useFinances";
import { useProduct } from "@/hooks/useProduct";
import { computeClientProfiles } from "@/lib/intelligence/client-scoring";
import type { ClientProfile } from "@/lib/intelligence/types";
import {
  Users,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  Clock,
  AlertTriangle,
  Heart,
  UserPlus,
} from "lucide-react";

/* ── Client row ──────────────────────────────────────────────────── */
function ClientRow({ client }: { client: ClientProfile }) {
  const trendIcon =
    client.trend === "up" ? (
      <TrendingUp className="h-3 w-3 text-success/60" />
    ) : client.trend === "down" ? (
      <TrendingDown className="h-3 w-3 text-danger/60" />
    ) : (
      <Minus className="h-3 w-3 text-foreground-muted/70" />
    );

  return (
    <div className="flex items-center gap-3 px-4 py-3 transition-colors duration-150 hover:bg-surface-raised/20">
      {/* Status dot */}
      <span
        className={`h-2 w-2 rounded-full shrink-0 ${
          client.loyaltyStatus === "fiel"
            ? "bg-success/80"
            : client.loyaltyStatus === "en_riesgo"
            ? "bg-danger/80"
            : "bg-foreground-muted/70"
        }`}
      />

      {/* Name + services */}
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-medium text-foreground/90 truncate">
          {client.customerName}
        </p>
        <p className="text-[14px] text-foreground-muted/60 truncate mt-0.5">
          {client.services.slice(0, 2).join(", ")}
          {client.services.length > 2 && ` +${client.services.length - 2}`}
        </p>
      </div>

      {/* Stats — desktop */}
      <div className="hidden sm:flex items-center gap-4 text-[14px] text-foreground-muted/70 shrink-0">
        <span className="font-medium">{client.visitCount} visitas</span>
        <span>{client.totalSpend.toLocaleString("es-ES", { minimumFractionDigits: 2 })}€</span>
        <span className="flex items-center gap-1">
          <Clock className="h-2.5 w-2.5" />
          hace {client.daysSinceLastVisit}d
        </span>
      </div>

      {/* Mobile stats */}
      <div className="sm:hidden text-right shrink-0">
        <p className="text-[14px] font-medium text-foreground/90">
          {client.visitCount} vis.
        </p>
        <p className="text-[14px] text-foreground-muted/60">
          hace {client.daysSinceLastVisit}d
        </p>
      </div>

      {/* Trend */}
      <span className="shrink-0">{trendIcon}</span>
    </div>
  );
}

/* ── Collapsible category ────────────────────────────────────────── */
function ClientCategory({
  title,
  icon,
  count,
  clients,
  defaultOpen,
  accentColor,
  badgeClasses,
}: {
  title: string;
  icon: React.ReactNode;
  count: number;
  clients: ClientProfile[];
  defaultOpen: boolean;
  accentColor: string;
  badgeClasses: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const shown = clients.slice(0, 5);

  if (count === 0) return null;

  return (
    <div className="rounded-xl border border-border-subtle overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 transition-colors duration-150 hover:bg-surface-raised/20"
      >
        <span className={accentColor}>{icon}</span>
        <span className="text-[14px] font-medium text-foreground/90">{title}</span>
        <span className={`inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full text-[14px] font-bold ${badgeClasses}`}>
          {count}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-foreground-muted/70 ml-auto transition-transform duration-250 ease-out ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Expandable list */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-out ${
          open ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="border-t border-border-subtle/40 divide-y divide-border-subtle/20">
          {shown.map((c) => (
            <ClientRow key={c.customerName} client={c} />
          ))}
          {clients.length > 5 && (
            <p className="text-center text-[14px] text-foreground-muted/70 py-2.5 font-medium">
              +{clients.length - 5} más
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────── */
export function ClientAnalysis() {
  const { reservationData } = useReservation();
  const { financesData } = useFinances();
  const { productData } = useProduct();

  const profiles = useMemo(
    () => computeClientProfiles(reservationData, financesData, productData),
    [reservationData, financesData, productData]
  );

  if (profiles.length === 0) {
    return (
      <Card>
        <CardContent>
          <EmptyState
            icon={<Users />}
            title="Sin datos de clientes"
            description="Completa reservas para ver el análisis de fidelización."
          />
        </CardContent>
      </Card>
    );
  }

  const loyal = profiles.filter((p) => p.loyaltyStatus === "fiel");
  const atRisk = profiles.filter((p) => p.loyaltyStatus === "en_riesgo");
  const fresh = profiles.filter((p) => p.loyaltyStatus === "nuevo");

  return (
    <section className="h-full flex flex-col">
      <h2 className="text-[16px] font-semibold text-foreground mb-3 flex items-center gap-2.5 tracking-tight">
        <div className="h-6 w-6 rounded-lg bg-secondary/10 border border-secondary/10 flex items-center justify-center">
          <Users className="h-3 w-3 text-secondary" />
        </div>
        Tus clientes
      </h2>

      {/* Summary counters */}
      <div className="flex gap-5 mb-4">
        <span className="flex items-center gap-2 text-[14px]">
          <span className="h-2 w-2 rounded-full bg-success/80" />
          <span className="text-foreground-muted/70 font-medium">{loyal.length} fieles</span>
        </span>
        <span className="flex items-center gap-2 text-[14px]">
          <span className="h-2 w-2 rounded-full bg-danger/80" />
          <span className="text-foreground-muted/70 font-medium">{atRisk.length} en riesgo</span>
        </span>
        <span className="flex items-center gap-2 text-[14px]">
          <span className="h-2 w-2 rounded-full bg-foreground-muted/70" />
          <span className="text-foreground-muted/70 font-medium">{fresh.length} nuevos</span>
        </span>
      </div>

      {/* Collapsible categories */}
      <div className="space-y-2.5 flex-1">
        <ClientCategory
          title="En riesgo de perder"
          icon={<AlertTriangle className="h-3.5 w-3.5" />}
          count={atRisk.length}
          clients={atRisk}
          defaultOpen={true}
          accentColor="text-danger/60"
          badgeClasses="text-danger/80 bg-danger/10"
        />
        <ClientCategory
          title="Clientes fieles"
          icon={<Heart className="h-3.5 w-3.5" />}
          count={loyal.length}
          clients={loyal}
          defaultOpen={false}
          accentColor="text-success/60"
          badgeClasses="text-success/80 bg-success/10"
        />
        <ClientCategory
          title="Nuevos"
          icon={<UserPlus className="h-3.5 w-3.5" />}
          count={fresh.length}
          clients={fresh}
          defaultOpen={false}
          accentColor="text-foreground-muted/60"
          badgeClasses="text-foreground-muted/60 bg-foreground-muted/8"
        />
      </div>
    </section>
  );
}
