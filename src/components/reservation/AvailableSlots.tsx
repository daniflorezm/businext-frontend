"use client";

import { Button } from "@/components/ui/button";

interface AvailableSlotsProps {
  slots: string[];
  onSlotSelect: (time: string) => void;
  loading: boolean;
  closedMessage?: string;
  selectedSlot?: string | null;
}

export function AvailableSlots({
  slots,
  onSlotSelect,
  loading,
  closedMessage,
  selectedSlot,
}: AvailableSlotsProps) {
  if (loading) {
    return (
      <p className="text-caption text-foreground-muted">
        Cargando horarios...
      </p>
    );
  }

  if (closedMessage) {
    return (
      <div className="bg-warning/10 border border-warning/30 text-warning rounded-lg px-4 py-3 text-body-sm">
        {closedMessage}
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <p className="text-body-sm text-foreground-muted">
        No hay horarios disponibles para este día.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
      {slots.map((slot) => (
        <Button
          key={slot}
          type="button"
          variant={selectedSlot === slot ? "primary" : "secondary"}
          size="sm"
          onClick={() => onSlotSelect(slot)}
          className="text-caption"
        >
          {slot}
        </Button>
      ))}
    </div>
  );
}
