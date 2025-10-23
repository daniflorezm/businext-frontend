import {
  AnualBalances,
  monthOptions,
  ChartsColors,
} from "@/lib/finances/types";
import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const FinancesLineChart = ({
  financesData,
}: {
  financesData: AnualBalances[];
}) => {
  const currentYear = new Date().getFullYear().toString();

  const data = {
    labels: financesData.map((item) => monthOptions[item.month - 1]),
    datasets: [
      {
        label: "Balance por Mes (€)",
        data: financesData.map((item) => item.balance),
        borderColor: ChartsColors[0],
        backgroundColor: "rgba(99, 102, 241, 0.15)",
        pointBackgroundColor: ChartsColors[0],
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: ChartsColors[0],
        tension: 0.4,
        fill: true,
        borderWidth: 3,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#18181b",
        titleColor: "#fbbf24",
        bodyColor: "#fff",
        borderColor: "#6366f1",
        borderWidth: 1,
        padding: 12,
        caretSize: 8,
        cornerRadius: 8,
        displayColors: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#6366f1",
          font: {
            size: 12,
            weight: "bold" as const,
          },
        },
      },
      y: {
        grid: {
          color: "#e5e7eb",
        },
        ticks: {
          color: "#64748b",
          font: {
            size: 11,
          },
          callback: function (value: string | number) {
            return "€ " + value;
          },
        },
      },
    },
    animation: {
      duration: 1200,
      easing: "easeOutQuart" as const,
    },
  };

  return (
    <div className="w-full max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-3xl mx-auto bg-white/90 rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 lg:p-10 border border-gray-200 mt-8 flex flex-col">
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center text-gray-800 mb-4 sm:mb-6 tracking-tight">
        Balance por Mes ({currentYear})
      </h2>
      <div className="relative w-full h-[220px] sm:h-[280px] md:h-[340px] lg:h-[400px]">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};
