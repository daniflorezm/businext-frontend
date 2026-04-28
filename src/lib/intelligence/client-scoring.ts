import type { Reservation } from "@/lib/reservation/types";
import type { Finances } from "@/lib/finances/types";
import type { Product } from "@/lib/product/types";
import type { ClientProfile, LoyaltyStatus, Trend } from "./types";

/**
 * Compute client loyalty profiles from reservation + finance + product data.
 * All computation is client-side — nothing stored.
 */
export function computeClientProfiles(
  reservations: Reservation[],
  finances: Finances[],
  products: Product[]
): ClientProfile[] {
  const completed = reservations.filter((r) => r.status === "COMPLETED");

  // Group by customerName
  const grouped = new Map<string, Reservation[]>();
  for (const r of completed) {
    const name = r.customerName.trim();
    if (!name) continue;
    const list = grouped.get(name) || [];
    list.push(r);
    grouped.set(name, list);
  }

  const now = new Date();
  const profiles: ClientProfile[] = [];

  for (const [name, visits] of grouped) {
    // Sort by date ascending
    const sorted = [...visits].sort(
      (a, b) =>
        new Date(a.reservationStartDate + "Z").getTime() -
        new Date(b.reservationStartDate + "Z").getTime()
    );

    const visitCount = sorted.length;

    // Total spend: sum prices from product data matched by service name
    const totalSpend = sorted.reduce((sum, r) => {
      const product = products.find((p) => p.name === r.service);
      return sum + (product?.price ?? 0);
    }, 0);

    // Services
    const services = [...new Set(sorted.map((r) => r.service))];

    // Dates
    const dates = sorted.map(
      (r) => new Date(r.reservationStartDate + "Z")
    );
    const lastDate = dates[dates.length - 1];
    const daysSinceLastVisit = Math.floor(
      (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Average frequency (days between consecutive visits)
    let avgFrequencyDays = 0;
    if (dates.length >= 2) {
      const gaps: number[] = [];
      for (let i = 1; i < dates.length; i++) {
        gaps.push(
          (dates[i].getTime() - dates[i - 1].getTime()) / (1000 * 60 * 60 * 24)
        );
      }
      avgFrequencyDays = Math.round(
        gaps.reduce((a, b) => a + b, 0) / gaps.length
      );
    }

    // Trend: compare recent gap vs average
    let trend: Trend = "stable";
    if (dates.length >= 3) {
      const recentGap =
        (dates[dates.length - 1].getTime() - dates[dates.length - 2].getTime()) /
        (1000 * 60 * 60 * 24);
      if (recentGap < avgFrequencyDays * 0.7) trend = "up";
      else if (recentGap > avgFrequencyDays * 1.5) trend = "down";
    }

    // Loyalty status
    let loyaltyStatus: LoyaltyStatus = "nuevo";
    if (visitCount >= 4 && daysSinceLastVisit <= avgFrequencyDays * 2) {
      loyaltyStatus = "fiel";
    } else if (
      visitCount >= 2 &&
      daysSinceLastVisit > avgFrequencyDays * 2
    ) {
      loyaltyStatus = "en_riesgo";
    }

    profiles.push({
      customerName: name,
      visitCount,
      totalSpend: Math.round(totalSpend * 100) / 100,
      avgFrequencyDays,
      daysSinceLastVisit,
      lastVisitDate: lastDate.toISOString().split("T")[0],
      loyaltyStatus,
      trend,
      services,
    });
  }

  // Sort by visit count descending
  return profiles.sort((a, b) => b.visitCount - a.visitCount);
}
