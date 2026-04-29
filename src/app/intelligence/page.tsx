"use client";

import { useAccessContext } from "@/hooks/useAccessContext";
import {
  useWeeklySummaryData,
  SummaryPulse,
  SummaryNarrative,
  SummaryOpportunities,
  SummaryEmpty,
  SummaryLoading,
} from "@/components/intelligence/WeeklySummary";
import { TeamAnalysis } from "@/components/intelligence/TeamAnalysis";
import { ClientAnalysis } from "@/components/intelligence/ClientAnalysis";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionSkeleton } from "@/components/ui/skeleton";
import { ShieldAlert, Brain } from "lucide-react";

export default function IntelligencePage() {
  const { capabilities, loading: authLoading } = useAccessContext();
  const {
    summary,
    kpis,
    loading: summaryLoading,
    generating,
    genError,
    handleGenerate,
  } = useWeeklySummaryData();

  if (authLoading) {
    return (
      <div className="min-h-screen w-full pt-14 md:pt-0">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <SectionSkeleton />
          <SectionSkeleton />
        </div>
      </div>
    );
  }

  if (!capabilities.canManageTeam) {
    return (
      <div className="min-h-screen w-full pt-14 md:pt-0">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <EmptyState
            icon={<ShieldAlert />}
            title="Acceso restringido"
            description="Solo el propietario del negocio puede acceder a la inteligencia de negocio."
          />
        </div>
      </div>
    );
  }

  if (summaryLoading) {
    return (
      <div className="min-h-screen w-full pt-14 md:pt-0">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <PageHeader />
          <SummaryLoading />
        </div>
      </div>
    );
  }

  if (!summary || !kpis) {
    return (
      <div className="min-h-screen w-full pt-14 md:pt-0">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <PageHeader />
          <SummaryEmpty
            generating={generating}
            genError={genError}
            onGenerate={handleGenerate}
          />
          <div className="border-t border-border-subtle/40" />
          <ClientAnalysis />
        </div>
      </div>
    );
  }

  const hasTeam = (kpis.employee_stats?.length ?? 0) > 0;
  const hasOpportunities = (kpis.opportunities?.length ?? 0) > 0;

  return (
    <div className="min-h-screen w-full pt-14 md:pt-0">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Page header */}
        <PageHeader />

        {/* Row 1: KPIs — full width */}
        <SummaryPulse
          summary={summary}
          kpis={kpis}
          onRegenerate={handleGenerate}
          generating={generating}
          genError={genError}
        />

        {/* Row 2: Narrative (left) + Team (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up" style={{ animationDelay: "250ms" }}>
          <SummaryNarrative summary={summary} />
          {hasTeam && <TeamAnalysis kpis={kpis} />}
        </div>

        {/* Row 3: Opportunities (left) + Clients (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up" style={{ animationDelay: "350ms" }}>
          {hasOpportunities && <SummaryOpportunities kpis={kpis} />}
          <ClientAnalysis />
        </div>
      </div>
    </div>
  );
}

/* ── Page header with subtle gradient accent ─────────────────────── */
function PageHeader() {
  return (
    <div className="flex items-start gap-4">
      <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-secondary/15 to-primary/15 border border-secondary/10 flex items-center justify-center shrink-0">
        <Brain className="h-5 w-5 text-secondary" />
      </div>
      <div>
        <h1 className="font-heading text-h3 font-bold text-foreground tracking-tight">
          Inteligencia de negocio
        </h1>
        <p className="text-[14px] text-foreground-muted/70 mt-0.5 tracking-wide">
          Tu negocio, analizado por IA cada semana
        </p>
      </div>
    </div>
  );
}
