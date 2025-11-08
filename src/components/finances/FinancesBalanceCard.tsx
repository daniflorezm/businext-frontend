import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import {
  FinancesBalanceCardProps,
  FinanceBalanceType,
} from "@/lib/finances/types";
import { monthOptions } from "@/lib/finances/types";

export const FinancesBalanceCard = ({
  type,
  amount,
  monthName,
}: FinancesBalanceCardProps) => {
  const imageSelected =
    type === "income"
      ? "./arrow-up.png"
      : type === "expense"
      ? "./arrow-down.png"
      : "./balance-icon.png";

  const bgGradient =
    type === "income"
      ? "bg-gradient-to-r from-green-200 via-green-100 to-white"
      : type === "expense"
      ? "bg-gradient-to-r from-red-200 via-red-100 to-white"
      : "bg-gradient-to-r from-blue-200 via-blue-100 to-white";
  const borderColor =
    type === "income"
      ? "border-green-400"
      : type === "expense"
      ? "border-red-400"
      : "border-blue-400";
  const textColor =
    type === "income"
      ? "text-green-700"
      : type === "expense"
      ? "text-red-700"
      : "text-blue-700";

  return (
    <div className="w-full max-w-xs mx-auto md:mx-0 md:w-[320px] lg:w-[340px] flex justify-center">
      <Card
        className={`w-full border-2 ${borderColor} shadow-xl rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl`}
      >
        <CardContent className={`pt-6 pb-6 px-6 ${bgGradient} rounded-2xl`}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500 font-semibold mb-1 tracking-wide uppercase">
                {FinanceBalanceType[type]}
              </p>
              <p className="text-xs text-gray-700 mb-2">Mes: {monthName}</p>
              <p
                className={`text-3xl font-extrabold ${textColor} drop-shadow-sm`}
              >
                {amount}€
              </p>
            </div>
            <div className="flex items-center justify-center h-14 w-14 rounded-full bg-white/80 shadow-md border border-gray-200">
              <img src={imageSelected} className="h-8 w-8" alt="icon" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
