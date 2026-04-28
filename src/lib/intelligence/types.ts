export interface EmployeeStats {
  name: string;
  income: number;
  reservations: number;
  product_sales: number;
  avg_ticket: number;
}

export interface Opportunity {
  text: string;
  impact: "alto" | "medio" | "bajo";
}

export interface WeeklySummaryKPIs {
  total_income: number;
  total_reservations: number;
  total_product_sales: number;
  prev_week_income: number;
  prev_week_reservations: number;
  prev_week_product_sales: number;
  income_change_pct: number;
  reservations_change_pct: number;
  product_sales_change_pct: number;
  best_day: string;
  worst_day: string;
  top_service: string;
  daily_income?: number[];
  daily_reservations?: number[];
  daily_products?: number[];
  opportunities?: (Opportunity | string)[];
  employee_stats?: EmployeeStats[];
  star_employee?: string;
  team_narrative?: string;
}

export interface WeeklySummaryData {
  id: number;
  business_id: string;
  week_start: string;
  week_end: string;
  narrative: string;
  kpis: string; // JSON string of WeeklySummaryKPIs
  client_narrative: string | null;
  generated_at: string;
}

export type LoyaltyStatus = "fiel" | "en_riesgo" | "nuevo";
export type Trend = "up" | "stable" | "down";

export interface ClientProfile {
  customerName: string;
  visitCount: number;
  totalSpend: number;
  avgFrequencyDays: number;
  daysSinceLastVisit: number;
  lastVisitDate: string;
  loyaltyStatus: LoyaltyStatus;
  trend: Trend;
  services: string[];
}
