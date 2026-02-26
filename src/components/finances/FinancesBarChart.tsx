import { Finances, ChartsColors } from "@/lib/finances/types";
import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const FinancesBarChart = ({
  financesData,
}: {
  financesData: Finances[];
}) => {
  // Agrupa y suma los ingresos por concepto
  const createDataSet = (financesArray: Finances[]) => {
    const getIncomes = financesArray
      .filter((item) => item.type === "INCOME")
      .reduce((acc: Record<string, number>, item: Finances) => {
        acc[item.concept] = (acc[item.concept] || 0) + item.amount;
        return acc;
      }, {});

    const dataset = Object.keys(getIncomes).map((key) => {
      return {
        label: key,
        amount: getIncomes[key],
      };
    });

    return dataset;
  };
  const dataset = createDataSet(financesData);

  return (
    <div className="w-full max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-3xl mx-auto bg-white/90 rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 lg:p-10 border border-gray-200 mt-8 flex flex-col">
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center text-gray-800 mb-4 sm:mb-6 tracking-tight">
        Ganancias por Servicio/Producto
      </h2>
      <div className="relative w-full h-[220px] sm:h-[280px] md:h-[340px] lg:h-[400px]">
        <Bar
          data={{
            labels: dataset.map((data: { label: string }) => data.label),
            datasets: [
              {
                label: "Total Ingresos (€)",
                data: dataset.map((data: { amount: number }) => data.amount),
                backgroundColor: dataset.map(
                  (_: unknown, i: number) => ChartsColors[i % ChartsColors.length]
                ),
                borderRadius: 12,
                borderSkipped: false,
                borderWidth: 0,
                hoverBackgroundColor: dataset.map(
                  (_: unknown, i: number) =>
                    ChartsColors[(i + 2) % ChartsColors.length]
                ),
                barPercentage: 0.7,
                categoryPercentage: 0.6,
              },
            ],
          }}
          options={{
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
              easing: "easeOutQuart",
            },
          }}
        />
      </div>
    </div>
  );
};
