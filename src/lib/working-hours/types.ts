export type WorkingHours = {
  id?: number;
  dayOfWeek: number; // 0=Monday, 1=Tuesday, ..., 6=Sunday
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  enabled: boolean;
};

export const DAY_LABELS: Record<number, string> = {
  0: "Lunes",
  1: "Martes",
  2: "Miércoles",
  3: "Jueves",
  4: "Viernes",
  5: "Sábado",
  6: "Domingo",
};

export const DEFAULT_WORKING_HOURS: WorkingHours[] = Array.from(
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
): WorkingHours => ({
  id: data.id as number | undefined,
  dayOfWeek: data.day_of_week as number,
  startTime: data.start_time as string,
  endTime: data.end_time as string,
  enabled: data.enabled as boolean,
});

export const mapWorkingHoursToApi = (wh: WorkingHours) => ({
  id: wh.id,
  day_of_week: wh.dayOfWeek,
  start_time: wh.startTime,
  end_time: wh.endTime,
  enabled: wh.enabled,
});
