import { WorkingHours } from "@/lib/working-hours/types";
import { Reservation } from "@/lib/reservation/types";

/**
 * Convert JS Date.getDay() (0=Sun..6=Sat) to our WorkingHours dayOfWeek (0=Mon..6=Sun).
 */
function jsDayToWorkingDay(jsDay: number): number {
  return jsDay === 0 ? 6 : jsDay - 1;
}

/**
 * Parse "HH:MM" to total minutes from midnight.
 */
function parseTime(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/**
 * Format total minutes from midnight to "HH:MM".
 */
function formatTime(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/**
 * Check if two date strings fall on the same calendar date.
 */
function isSameDate(dateStr: string, date: Date): boolean {
  const d = new Date(dateStr);
  return (
    d.getFullYear() === date.getFullYear() &&
    d.getMonth() === date.getMonth() &&
    d.getDate() === date.getDate()
  );
}

/**
 * Compute available 30-min slots for a given date, working hours, and existing reservations.
 *
 * @param date - The target date
 * @param workingHours - Array of working hours for all days
 * @param reservations - All existing reservations
 * @param inCharge - The in-charge person to filter reservations by
 * @returns Sorted array of available time strings (e.g., ["09:00", "09:30", "10:00"])
 */
export function getAvailableSlots(
  date: Date,
  workingHours: WorkingHours[],
  reservations: Reservation[],
  inCharge: string
): string[] {
  const SLOT_DURATION = 30;

  const workingDay = jsDayToWorkingDay(date.getDay());
  const dayConfig = workingHours.find((wh) => wh.dayOfWeek === workingDay);

  // Day is disabled or not configured
  if (!dayConfig || !dayConfig.enabled) {
    return [];
  }

  const startMin = parseTime(dayConfig.startTime);
  const endMin = parseTime(dayConfig.endTime);

  // Generate all possible slots
  const allSlots: number[] = [];
  for (let t = startMin; t + SLOT_DURATION <= endMin; t += SLOT_DURATION) {
    allSlots.push(t);
  }

  // Get reservations for this date and in-charge person
  const occupiedSlots = new Set<number>();
  reservations
    .filter(
      (r) =>
        r.inCharge === inCharge &&
        r.status === "PENDING" &&
        isSameDate(r.reservationStartDate, date)
    )
    .forEach((r) => {
      const resStart = new Date(r.reservationStartDate);
      const resStartMin = resStart.getHours() * 60 + resStart.getMinutes();
      const resEnd = new Date(r.reservationEndDate);
      const resEndMin = resEnd.getHours() * 60 + resEnd.getMinutes();

      // Mark all slots that overlap with this reservation
      for (let t = startMin; t + SLOT_DURATION <= endMin; t += SLOT_DURATION) {
        const slotEnd = t + SLOT_DURATION;
        if (t < resEndMin && slotEnd > resStartMin) {
          occupiedSlots.add(t);
        }
      }
    });

  // Filter out past slots if date is today
  const now = new Date();
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
  const currentMin = isToday ? now.getHours() * 60 + now.getMinutes() : 0;

  return allSlots
    .filter((t) => !occupiedSlots.has(t) && t + SLOT_DURATION > currentMin)
    .map(formatTime);
}

/**
 * Check if a day is closed (disabled in working hours).
 */
export function isDayClosed(
  date: Date,
  workingHours: WorkingHours[]
): boolean {
  const workingDay = jsDayToWorkingDay(date.getDay());
  const dayConfig = workingHours.find((wh) => wh.dayOfWeek === workingDay);
  return !dayConfig || !dayConfig.enabled;
}
