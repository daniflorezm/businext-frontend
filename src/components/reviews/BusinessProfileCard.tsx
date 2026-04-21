"use client";

import {
  Star,
  MapPin,
  Phone,
  RefreshCw,
  Scissors,
  Sparkles,
  Dumbbell,
  Activity,
  Store,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { GoogleBusinessProfile } from "@/lib/google-reviews/types";

type BusinessProfileCardProps = {
  profile: GoogleBusinessProfile;
  onSync: () => Promise<unknown>;
  syncing: boolean;
};

const CATEGORY_MAP: Record<string, { icon: typeof Store; label: string; color: string }> = {
  barbería: { icon: Scissors, label: "Barbería", color: "bg-blue-500/20 text-blue-300" },
  barber: { icon: Scissors, label: "Barbería", color: "bg-blue-500/20 text-blue-300" },
  "clínica estética": { icon: Sparkles, label: "Clínica estética", color: "bg-pink-500/20 text-pink-300" },
  estética: { icon: Sparkles, label: "Clínica estética", color: "bg-pink-500/20 text-pink-300" },
  fisioterapia: { icon: Activity, label: "Fisioterapia", color: "bg-green-500/20 text-green-300" },
  gimnasio: { icon: Dumbbell, label: "Gimnasio", color: "bg-orange-500/20 text-orange-300" },
  gym: { icon: Dumbbell, label: "Gimnasio", color: "bg-orange-500/20 text-orange-300" },
};

function getCategoryInfo(category: string | null) {
  if (!category) return { icon: Store, label: "Negocio", color: "bg-primary/20 text-primary-foreground/80" };
  const lower = category.toLowerCase();
  for (const [key, val] of Object.entries(CATEGORY_MAP)) {
    if (lower.includes(key)) return val;
  }
  return { icon: Store, label: category, color: "bg-primary/20 text-primary-foreground/80" };
}

export function BusinessProfileCard({
  profile,
  onSync,
  syncing,
}: BusinessProfileCardProps) {
  const cat = getCategoryInfo(profile.category);
  const CategoryIcon = cat.icon;

  return (
    <Card>
      <CardContent className="p-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Left: Business info */}
          <div className="col-span-12 md:col-span-7 space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-h3 font-heading font-bold text-foreground">
                {profile.name || "Sin nombre"}
              </h2>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-caption font-medium rounded-full ${cat.color}`}>
                <CategoryIcon className="w-3.5 h-3.5" />
                {cat.label}
              </span>
            </div>

            <div className="space-y-2">
              {profile.address && (
                <div className="flex items-center gap-2 text-body-sm text-foreground-muted">
                  <MapPin className="w-4 h-4 flex-shrink-0 text-foreground-subtle" />
                  <span>{profile.address}</span>
                </div>
              )}
              {profile.phone && (
                <div className="flex items-center gap-2 text-body-sm text-foreground-muted">
                  <Phone className="w-4 h-4 flex-shrink-0 text-foreground-subtle" />
                  <span>{profile.phone}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-1">
              <Button
                variant="secondary"
                size="sm"
                onClick={onSync}
                loading={syncing}
                disabled={syncing}
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                Sincronizar
              </Button>
              {profile.lastSyncAt && (
                <span className="text-caption text-foreground-subtle">
                  Última sync:{" "}
                  {new Date(profile.lastSyncAt).toLocaleDateString("es", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              )}
            </div>
          </div>

          {/* Right: Big rating */}
          <div className="col-span-12 md:col-span-5 flex flex-col items-center justify-center md:border-l md:border-border-subtle md:pl-6">
            <div className="flex items-baseline gap-2">
              <span className="text-[3.5rem] font-heading font-bold leading-none text-foreground">
                {profile.rating?.toFixed(1) ?? "—"}
              </span>
              <Star className="w-8 h-8 text-[#F59E0B] fill-[#F59E0B] -mt-2" />
            </div>
            <div className="flex items-center gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-5 h-5 ${
                    s <= Math.round(profile.rating ?? 0)
                      ? "text-[#F59E0B] fill-[#F59E0B]"
                      : "text-foreground-muted/30"
                  }`}
                />
              ))}
            </div>
            <p className="text-body-sm text-foreground-muted mt-2">
              {profile.totalReviews} reseña{profile.totalReviews !== 1 ? "s" : ""} en Google
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
