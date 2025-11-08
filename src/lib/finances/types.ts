import { UseFormRegister } from "react-hook-form";
export type Finances = {
  id?: number;
  concept: string;
  amount: number;
  type: string;
  creator: string;
  created_at?: string;
  reservation_id?: number;
};

export type FinancesModalProps = {
  isOpen: boolean;
  handleOpenModal: () => void;
};

export type FinanceRecordItemProps = Finances & { customerName?: string };

export const PlaceHoldersFinancesMapping = {
  id: "ID",
  concept: "Concepto",
  amount: "Cuantía",
  type: "Tipo de registro",
  creator: "Emisor",
  created_at: "Fecha de creación",
} as const;

export type FinancesInputProps = {
  label: keyof typeof PlaceHoldersFinancesMapping;
  register: UseFormRegister<Finances>;
  required: boolean;
  disabled?: boolean;
  options?: { [key: string]: string };
  type?: string;
};

export const FinancesTypeOptions = {
  INCOME: "Ingreso",
  EXPENSE: "Gasto",
};

export type FinancesDeleteModalProps = {
  id: number;
  concept: string;
  openDeleteModal: boolean;
  handleOpenDeleteModal: () => void;
  deleteFinanceRecord: (id: number) => Promise<void>;
};

export const FinanceBalanceType = {
  income: "Total Ingresos",
  expense: "Total Gastos",
  balance: "Balance General",
} as const;

export type FinancesBalanceCardProps = {
  type: keyof typeof FinanceBalanceType;
  amount: number;
  monthName: string;
};

export type AnualBalances = {
  month: number;
  balance: number;
};

export const ChartsColors = [
  "#6366f1", // Indigo
  "#06b6d4", // Cyan
  "#f59e42", // Orange
  "#10b981", // Emerald
  "#f43f5e", // Rose
  "#a21caf", // Purple
  "#fbbf24", // Amber
  "#0ea5e9", // Sky
  "#eab308", // Yellow
  "#14b8a6", // Teal
];

export const monthOptions = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];
