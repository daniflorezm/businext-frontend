import { Finances } from "@/lib/finances/types";
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
import { paletteColor, darkChartOptions } from "@/lib/chartjs-dark-theme";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

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
    <Card className="w-full">
      <CardHeader>
        <h2 className="font-heading text-h4 font-semibold text-foreground text-center">
          Ganancias por Servicio/Producto
        </h2>
      </CardHeader>
      <CardContent>
        <div className="relative w-full h-[220px] sm:h-[260px] md:h-[300px]">
          <Bar
            data={{
              labels: dataset.map((data: { label: string }) => data.label),
              datasets: [
                {
                  label: "Total Ingresos (€)",
                  data: dataset.map(
                    (data: { amount: number }) => data.amount
                  ),
                  backgroundColor: dataset.map((_, i: number) =>
                    paletteColor(i)
                  ),
                  borderRadius: 8,
                  borderSkipped: false,
                  borderWidth: 0,
                  hoverBackgroundColor: dataset.map((_, i: number) =>
                    paletteColor(i + 2)
                  ),
                  barPercentage: 0.7,
                  categoryPercentage: 0.6,
                },
              ],
            }}
            options={{
              ...darkChartOptions,
              plugins: {
                ...darkChartOptions.plugins,
                legend: { display: false },
                title: { display: false },
              },
              scales: {
                ...darkChartOptions.scales,
                y: {
                  ...darkChartOptions.scales.y,
                  ticks: {
                    ...darkChartOptions.scales.y.ticks,
                    callback: function (value: string | number) {
                      return "€ " + value;
                    },
                  },
                },
              },
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};
