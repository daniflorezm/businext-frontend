import React from "react";
import { TrendingUp, TrendingDown, Scale } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  FinancesBalanceCardProps,
  FinanceBalanceType,
} from "@/lib/finances/types";

const iconMap = {
  income: TrendingUp,
  expense: TrendingDown,
  balance: Scale,
} as const;

const colorMap = {
  income: {
    icon: "text-success",
    iconBg: "bg-success/15",
    border: "border-success/40",
    amount: "text-success",
  },
  expense: {
    icon: "text-danger",
    iconBg: "bg-danger/15",
    border: "border-danger/40",
    amount: "text-danger",
  },
  balance: {
    icon: "text-accent",
    iconBg: "bg-accent/15",
    border: "border-accent/40",
    amount: "text-accent",
  },
} as const;

export const FinancesBalanceCard = ({
  type,
  amount,
  monthName,
}: FinancesBalanceCardProps) => {
  const Icon = iconMap[type];
  const colors = colorMap[type];

  return (
    <Card
      variant="elevated"
      className={`w-full border-l-4 ${colors.border} transition-all duration-150 ease-snappy hover:shadow-glow-primary`}
    >
      <CardContent className="flex items-center justify-between gap-4 p-5">
        <div className="flex flex-col gap-1 min-w-0">
          <p className="text-caption font-semibold uppercase tracking-wide text-foreground-muted">
            {FinanceBalanceType[type]}
          </p>
          <p className="text-caption text-foreground-subtle">
            Mes: {monthName}
          </p>
          <p className={`text-h3 font-bold ${colors.amount}`}>
            {typeof amount === "number" ? amount.toLocaleString("es-ES") : amount}&euro;
          </p>
        </div>
        <div
          className={`flex items-center justify-center h-12 w-12 rounded-lg ${colors.iconBg} flex-shrink-0`}
        >
          <Icon className={`h-6 w-6 ${colors.icon}`} />
        </div>
      </CardContent>
    </Card>
  );
};
