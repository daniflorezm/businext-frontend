"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useWeeklySummary } from "@/hooks/useWeeklySummary";
import type { WeeklySummaryKPIs, WeeklySummaryData, Opportunity } from "@/lib/intelligence/types";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Minus,
  CalendarDays,
  ShoppingBag,
  Euro,
  Lightbulb,
  Sparkles,
  RefreshCw,
  Zap,
  ArrowRight,
  CircleDot,
} from "lucide-react";

/* ── Sparkline SVG ─────────────────────────────────────────────────── */
function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (!data || data.length === 0 || data.every((v) => v === 0)) return null;

  const width = 80;
  const height = 28;
  const padding = 2;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((v, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((v - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(" L ")}`;

  // Gradient fill area
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  const areaD = `${pathD} L ${lastPoint.split(",")[0]},${height} L ${firstPoint.split(",")[0]},${height} Z`;

  return (
    <svg width={width} height={height} className="shrink-0 opacity-60 group-hover:opacity-90 transition-opacity duration-300">
      <defs>
        <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#grad-${color})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Current day dot */}
      {data.length > 0 && (
        <circle
          cx={padding + ((data.length - 1) / (data.length - 1)) * (width - padding * 2)}
          cy={height - padding - ((data[data.length - 1] - min) / range) * (height - padding * 2)}
          r="2.5"
          fill={color}
        />
      )}
    </svg>
  );
}

/* ── KPI Card ──────────────────────────────────────────────────────── */
function KPICard({
  label,
  value,
  change,
  icon,
  accentHex,
  sparklineData,
}: {
  label: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  accentHex: string;
  sparklineData?: number[];
}) {
  const isPositive = change > 0;
  const isNeutral = change === 0;

  return (
    <div className="relative overflow-hidden rounded-xl bg-surface border border-border-subtle p-5 transition-all duration-300 hover:border-border hover:shadow-md group animate-fade-in-up">
      {/* Subtle corner glow */}
      <div
        className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-[0.06] group-hover:opacity-[0.1] transition-opacity duration-300 pointer-events-none"
        style={{ backgroundColor: accentHex }}
      />

      <div className="relative">
        {/* Icon + label + sparkline row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-foreground-muted/70 group-hover:text-foreground-muted transition-colors duration-300">
              {icon}
            </span>
            <span className="text-[11px] uppercase tracking-[0.08em] font-medium text-foreground-muted/70">
              {label}
            </span>
          </div>
          {sparklineData && <Sparkline data={sparklineData} color={accentHex} />}
        </div>

        {/* Value + change */}
        <div className="flex items-end justify-between">
          <span className="text-[28px] font-bold text-foreground tracking-tight leading-none">
            {value}
          </span>
          <span
            className={`inline-flex items-center gap-1 text-[14px] font-semibold px-2 py-0.5 rounded-full ${
              isNeutral
                ? "text-foreground-muted/60 bg-[#64748b]/5"
                : isPositive
                ? "text-success bg-success/8"
                : "text-danger bg-danger/8"
            }`}
          >
            {isNeutral ? (
              <Minus className="h-3 w-3" />
            ) : isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {change > 0 ? "+" : ""}{change}%
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Pulse header with KPIs ────────────────────────────────────────── */
export function SummaryPulse({
  summary,
  kpis,
  onRegenerate,
  generating,
  genError,
}: {
  summary: WeeklySummaryData;
  kpis: WeeklySummaryKPIs;
  onRegenerate: () => void;
  generating: boolean;
  genError: string | null;
}) {
  return (
    <section className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
      {/* Section header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-secondary/10 border border-secondary/10 flex items-center justify-center">
            <Sparkles className="h-3.5 w-3.5 text-secondary" />
          </div>
          <div>
            <h2 className="text-[16px] font-semibold text-foreground leading-none tracking-tight">
              Pulso semanal
            </h2>
            <p className="text-[14px] text-foreground-muted/60 mt-1 tracking-wide">
              {summary.week_start} — {summary.week_end}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRegenerate}
          loading={generating}
          className="text-[14px] text-foreground-muted/70 hover:text-foreground gap-1.5"
        >
          <RefreshCw className="h-3 w-3" />
          Regenerar
        </Button>
      </div>

      {genError && (
        <p className="text-[14px] text-danger mb-4">{genError}</p>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard
          label="Ingresos"
          value={`${kpis.total_income.toLocaleString("es-ES", { minimumFractionDigits: 2 })}€`}
          change={kpis.income_change_pct}
          icon={<Euro className="h-4.5 w-4.5" />}
          accentHex="#34d399"
          sparklineData={kpis.daily_income}
        />
        <KPICard
          label="Reservas"
          value={String(kpis.total_reservations)}
          change={kpis.reservations_change_pct}
          icon={<CalendarDays className="h-4.5 w-4.5" />}
          accentHex="#3b82f6"
          sparklineData={kpis.daily_reservations}
        />
        <KPICard
          label="Productos"
          value={String(kpis.total_product_sales)}
          change={kpis.product_sales_change_pct}
          icon={<ShoppingBag className="h-4.5 w-4.5" />}
          accentHex="#a78bfa"
          sparklineData={kpis.daily_products}
        />
      </div>

      {/* Detail chips */}
      <div className="flex flex-wrap gap-2 mt-4">
        {kpis.best_day !== "N/A" && (
          <span className="inline-flex items-center rounded-full bg-success/8 border border-success/10 px-3 py-1 text-[14px] font-medium text-success/80 tracking-wide">
            Mejor día: {kpis.best_day}
          </span>
        )}
        {kpis.worst_day !== "N/A" && (
          <span className="inline-flex items-center rounded-full bg-danger/8 border border-danger/10 px-3 py-1 text-[14px] font-medium text-danger/80 tracking-wide">
            Peor día: {kpis.worst_day}
          </span>
        )}
        {kpis.top_service !== "N/A" && (
          <span className="inline-flex items-center rounded-full bg-primary/8 border border-primary/10 px-3 py-1 text-[14px] font-medium text-primary/80 tracking-wide">
            Top: {kpis.top_service}
          </span>
        )}
      </div>
    </section>
  );
}

/* ── Narrative section ─────────────────────────────────────────────── */
export function SummaryNarrative({ summary }: { summary: WeeklySummaryData }) {
  return (
    <section className="h-full flex flex-col animate-fade-in-up" style={{ animationDelay: "200ms" }}>
      <h2 className="text-[16px] font-semibold text-foreground mb-3 tracking-tight">
        Qué pasó esta semana
      </h2>
      <div className="relative flex-1 rounded-xl border border-border-subtle bg-surface overflow-hidden">
        {/* Subtle top gradient line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-secondary/30 to-transparent" />
        <div className="p-6">
          <p className="text-[14px] text-foreground/90 leading-[1.8] whitespace-pre-line">
            {summary.narrative}
          </p>
          {summary.client_narrative && (
            <>
              <div className="my-5 border-t border-border-subtle/40" />
              <p className="text-[11px] uppercase tracking-[0.1em] text-foreground-muted/60 mb-2.5 font-medium">
                Sobre tus clientes
              </p>
              <p className="text-[14px] text-foreground/90 leading-[1.8] whitespace-pre-line">
                {summary.client_narrative}
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

/* ── Helper to normalize opportunity format ────────────────────────── */
function normalizeOpportunity(opp: Opportunity | string): Opportunity {
  if (typeof opp === "string") return { text: opp, impact: "medio" };
  return opp;
}

const IMPACT_STYLES: Record<string, { badge: string; icon: React.ReactNode; accent: string }> = {
  alto: {
    badge: "text-warning/90 bg-warning/10 border border-warning/15",
    icon: <Zap className="h-3 w-3" />,
    accent: "from-warning/30 to-warning/5",
  },
  medio: {
    badge: "text-primary/80 bg-primary/8 border border-primary/10",
    icon: <ArrowRight className="h-3 w-3" />,
    accent: "from-primary/20 to-primary/5",
  },
  bajo: {
    badge: "text-foreground-muted/60 bg-foreground-muted/8 border border-foreground-muted/10",
    icon: <CircleDot className="h-3 w-3" />,
    accent: "from-foreground-muted/15 to-foreground-muted/5",
  },
};

/* ── Opportunities section ─────────────────────────────────────────── */
export function SummaryOpportunities({ kpis }: { kpis: WeeklySummaryKPIs }) {
  const rawOpps = kpis.opportunities ?? [];
  if (rawOpps.length === 0) return null;
  const opps = rawOpps.map(normalizeOpportunity);

  return (
    <section className="h-full flex flex-col animate-fade-in-up" style={{ animationDelay: "300ms" }}>
      <h2 className="text-[16px] font-semibold text-foreground mb-3 flex items-center gap-2.5 tracking-tight">
        <div className="h-6 w-6 rounded-lg bg-warning/10 border border-warning/10 flex items-center justify-center">
          <Lightbulb className="h-3 w-3 text-warning" />
        </div>
        Oportunidades
      </h2>
      <div className="space-y-2.5 flex-1">
        {opps.map((opp, i) => {
          const style = IMPACT_STYLES[opp.impact] || IMPACT_STYLES.medio;
          return (
            <div
              key={i}
              className="relative overflow-hidden rounded-xl border border-border-subtle bg-surface px-5 py-4 transition-all duration-200 hover:border-border group"
            >
              {/* Left accent bar */}
              <div className={`absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b ${style.accent}`} />
              <div className="flex gap-3.5 items-start">
                <span className="text-[14px] font-bold text-foreground-muted/70 mt-0.5 shrink-0 tabular-nums">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] text-foreground/90 leading-[1.7]">
                    {opp.text}
                  </p>
                </div>
                <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-[0.1em] ${style.badge}`}>
                  {style.icon}
                  {opp.impact}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ── Provider hook ─────────────────────────────────────────────────── */
export function useWeeklySummaryData() {
  const { summary, loading, error, generateSummary } = useWeeklySummary();
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setGenerating(true);
    setGenError(null);
    try {
      await generateSummary();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error al generar el resumen";
      setGenError(msg);
    }
    setGenerating(false);
  };

  let kpis: WeeklySummaryKPIs | null = null;
  if (summary) {
    try {
      kpis = JSON.parse(summary.kpis);
    } catch {
      // malformed
    }
  }

  return { summary, kpis, loading, error, generating, genError, handleGenerate };
}

/* ── Empty / loading states ────────────────────────────────────────── */
export function SummaryEmpty({
  generating,
  genError,
  onGenerate,
}: {
  generating: boolean;
  genError: string | null;
  onGenerate: () => void;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl bg-surface border border-border-subtle animate-fade-in-up">
      {/* Decorative gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-secondary/[0.03] via-transparent to-primary/[0.03] pointer-events-none" />
      <div className="relative px-8 py-14 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary/15 to-primary/15 border border-secondary/10 flex items-center justify-center mx-auto mb-5">
          <Brain className="w-7 h-7 text-secondary" />
        </div>
        <h3 className="text-[16px] font-semibold text-foreground mb-2 tracking-tight">
          Sin resumen semanal
        </h3>
        <p className="text-[14px] text-foreground-muted/60 mb-6 max-w-sm mx-auto leading-relaxed">
          Genera un análisis con IA de la semana anterior para entender cómo va tu negocio.
        </p>
        <Button
          variant="primary"
          onClick={onGenerate}
          loading={generating}
          className="px-8 py-2.5"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Generar resumen
        </Button>
        {genError && (
          <p className="text-[14px] text-danger mt-3">{genError}</p>
        )}
      </div>
    </div>
  );
}

export function SummaryLoading() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Skeleton className="h-[100px] rounded-xl" />
        <Skeleton className="h-[100px] rounded-xl" />
        <Skeleton className="h-[100px] rounded-xl" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    </div>
  );
}
