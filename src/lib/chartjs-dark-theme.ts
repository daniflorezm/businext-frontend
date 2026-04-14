/**
 * Chart.js 4.x dark theme defaults for Businext.
 *
 * Import this module once (side-effect) in the finances page or layout
 * so that every chart inherits the dark palette automatically.
 *
 * Palette (≥4.5:1 on #23237c):
 *   #5B9CF6, #FFC60B, #E8C3F6, #4DD9A8, #FF7E67,
 *   #36D8F5, #F59E44, #C084FC, #F472B6, #A3E635
 */

import { Chart, type ChartOptions } from "chart.js";

/* ── Reduced-motion detection ── */
const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/* ── Token values (mirror globals.css @theme) ── */
const FOREGROUND = "#fbfcff";
const FOREGROUND_MUTED = "#b8b8d4";
const BORDER_SUBTLE = "#37379a";
const SURFACE_RAISED = "#37379a";

/* ── Global defaults ── */
Chart.defaults.color = FOREGROUND_MUTED;
Chart.defaults.borderColor = BORDER_SUBTLE;

/* Disable chart animations when reduced motion is preferred */
if (prefersReducedMotion) {
  Chart.defaults.animation = false;
}

/* ── Tooltip ── */
const tooltip: NonNullable<ChartOptions["plugins"]>["tooltip"] = {
  backgroundColor: SURFACE_RAISED,
  titleColor: FOREGROUND,
  bodyColor: FOREGROUND_MUTED,
  borderColor: BORDER_SUBTLE,
  borderWidth: 1,
  padding: 10,
  cornerRadius: 8,
  caretSize: 6,
  displayColors: true,
  boxPadding: 4,
  titleFont: { weight: "bold" as const },
};

/* ── Legend ── */
const legend: NonNullable<ChartOptions["plugins"]>["legend"] = {
  labels: {
    color: FOREGROUND_MUTED,
    padding: 12,
    font: { size: 12 },
    usePointStyle: true,
    pointStyleWidth: 8,
  },
};

/* Apply to defaults.plugins */
Chart.defaults.plugins.tooltip = {
  ...Chart.defaults.plugins.tooltip,
  ...tooltip,
} as typeof Chart.defaults.plugins.tooltip;

Chart.defaults.plugins.legend = {
  ...Chart.defaults.plugins.legend,
  ...legend,
} as typeof Chart.defaults.plugins.legend;

/* ── Grid & Ticks ── */
Chart.defaults.scale.grid.color = BORDER_SUBTLE;
Chart.defaults.scale.ticks.color = FOREGROUND_MUTED;

/* ── Chart dark palette for dataset colors ── */
export const CHART_PALETTE = [
  "#5B9CF6",
  "#FFC60B",
  "#E8C3F6",
  "#4DD9A8",
  "#FF7E67",
  "#36D8F5",
  "#F59E44",
  "#C084FC",
  "#F472B6",
  "#A3E635",
] as const;

/* ── Helper: cycle through palette ── */
export function paletteColor(index: number): string {
  return CHART_PALETTE[index % CHART_PALETTE.length];
}

/* ── Common dark chart options (merge into per-chart options) ── */
export const darkChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: prefersReducedMotion
    ? false
    : { duration: 400, easing: "easeOutQuart" as const },
  plugins: {
    tooltip: {
      backgroundColor: SURFACE_RAISED,
      titleColor: FOREGROUND,
      bodyColor: FOREGROUND_MUTED,
      borderColor: BORDER_SUBTLE,
      borderWidth: 1,
      padding: 10,
      cornerRadius: 8,
      caretSize: 6,
      displayColors: true,
    },
  },
  scales: {
    x: {
      grid: { color: "transparent" },
      ticks: { color: FOREGROUND_MUTED, font: { size: 11 } },
    },
    y: {
      grid: { color: BORDER_SUBTLE },
      ticks: {
        color: FOREGROUND_MUTED,
        font: { size: 11 },
      },
    },
  },
} as const;
