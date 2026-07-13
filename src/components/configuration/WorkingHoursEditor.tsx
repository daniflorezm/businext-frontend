"use client";

import { useState, useEffect, type ReactNode } from "react";
import {
  WorkingHoursBlock,
  DAY_LABELS,
  DaySchedule,
  blocksToDaySchedules,
  daySchedulesToBlocks,
  DEFAULT_WORKING_HOURS,
} from "@/lib/working-hours/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, Plus, Trash2 } from "lucide-react";
import { Toast, useToast } from "@/components/common/Toast";
import { HelpTooltip } from "@/components/ui/tooltip";

interface WorkingHoursEditorProps {
  workingHoursData: WorkingHoursBlock[];
  onSave: (hours: WorkingHoursBlock[]) => Promise<WorkingHoursBlock[] | null>;
  loading: boolean;
  title?: string;
  description?: string;
  help?: ReactNode;
}

export function WorkingHoursEditor({
  workingHoursData,
  onSave,
  loading,
  title = "Horario de Trabajo",
  description = "Configura los horarios de apertura y cierre de tu negocio",
  help = (
    <>
      Define aquí los días y franjas horarias en las que tu negocio está abierto.
      Este horario se usa para calcular los huecos disponibles al crear una{" "}
      <span className="font-semibold text-foreground">reserva</span>. Puedes
      añadir varios bloques por día (por ejemplo, mañana y tarde).
    </>
  ),
}: WorkingHoursEditorProps) {
  const [schedules, setSchedules] = useState<DaySchedule[]>(() =>
    blocksToDaySchedules(DEFAULT_WORKING_HOURS)
  );
  const [saving, setSaving] = useState(false);
  const { toastState, showToast, closeToast } = useToast();

  useEffect(() => {
    if (workingHoursData.length > 0) {
      setSchedules(blocksToDaySchedules(workingHoursData));
    }
  }, [workingHoursData]);

  const toggleDay = (dayOfWeek: number, enabled: boolean) => {
    setSchedules((prev) =>
      prev.map((d) => (d.dayOfWeek === dayOfWeek ? { ...d, enabled } : d))
    );
  };

  const updateBlock = (
    dayOfWeek: number,
    blockIndex: number,
    field: "startTime" | "endTime",
    value: string
  ) => {
    setSchedules((prev) =>
      prev.map((d) => {
        if (d.dayOfWeek !== dayOfWeek) return d;
        const blocks = [...d.blocks];
        blocks[blockIndex] = { ...blocks[blockIndex], [field]: value };
        return { ...d, blocks };
      })
    );
  };

  const addBlock = (dayOfWeek: number) => {
    setSchedules((prev) =>
      prev.map((d) => {
        if (d.dayOfWeek !== dayOfWeek) return d;
        const lastBlock = d.blocks[d.blocks.length - 1];
        const newStart = lastBlock?.endTime ?? "14:00";
        // Add 2 hours for the new block end, capped at 23:59
        const [h, m] = newStart.split(":").map(Number);
        const endMin = Math.min(h * 60 + m + 120, 23 * 60 + 59);
        const endH = Math.floor(endMin / 60);
        const endM = endMin % 60;
        const newEnd = `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;
        return {
          ...d,
          blocks: [
            ...d.blocks,
            { startTime: newStart, endTime: newEnd },
          ],
        };
      })
    );
  };

  const removeBlock = (dayOfWeek: number, blockIndex: number) => {
    setSchedules((prev) =>
      prev.map((d) => {
        if (d.dayOfWeek !== dayOfWeek || d.blocks.length <= 1) return d;
        return {
          ...d,
          blocks: d.blocks.filter((_, i) => i !== blockIndex),
        };
      })
    );
  };

  const validateSchedules = (): string | null => {
    for (const day of schedules) {
      if (!day.enabled) continue;
      // Check start < end for each block
      for (let i = 0; i < day.blocks.length; i++) {
        const b = day.blocks[i];
        if (b.startTime >= b.endTime) {
          return `${DAY_LABELS[day.dayOfWeek]}: la hora de inicio debe ser anterior a la de fin (bloque ${i + 1}).`;
        }
      }
      // Check overlaps between blocks
      const sorted = [...day.blocks].sort((a, b) => a.startTime.localeCompare(b.startTime));
      for (let i = 0; i < sorted.length - 1; i++) {
        if (sorted[i].endTime > sorted[i + 1].startTime) {
          return `${DAY_LABELS[day.dayOfWeek]}: los bloques de horario se solapan.`;
        }
      }
    }
    return null;
  };

  const handleSave = async () => {
    const error = validateSchedules();
    if (error) {
      showToast("error", error);
      return;
    }
    setSaving(true);
    const blocks = daySchedulesToBlocks(schedules);
    const result = await onSave(blocks);
    setSaving(false);
    if (result) {
      showToast("success", "Horario guardado correctamente.");
    } else {
      showToast("error", "No se pudo guardar el horario. Intenta de nuevo.");
    }
  };

  return (
    <>
      <Card className="w-full">
        <CardContent className="p-4 sm:p-6 md:p-8 flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/15 rounded-lg">
              <Clock className="w-7 h-7 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading text-h4 font-semibold text-foreground">
                  {title}
                </h2>
                <HelpTooltip content={help} />
              </div>
              <p className="text-body-sm text-foreground-muted">
                {description}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {schedules.map((day) => (
              <div
                key={day.dayOfWeek}
                className={`flex flex-col gap-2 p-3 rounded-lg border transition-colors duration-150 ${
                  day.enabled
                    ? "border-border-subtle bg-surface"
                    : "border-border-subtle/50 bg-surface-raised/30 opacity-60"
                }`}
              >
                {/* Day header */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={day.enabled}
                    onChange={(e) => toggleDay(day.dayOfWeek, e.target.checked)}
                    className="w-4 h-4 rounded accent-primary"
                  />
                  <span className="text-body-sm font-medium text-foreground w-24">
                    {DAY_LABELS[day.dayOfWeek]}
                  </span>
                  {day.enabled && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => addBlock(day.dayOfWeek)}
                      className="ml-auto text-primary hover:text-primary"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      <span className="text-caption">Bloque</span>
                    </Button>
                  )}
                </div>

                {/* Time blocks */}
                {day.enabled && (
                  <div className="flex flex-col gap-2 pl-7">
                    {day.blocks.map((block, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={block.startTime}
                          onChange={(e) =>
                            updateBlock(day.dayOfWeek, idx, "startTime", e.target.value)
                          }
                          className="w-full sm:w-32 h-9 text-caption"
                        />
                        <span className="text-foreground-muted text-caption">a</span>
                        <Input
                          type="time"
                          value={block.endTime}
                          onChange={(e) =>
                            updateBlock(day.dayOfWeek, idx, "endTime", e.target.value)
                          }
                          className="w-full sm:w-32 h-9 text-caption"
                        />
                        {day.blocks.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeBlock(day.dayOfWeek, idx)}
                            className="text-danger hover:text-danger hover:bg-danger/10 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={handleSave}
            loading={saving || loading}
          >
            Guardar horario
          </Button>
        </CardContent>
      </Card>

      <Toast
        open={toastState.open}
        type={toastState.type}
        message={toastState.message}
        onClose={closeToast}
      />
    </>
  );
}
