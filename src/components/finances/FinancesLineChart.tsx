import { AnualBalances, monthOptions } from "@/lib/finances/types";
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
  Filler,
} from "chart.js";
import { CHART_PALETTE, darkChartOptions } from "@/lib/chartjs-dark-theme";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
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
        borderColor: CHART_PALETTE[0],
        backgroundColor: "rgba(91, 156, 246, 0.10)",
        pointBackgroundColor: CHART_PALETTE[0],
        pointBorderColor: "#2d2d8a",
        pointHoverBackgroundColor: "#fbfcff",
        pointHoverBorderColor: CHART_PALETTE[0],
        tension: 0.4,
        fill: true,
        borderWidth: 2.5,
        pointRadius: 3,
        pointHoverRadius: 6,
      },
    ],
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <h2 className="font-heading text-h4 font-semibold text-foreground text-center">
          Balance por Mes ({currentYear})
        </h2>
      </CardHeader>
      <CardContent>
        <div className="relative w-full h-[220px] sm:h-[260px] md:h-[300px]">
          <Line
            data={data}
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
