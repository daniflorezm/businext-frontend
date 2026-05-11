export type WorkingHoursBlock = {
  id?: number;
  dayOfWeek: number; // 0=Monday, 1=Tuesday, ..., 6=Sunday
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  enabled: boolean;
  memberUserId?: string | null;
};

/** Alias for backward compat — a WorkingHours is a single block */
export type WorkingHours = WorkingHoursBlock;

export const DAY_LABELS: Record<number, string> = {
  0: "Lunes",
  1: "Martes",
  2: "Miércoles",
  3: "Jueves",
  4: "Viernes",
  5: "Sábado",
  6: "Domingo",
};

export const DEFAULT_WORKING_HOURS: WorkingHoursBlock[] = Array.from(
  { length: 7 },
  (_, i) => ({
    dayOfWeek: i,
    startTime: "09:00",
    endTime: "18:00",
    enabled: i < 5, // Mon-Fri enabled, Sat-Sun disabled
  })
);

export const mapWorkingHoursFromApi = (
  data: Record<string, unknown>
): WorkingHoursBlock => ({
  id: data.id as number | undefined,
  dayOfWeek: data.day_of_week as number,
  startTime: data.start_time as string,
  endTime: data.end_time as string,
  enabled: data.enabled as boolean,
  memberUserId: (data.member_user_id as string | null) ?? null,
});

export const mapWorkingHoursToApi = (wh: WorkingHoursBlock) => ({
  day_of_week: wh.dayOfWeek,
  start_time: wh.startTime,
  end_time: wh.endTime,
  enabled: wh.enabled,
});

/**
 * Group blocks by day of week for the multi-block editor.
 */
export type DaySchedule = {
  dayOfWeek: number;
  enabled: boolean;
  blocks: { startTime: string; endTime: string }[];
};

export function blocksToDaySchedules(blocks: WorkingHoursBlock[]): DaySchedule[] {
  const map = new Map<number, DaySchedule>();

  // Init all 7 days
  for (let i = 0; i < 7; i++) {
    map.set(i, { dayOfWeek: i, enabled: false, blocks: [] });
  }

  for (const b of blocks) {
    const day = map.get(b.dayOfWeek)!;
    if (b.enabled) {
      day.enabled = true;
      day.blocks.push({ startTime: b.startTime, endTime: b.endTime });
    }
  }

  // Sort blocks within each day
  for (const day of map.values()) {
    day.blocks.sort((a, b) => a.startTime.localeCompare(b.startTime));
    // If no blocks but day existed as disabled, keep enabled=false with a default block
    if (day.blocks.length === 0) {
      day.blocks.push({ startTime: "09:00", endTime: "18:00" });
    }
  }

  return Array.from(map.values()).sort((a, b) => a.dayOfWeek - b.dayOfWeek);
}

export function daySchedulesToBlocks(schedules: DaySchedule[]): WorkingHoursBlock[] {
  const blocks: WorkingHoursBlock[] = [];
  for (const day of schedules) {
    if (!day.enabled) {
      // Send a single disabled block for the day
      blocks.push({
        dayOfWeek: day.dayOfWeek,
        startTime: day.blocks[0]?.startTime ?? "09:00",
        endTime: day.blocks[0]?.endTime ?? "18:00",
        enabled: false,
      });
    } else {
      for (const block of day.blocks) {
        blocks.push({
          dayOfWeek: day.dayOfWeek,
          startTime: block.startTime,
          endTime: block.endTime,
          enabled: true,
        });
      }
    }
  }
  return blocks;
}
