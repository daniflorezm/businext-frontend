import React, { useEffect } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";
import { Pie } from "react-chartjs-2";
import { Finances, ChartsColors } from "@/lib/finances/types";
import { Product } from "@/lib/product/types";
import { useProduct } from "@/hooks/useProduct";

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
    <div className="w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl mx-auto bg-white/90 rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 lg:p-10 border border-gray-200 mt-8 flex flex-col">
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center text-gray-800 mb-4 sm:mb-6 tracking-tight">
        Servicios más vendidos
      </h2>
      <div className="relative w-full h-[220px] sm:h-[280px] md:h-[340px] lg:h-[400px]">
        <Pie
          data={{
            labels: dataset.map((data) => data.label),
            datasets: [
              {
                label: "Servicios contratados",
                data: dataset.map((data) => data.amount),
                backgroundColor: dataset.map(
                  (_, i) => ChartsColors[i % ChartsColors.length]
                ),
                borderColor: "#fff",
                borderWidth: 3,
                hoverOffset: 16,
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: true,
                position: "bottom" as const,
                labels: {
                  color: "#6366f1",
                  font: {
                    size: 13,
                    weight: "bold" as const,
                  },
                  padding: 10,
                },
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
