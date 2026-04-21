"use client";

import { Badge } from "@/components/ui/badge";

type ValidationStatusBadgeProps = {
  status: "pending" | "locked";
};

export function ValidationStatusBadge({ status }: ValidationStatusBadgeProps) {
  if (status === "locked") {
    return <Badge variant="success">Verificado</Badge>;
  }
  return <Badge variant="muted">Pendiente de confirmación</Badge>;
}
