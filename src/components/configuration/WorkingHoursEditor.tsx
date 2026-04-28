"use client";

import { useState, useEffect } from "react";
import {
  WorkingHours,
  DAY_LABELS,
  DEFAULT_WORKING_HOURS,
} from "@/lib/working-hours/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock } from "lucide-react";
import { Toast, useToast } from "@/components/common/Toast";

interface WorkingHoursEditorProps {
  workingHoursData: WorkingHours[];
  onSave: (hours: WorkingHours[]) => Promise<WorkingHours[] | null>;
  loading: boolean;
}

export function WorkingHoursEditor({
  workingHoursData,
  onSave,
  loading,
}: WorkingHoursEditorProps) {
  const [hours, setHours] = useState<WorkingHours[]>(DEFAULT_WORKING_HOURS);
  const [saving, setSaving] = useState(false);
  const { toastState, showToast, closeToast } = useToast();

  useEffect(() => {
    if (workingHoursData.length > 0) {
      // Merge saved data with defaults for any missing days
      const merged = DEFAULT_WORKING_HOURS.map((def) => {
        const saved = workingHoursData.find(
          (wh) => wh.dayOfWeek === def.dayOfWeek
        );
        return saved ?? def;
      });
      setHours(merged);
    }
  }, [workingHoursData]);

  const updateDay = (
    dayOfWeek: number,
    field: keyof WorkingHours,
    value: string | boolean
  ) => {
    setHours((prev) =>
      prev.map((h) =>
        h.dayOfWeek === dayOfWeek ? { ...h, [field]: value } : h
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);
    const result = await onSave(hours);
    setSaving(false);
    if (result) {
      showToast("success", "Horario de trabajo guardado correctamente.");
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
              <h2 className="font-heading text-h4 font-semibold text-foreground">
                Horario de Trabajo
              </h2>
              <p className="text-body-sm text-foreground-muted">
                Configura los horarios de apertura y cierre de tu negocio
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {hours.map((day) => (
              <div
                key={day.dayOfWeek}
                className={`flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 p-3 rounded-lg border transition-colors duration-150 ${
                  day.enabled
                    ? "border-border-subtle bg-surface"
                    : "border-border-subtle/50 bg-surface-raised/30 opacity-60"
                }`}
              >
                <div className="flex items-center gap-3 w-full sm:w-28 shrink-0">
                  <input
                    type="checkbox"
                    checked={day.enabled}
                    onChange={(e) =>
                      updateDay(day.dayOfWeek, "enabled", e.target.checked)
                    }
                    className="w-4 h-4 rounded accent-primary"
                  />
                  <span className="text-body-sm font-medium text-foreground">
                    {DAY_LABELS[day.dayOfWeek]}
                  </span>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Input
                    type="time"
                    value={day.startTime}
                    onChange={(e) =>
                      updateDay(day.dayOfWeek, "startTime", e.target.value)
                    }
                    disabled={!day.enabled}
                    className="w-full sm:w-32 h-9 text-caption"
                  />
                  <span className="text-foreground-muted text-caption">a</span>
                  <Input
                    type="time"
                    value={day.endTime}
                    onChange={(e) =>
                      updateDay(day.dayOfWeek, "endTime", e.target.value)
                    }
                    disabled={!day.enabled}
                    className="w-full sm:w-32 h-9 text-caption"
                  />
                </div>
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
