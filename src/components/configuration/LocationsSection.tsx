"use client";

import React, { useState } from "react";
import { MapPin, Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import { useLocations } from "@/hooks/useLocations";
import { LocationCreate, LocationData } from "@/lib/location/types";
import { useGlobalToast } from "@/context/ToastContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";

const EMPTY_FORM: LocationCreate = {
  name: "",
  address: "",
  phone: "",
  maps_link: "",
};

export function LocationsSection() {
  const { locations, loading, createLocation, updateLocation, deleteLocation } =
    useLocations();
  const { showToast } = useGlobalToast();

  const [form, setForm] = useState<LocationCreate>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState<{
    open: boolean;
    locationId: number | null;
  }>({ open: false, locationId: null });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);

    if (editingId !== null) {
      const result = await updateLocation(editingId, form);
      if (result) {
        showToast("success", "Local actualizado correctamente.");
        resetForm();
      } else {
        showToast("error", "No se pudo actualizar el local.");
      }
    } else {
      const result = await createLocation(form);
      if (result) {
        showToast("success", "Local creado correctamente.");
        resetForm();
      } else {
        showToast("error", "No se pudo crear el local.");
      }
    }
    setSaving(false);
  };

  const handleEdit = (loc: LocationData) => {
    setForm({
      name: loc.name,
      address: loc.address ?? "",
      phone: loc.phone ?? "",
      maps_link: loc.maps_link ?? "",
    });
    setEditingId(loc.id);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (confirm.locationId === null) return;
    const ok = await deleteLocation(confirm.locationId);
    setConfirm({ open: false, locationId: null });
    if (ok) {
      showToast("success", "Local eliminado.");
    } else {
      showToast(
        "error",
        "No se pudo eliminar el local. Asegúrate de que no sea el último activo.",
      );
    }
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <p className="text-body-sm text-foreground-muted">Cargando locales...</p>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          <h3 className="font-heading text-body font-semibold text-foreground">
            Locales
          </h3>
          {locations.length > 0 && (
            <Badge variant="muted">{locations.length}</Badge>
          )}
        </div>
        {!showForm && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
          >
            <Plus className="w-4 h-4 mr-1" />
            Añadir local
          </Button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-label font-semibold text-foreground-muted">
                    Nombre del local *
                  </label>
                  <Input
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    placeholder="Sede Centro"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-label font-semibold text-foreground-muted">
                    Teléfono
                  </label>
                  <Input
                    value={form.phone ?? ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, phone: e.target.value }))
                    }
                    placeholder="+34 612 345 678"
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-label font-semibold text-foreground-muted">
                    Dirección
                  </label>
                  <Input
                    value={form.address ?? ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, address: e.target.value }))
                    }
                    placeholder="Calle Mayor 1, Madrid"
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-label font-semibold text-foreground-muted">
                    Google Maps link
                  </label>
                  <Input
                    value={form.maps_link ?? ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, maps_link: e.target.value }))
                    }
                    placeholder="https://maps.google.com/..."
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" variant="primary" loading={saving}>
                  {editingId !== null ? "Guardar cambios" : "Crear local"}
                </Button>
                <Button type="button" variant="ghost" onClick={resetForm}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Location list */}
      {locations.length === 0 && !showForm ? (
        <p className="text-body-sm text-foreground-muted">
          No tienes locales registrados. Añade uno para empezar.
        </p>
      ) : (
        <div className="space-y-2">
          {locations.map((loc) => (
            <div
              key={loc.id}
              className="rounded-md border border-border-subtle bg-surface-raised/40 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 transition-colors duration-150 hover:border-border"
            >
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/15 text-primary flex-shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-body-sm">
                    {loc.name}
                  </p>
                  {loc.address && (
                    <p className="text-caption text-foreground-muted">
                      {loc.address}
                    </p>
                  )}
                  {loc.phone && (
                    <p className="text-caption text-foreground-muted">
                      {loc.phone}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {loc.maps_link && (
                  <a
                    href={loc.maps_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(loc)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setConfirm({ open: true, locationId: loc.id })
                  }
                  className="text-danger hover:text-danger hover:bg-danger/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={confirm.open}
        title="¿Eliminar local?"
        description="Esta acción no se puede deshacer. Los empleados asignados a este local se quedarán sin local."
        destructive
        onConfirm={handleDelete}
        onCancel={() => setConfirm({ open: false, locationId: null })}
      />
    </div>
  );
}
