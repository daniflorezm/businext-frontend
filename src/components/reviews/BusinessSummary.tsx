"use client";

import { useState } from "react";
import {
  Sparkles,
  RefreshCw,
  Loader2,
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  ThumbsDown,
  Lightbulb,
  TrendingUp,
  MessageSquareText,
  Users,
  Target,
  BrainCircuit,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type {
  BusinessSummary as BusinessSummaryType,
  GoogleBusinessProfile,
} from "@/lib/google-reviews/types";

type BusinessSummaryProps = {
  profile: GoogleBusinessProfile;
  onGenerateSummary: () => Promise<BusinessSummaryType | null>;
  generating: boolean;
};

const SENTIMENT_COLORS: Record<string, string> = {
  positivo: "text-success bg-success/10",
  neutro: "text-warning bg-warning/10",
  negativo: "text-danger bg-danger/10",
};

const AI_ANALYSIS_OPTIONS = [
  { key: "sentiment", icon: TrendingUp, label: "Sentimiento general" },
  { key: "themes", icon: BrainCircuit, label: "Temas recurrentes" },
  { key: "responses", icon: MessageSquareText, label: "Respuestas sugeridas" },
  { key: "audience", icon: Users, label: "Perfil de clientes" },
  { key: "action", icon: Target, label: "Plan de acción" },
  { key: "reputation", icon: ShieldCheck, label: "Salud de reputación" },
];

export function BusinessSummary({
  profile,
  onGenerateSummary,
  generating,
}: BusinessSummaryProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedChips, setSelectedChips] = useState<Set<string>>(
    new Set(["sentiment", "themes", "responses"])
  );
  const summary = profile.aiSummary;

  const toggleChip = (key: string) => {
    setSelectedChips((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  // Need at least 10 reviews
  if (profile.totalReviews < 10) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#2d2d8a] via-[#3b2d8a] to-[#4a2d8a] border border-secondary/20 shadow-lg p-8 text-center">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-secondary/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-primary/8 rounded-full blur-3xl pointer-events-none" />
        <div className="relative">
          <div className="w-14 h-14 rounded-2xl bg-secondary/15 flex items-center justify-center mx-auto mb-4">
            <BrainCircuit className="w-8 h-8 text-secondary" />
          </div>
          <p className="text-body-sm text-foreground-muted">
            Se necesitan al menos 10 reseñas para un análisis completo.
            Actualmente tienes <span className="font-bold text-foreground">{profile.totalReviews}</span>.
          </p>
        </div>
      </div>
    );
  }

  // Empty state: no summary generated yet — the main banner
  if (!summary) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a1a6e] via-[#2a1a6e] to-[#3d1a7a] border border-secondary/25 shadow-xl">
        {/* Decorative glow orbs */}
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-secondary/15 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-primary/15 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-secondary/8 rounded-full blur-[60px] pointer-events-none" />

        <div className="relative px-8 py-12 md:px-12 md:py-14">
          {/* Big centered icon */}
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-secondary/25 to-primary/25 border border-secondary/20 flex items-center justify-center shadow-lg shadow-[#1a1a4e]/30">
              <BrainCircuit className="w-10 h-10 text-secondary" />
            </div>

            <div className="space-y-3 max-w-xl">
              <h3 className="text-h2 font-heading font-bold text-foreground">
                Análisis inteligente de reseñas
              </h3>
              <p className="text-body text-foreground-muted leading-relaxed">
                Nuestra IA analiza todas tus reseñas para darte insights
                accionables. Selecciona qué quieres analizar:
              </p>
            </div>

            {/* Selectable analysis chips */}
            <div className="flex flex-wrap justify-center gap-2.5 max-w-2xl">
              {AI_ANALYSIS_OPTIONS.map((opt) => {
                const isSelected = selectedChips.has(opt.key);
                return (
                  <button
                    key={opt.key}
                    onClick={() => toggleChip(opt.key)}
                    className={`inline-flex items-center gap-2 px-4 py-2 text-caption font-medium rounded-full border transition-all duration-200 ${
                      isSelected
                        ? "bg-secondary/20 border-secondary/40 text-secondary shadow-sm shadow-[#1a1a4e]/20"
                        : "bg-[#ffffff0d] border-[#ffffff1a] text-foreground-muted hover:border-secondary/30 hover:text-foreground"
                    }`}
                  >
                    <opt.icon className={`w-3.5 h-3.5 ${isSelected ? "text-secondary" : ""}`} />
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {/* CTA Button */}
            <Button
              variant="primary"
              onClick={onGenerateSummary}
              disabled={generating || selectedChips.size === 0}
              className="px-10 py-3.5 text-body font-bold shadow-lg shadow-[#1a1a4e]/40 bg-gradient-to-r from-[#7c3aed] to-[#3b82f6] hover:from-[#8b5cf6] hover:to-[#60a5fa] border-0 mt-2"
            >
              {generating ? (
                <Loader2 className="w-5 h-5 mr-2.5 animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5 mr-2.5" />
              )}
              Generar análisis con IA
            </Button>

            {selectedChips.size === 0 && (
              <p className="text-caption text-foreground-subtle">
                Selecciona al menos una opción de análisis
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Summary exists — show results
  const sentimentClass =
    SENTIMENT_COLORS[summary.overallSentiment.toLowerCase()] ||
    SENTIMENT_COLORS.neutro;

  return (
    <Card>
      <CardHeader className={`flex flex-col gap-1.5 p-6 ${collapsed ? "pb-6" : "pb-0"} transition-all duration-300`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-secondary/20 to-primary/20 flex items-center justify-center">
              <BrainCircuit className="w-5 h-5 text-secondary" />
            </div>
            <h3 className="text-h4 font-heading font-semibold text-foreground">
              Resumen IA
            </h3>
            <span
              className={`px-2.5 py-0.5 text-caption font-medium rounded-full ${sentimentClass}`}
            >
              {summary.overallSentiment}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onGenerateSummary}
              disabled={generating}
            >
              {generating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5" />
              )}
            </Button>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 text-foreground-muted hover:text-foreground rounded-md hover:bg-surface-raised transition-colors"
            >
              {collapsed ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronUp className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </CardHeader>

      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: collapsed ? 0 : 1000,
          opacity: collapsed ? 0 : 1,
        }}
      >
        <CardContent className="space-y-5">
          {/* Positive themes */}
          {summary.positiveThemes.length > 0 && (
            <div>
              <p className="text-body-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
                <ThumbsUp className="w-4 h-4 text-success" /> Aspectos positivos
              </p>
              <div className="flex flex-wrap gap-2">
                {summary.positiveThemes.map((theme, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 text-caption bg-success/10 text-success rounded-full font-medium"
                  >
                    {theme}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Negative themes */}
          {summary.negativeThemes.length > 0 && (
            <div>
              <p className="text-body-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
                <ThumbsDown className="w-4 h-4 text-danger" /> Áreas de mejora
              </p>
              <div className="flex flex-wrap gap-2">
                {summary.negativeThemes.map((theme, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 text-caption bg-danger/10 text-danger rounded-full font-medium"
                  >
                    {theme}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {summary.recommendations.length > 0 && (
            <div>
              <p className="text-body-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-warning" /> Recomendaciones
              </p>
              <ol className="list-decimal list-inside space-y-1.5">
                {summary.recommendations.map((rec, i) => (
                  <li
                    key={i}
                    className="text-body-sm text-foreground-muted leading-relaxed"
                  >
                    {rec}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Meta */}
          <p className="text-caption text-foreground-subtle pt-3 border-t border-border-subtle">
            Basado en {summary.reviewCountAnalyzed} reseñas
            {summary.generatedAt &&
              ` · Generado ${new Date(summary.generatedAt).toLocaleDateString("es-ES")}`}
          </p>
        </CardContent>
      </div>
    </Card>
  );
}
