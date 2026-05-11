import { WorkingHours } from "@/lib/working-hours/types";
import { Reservation } from "@/lib/reservation/types";
import { BookingRequest } from "@/lib/booking-request/types";

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
 * Supports multiple working hour blocks per day.
 *
 * @param date - The target date
 * @param workingHours - Array of working hours blocks for all days
 * @param reservations - All existing reservations
 * @param inCharge - The in-charge person to filter reservations by
 * @param bookingRequests - Pending booking requests to treat as occupied
 * @returns Sorted array of available time strings (e.g., ["09:00", "09:30", "10:00"])
 */
export function getAvailableSlots(
  date: Date,
  workingHours: WorkingHours[],
  reservations: Reservation[],
  inCharge: string,
  bookingRequests: BookingRequest[] = []
): string[] {
  const SLOT_DURATION = 30;

  const workingDay = jsDayToWorkingDay(date.getDay());
  // Get ALL enabled blocks for this day (multi-block support)
  const dayBlocks = workingHours.filter(
    (wh) => wh.dayOfWeek === workingDay && wh.enabled
  );

  if (dayBlocks.length === 0) {
    return [];
  }

  // Generate all possible slots from all blocks
  const allSlots = new Set<number>();
  for (const block of dayBlocks) {
    const startMin = parseTime(block.startTime);
    const endMin = parseTime(block.endTime);
    for (let t = startMin; t + SLOT_DURATION <= endMin; t += SLOT_DURATION) {
      allSlots.add(t);
    }
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

      for (const t of allSlots) {
        const slotEnd = t + SLOT_DURATION;
        if (t < resEndMin && slotEnd > resStartMin) {
          occupiedSlots.add(t);
        }
      }
    });

  // Also mark slots occupied by pending booking requests for this employee/date
  bookingRequests
    .filter(
      (br) =>
        br.status === "REQUESTED" &&
        (br.employeeName === inCharge || !br.employeeName) &&
        isSameDate(br.requestedDate, date)
    )
    .forEach((br) => {
      const brStart = new Date(br.requestedDate);
      const brStartMin = brStart.getHours() * 60 + brStart.getMinutes();
      occupiedSlots.add(brStartMin);
    });

  // Filter out past slots if date is today
  const now = new Date();
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
  const currentMin = isToday ? now.getHours() * 60 + now.getMinutes() : 0;

  return Array.from(allSlots)
    .filter((t) => !occupiedSlots.has(t) && t + SLOT_DURATION > currentMin)
    .sort((a, b) => a - b)
    .map(formatTime);
}

/**
 * Check if a day is closed (no enabled blocks in working hours).
 */
export function isDayClosed(
  date: Date,
  workingHours: WorkingHours[]
): boolean {
  const workingDay = jsDayToWorkingDay(date.getDay());
  const enabledBlocks = workingHours.filter(
    (wh) => wh.dayOfWeek === workingDay && wh.enabled
  );
  return enabledBlocks.length === 0;
}
