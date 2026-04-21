"use client";

import { useMemo } from "react";
import { Star } from "lucide-react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { GoogleBusinessProfile } from "@/lib/google-reviews/types";

ChartJS.register(ArcElement, Tooltip, Legend);

type ReviewMetricsProps = {
  profile: GoogleBusinessProfile;
};

const STAR_COLORS = [
  "#F59E0B", // 5 stars - amber
  "#84CC16", // 4 stars - lime
  "#3B82F6", // 3 stars - blue
  "#F97316", // 2 stars - orange
  "#EF4444", // 1 star - red
];

export function ReviewMetrics({ profile }: ReviewMetricsProps) {
  const scores = profile.reviewsPerScore || {};
  const total = profile.totalReviews || 0;
  const starLevels = [5, 4, 3, 2, 1];

  const chartData = useMemo(() => ({
    labels: starLevels.map((s) => `${s} estrellas`),
    datasets: [
      {
        data: starLevels.map((s) => scores[String(s)] ?? 0),
        backgroundColor: STAR_COLORS,
        borderColor: "transparent",
        borderWidth: 0,
        hoverOffset: 6,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [scores]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    cutout: "65%",
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(35, 35, 124, 0.95)",
        titleColor: "#fbfcff",
        bodyColor: "#b8b8d4",
        borderColor: "rgba(74, 74, 170, 0.5)",
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
      },
    },
  }), []);

  return (
    <Card className="h-full">
      <CardHeader>
        <h3 className="text-h4 font-heading font-semibold text-foreground">
          Distribución de calificaciones
        </h3>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-2 gap-6 items-center">
          {/* Left: Donut chart */}
          <div className="relative h-44">
            <Doughnut data={chartData} options={chartOptions} />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-h3 font-bold text-foreground">{total}</span>
              <span className="text-caption text-foreground-muted">Total</span>
            </div>
          </div>

          {/* Right: Bar list */}
          <div className="space-y-2.5">
            {starLevels.map((star, idx) => {
              const count = scores[String(star)] ?? 0;
              const pct = total > 0 ? (count / total) * 100 : 0;

              return (
                <div key={star} className="flex items-center gap-2">
                  <div className="flex items-center gap-1 w-10 justify-end shrink-0">
                    <span className="text-body-sm font-semibold text-foreground">
                      {star}
                    </span>
                    <Star className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />
                  </div>
                  <div className="flex-1 h-2.5 bg-surface-raised rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: STAR_COLORS[idx],
                      }}
                    />
                  </div>
                  <span className="text-caption font-medium text-foreground-muted w-14 text-right shrink-0">
                    {count} <span className="text-foreground-subtle">({pct.toFixed(0)}%)</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
