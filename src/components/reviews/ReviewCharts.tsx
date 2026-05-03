"use client";

import { useMemo, useState } from "react";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TrendingUp, BarChart3 } from "lucide-react";
import type { GoogleReview } from "@/lib/google-reviews/types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

type TimeRange = "30d" | "3m" | "6m" | "1y" | "all";

const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: "30d", label: "30 días" },
  { value: "3m", label: "3 meses" },
  { value: "6m", label: "6 meses" },
  { value: "1y", label: "1 año" },
  { value: "all", label: "Todo" },
];

type ReviewChartsProps = {
  reviews: GoogleReview[];
};

function getDateCutoff(range: TimeRange): Date | null {
  if (range === "all") return null;
  const now = new Date();
  switch (range) {
    case "30d":
      return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
    case "3m":
      return new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    case "6m":
      return new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
    case "1y":
      return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  }
}

type MonthData = {
  label: string;
  avgRating: number;
  count: number;
};

function groupByMonth(reviews: GoogleReview[], cutoff: Date | null): MonthData[] {
  const filtered = cutoff
    ? reviews.filter((r) => {
        const d = r.reviewDatetimeUtc ? new Date(r.reviewDatetimeUtc) : new Date(r.reviewTimestamp * 1000);
        return d >= cutoff;
      })
    : reviews;

  const groups: Record<string, { total: number; sum: number }> = {};

  for (const r of filtered) {
    const d = r.reviewDatetimeUtc ? new Date(r.reviewDatetimeUtc) : new Date(r.reviewTimestamp * 1000);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!groups[key]) groups[key] = { total: 0, sum: 0 };
    groups[key].total++;
    groups[key].sum += r.reviewRating;
  }

  return Object.entries(groups)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, val]) => {
      const [year, month] = key.split("-");
      const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
      return {
        label: `${monthNames[parseInt(month) - 1]} ${year}`,
        avgRating: val.total > 0 ? val.sum / val.total : 0,
        count: val.total,
      };
    });
}

const baseChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: "rgba(35, 35, 124, 0.95)",
      titleColor: "#fbfcff",
      bodyColor: "#b8b8d4",
      borderColor: "rgba(74, 74, 170, 0.5)",
      borderWidth: 1,
      padding: 12,
      cornerRadius: 8,
      titleFont: { size: 13, weight: 600 as const },
      bodyFont: { size: 12 },
    },
  },
  scales: {
    x: {
      grid: { color: "rgba(255,255,255,0.04)" },
      ticks: { color: "rgba(255,255,255,0.45)", font: { size: 11 } },
    },
    y: {
      grid: { color: "rgba(255,255,255,0.04)" },
      ticks: { color: "rgba(255,255,255,0.45)", font: { size: 11 } },
    },
  },
};

export function ReviewCharts({ reviews }: ReviewChartsProps) {
  const [range, setRange] = useState<TimeRange>("all");

  const monthData = useMemo(
    () => groupByMonth(reviews, getDateCutoff(range)),
    [reviews, range]
  );

  if (reviews.length < 5) {
    return (
      <Card className="h-full">
        <CardContent className="py-12 text-center flex flex-col items-center justify-center h-full">
          <BarChart3 className="w-8 h-8 text-foreground-subtle mb-3" />
          <p className="text-body-sm text-foreground-muted">
            Se necesitan al menos 5 reseñas para análisis de tendencias.
          </p>
        </CardContent>
      </Card>
    );
  }

  const labels = monthData.map((d) => d.label);

  const ratingData = {
    labels,
    datasets: [
      {
        data: monthData.map((d) => parseFloat(d.avgRating.toFixed(2))),
        borderColor: "#F59E0B",
        backgroundColor: "rgba(245, 158, 11, 0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: "#F59E0B",
        pointBorderColor: "transparent",
      },
    ],
  };

  const volumeData = {
    labels,
    datasets: [
      {
        data: monthData.map((d) => d.count),
        backgroundColor: "rgba(59, 130, 246, 0.6)",
        hoverBackgroundColor: "rgba(59, 130, 246, 0.85)",
        borderRadius: 6,
      },
    ],
  };

  const ratingOptions = {
    ...baseChartOptions,
    scales: {
      ...baseChartOptions.scales,
      y: { ...baseChartOptions.scales.y, min: 1, max: 5 },
    },
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <h3 className="text-h4 font-heading font-semibold text-foreground">
            Tendencias
          </h3>
          <div className="flex flex-wrap justify-center gap-1 bg-surface-raised rounded-full p-1 max-w-full overflow-hidden">
            {TIME_RANGES.map((tr) => (
              <button
                key={tr.value}
                onClick={() => setRange(tr.value)}
                className={`px-2.5 py-1 text-xs sm:px-3 sm:py-1.5 sm:text-caption font-medium rounded-full transition-all duration-200 whitespace-nowrap ${
                  range === tr.value
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-foreground-muted hover:text-foreground"
                }`}
              >
                {tr.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-[#F59E0B]" />
              <p className="text-body-sm font-semibold text-foreground">
                Calificación promedio
              </p>
            </div>
            <div className="h-48">
              <Line data={ratingData} options={ratingOptions} />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              <p className="text-body-sm font-semibold text-foreground">
                Volumen por mes
              </p>
            </div>
            <div className="h-48">
              <Bar data={volumeData} options={baseChartOptions} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
