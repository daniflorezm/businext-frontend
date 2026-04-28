"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useReservation } from "@/hooks/useReservation";
import { useFinances } from "@/hooks/useFinances";
import { useProduct } from "@/hooks/useProduct";
import { computeClientProfiles } from "@/lib/intelligence/client-scoring";
import { AlertTriangle, Clock, Calendar } from "lucide-react";

export function ClientRiskSection() {
  const { reservationData } = useReservation();
  const { financesData } = useFinances();
  const { productData } = useProduct();

  const atRisk = useMemo(() => {
    const profiles = computeClientProfiles(reservationData, financesData, productData);
    return profiles.filter((p) => p.loyaltyStatus === "en_riesgo");
  }, [reservationData, financesData, productData]);

  if (atRisk.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <h3 className="text-body font-semibold text-foreground flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-danger" />
          Clientes en riesgo ({atRisk.length})
        </h3>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-caption text-foreground-muted">
          Estos clientes solían ser frecuentes pero no han vuelto en un tiempo.
          Considera contactarlos.
        </p>
        {atRisk.slice(0, 10).map((client) => (
          <div
            key={client.customerName}
            className="flex items-center justify-between rounded-md border border-danger/20 bg-danger/5 p-3"
          >
            <div className="min-w-0">
              <p className="text-body-sm font-medium text-foreground truncate">
                {client.customerName}
              </p>
              <div className="flex items-center gap-3 text-caption text-foreground-muted">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Última visita: {client.lastVisitDate}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {client.daysSinceLastVisit} días sin volver
                </span>
              </div>
            </div>
            <Badge variant="danger">{client.visitCount} visitas previas</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
