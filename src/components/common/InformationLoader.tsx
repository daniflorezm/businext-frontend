import React from "react";
import { Loader2 } from "lucide-react";

export default function InformationLoader() {
  return (
    <div className="w-full flex flex-col items-center justify-center py-16">
      <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
      <span className="text-foreground-muted font-semibold text-body">
        Cargando información...
      </span>
    </div>
  );
}
