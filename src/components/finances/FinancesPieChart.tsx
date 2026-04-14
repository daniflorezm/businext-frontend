import React, { useEffect } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import { Pie } from "react-chartjs-2";
import { Finances } from "@/lib/finances/types";
import { Product } from "@/lib/product/types";
import { useProduct } from "@/hooks/useProduct";
import { paletteColor, darkChartOptions } from "@/lib/chartjs-dark-theme";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

export const FinancesPieChart = ({
  financesData,
}: {
  financesData: Finances[];
}) => {
  const { getAllProducts, productData } = useProduct();

  const createDataSet = (
    financesArray: Finances[],
    productsArray: Product[]
  ) => {
    const getAmountByService = financesArray
      .filter((item) => item.type === "INCOME")
      .reduce((acc: Record<string, number>, item: Finances) => {
        acc[item.concept] = (acc[item.concept] || 0) + 1;
        return acc;
      }, {});

    const existingServices = productsArray.map((product: Product) => {
      return {
        label: product.name,
        amount: getAmountByService[product.name] || 0,
      };
    });

    const nonExistingServices = financesArray.filter((item) => {
      return !existingServices.some(
        (product) => product.label === item.concept
      );
    });
    return [
      ...existingServices,
      {
        label: "Otros",
        amount: nonExistingServices.length ? nonExistingServices.length : 0,
      },
    ];
  };

  const dataset = createDataSet(financesData, productData);

  useEffect(() => {
    getAllProducts();
  }, []);

  return (
    <Card className="w-full">
      <CardHeader>
        <h2 className="font-heading text-h4 font-semibold text-foreground text-center">
          Servicios más vendidos
        </h2>
      </CardHeader>
      <CardContent>
        <div className="relative w-full h-[220px] sm:h-[260px] md:h-[300px]">
          <Pie
            data={{
              labels: dataset.map((data) => data.label),
              datasets: [
                {
                  label: "Servicios contratados",
                  data: dataset.map((data) => data.amount),
                  backgroundColor: dataset.map((_, i) => paletteColor(i)),
                  borderColor: "rgba(45, 45, 138, 0.8)",
                  borderWidth: 2,
                  hoverOffset: 12,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              animation: darkChartOptions.animation,
              plugins: {
                ...darkChartOptions.plugins,
                legend: {
                  display: true,
                  position: "bottom" as const,
                  labels: {
                    color: "#b8b8d4",
                    font: { size: 12 },
                    padding: 10,
                    usePointStyle: true,
                    pointStyleWidth: 8,
                  },
                },
                title: { display: false },
              },
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};
