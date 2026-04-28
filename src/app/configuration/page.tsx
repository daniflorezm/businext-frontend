"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Building2,
  ShieldUser,
  Users,
  UserCircle,
  Trash2,
  PackageSearch,
  Clock,
  Settings,
} from "lucide-react";
import { useForm, SubmitHandler } from "react-hook-form";
import { SectionSkeleton } from "@/components/common/SkeletonLoader";
import { useConfiguration } from "@/hooks/useConfiguration";
import { useAccessContext } from "@/hooks/useAccessContext";
import { useWorkingHours } from "@/hooks/useWorkingHours";
import { cancelUserSubscription } from "@/app/actions/cancelSubscription";
import { Configuration } from "@/lib/configuration/types";
import { Employee, InviteEmployeeInput } from "@/lib/employee/types";
import { ProductsSection } from "@/components/configuration/ProductsSection";
import { WorkingHoursEditor } from "@/components/configuration/WorkingHoursEditor";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Toast, useToast } from "@/components/common/Toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/* ────────────────────────────────────────────────── */
/*  Constants                                         */
/* ────────────────────────────────────────────────── */

const INITIAL_EMPLOYEE_FORM: InviteEmployeeInput = {
  displayName: "",
  email: "",
  phone: "",
  role: "employee",
};

type SectionId = "profile" | "business" | "products" | "hours" | "team";

type NavItem = {
  id: SectionId;
  label: string;
  icon: typeof Settings;
  ownerOnly?: boolean;
  cap?: "canManageProducts" | "canManageTeam";
};

const NAV_ITEMS: NavItem[] = [
  { id: "profile", label: "Mi perfil", icon: UserCircle },
  { id: "business", label: "Negocio", icon: Building2 },
  { id: "products", label: "Productos", icon: PackageSearch, cap: "canManageProducts" },
  { id: "hours", label: "Horario", icon: Clock, ownerOnly: true },
  { id: "team", label: "Equipo", icon: ShieldUser, cap: "canManageTeam" },
];

type ConfirmState = {
  open: boolean;
  title: string;
  description?: string;
  destructive?: boolean;
  onConfirm: () => void;
};

/* ────────────────────────────────────────────────── */
/*  Page                                              */
/* ────────────────────────────────────────────────── */

export default function ConfigurationPage() {
  const { capabilities, context, loading: contextLoading } = useAccessContext();
  const isOwner = context?.role === "owner";
  const canManageConfig = isOwner;
  const canManageTeam = capabilities.canManageTeam;

  const { updateConfiguration, createConfiguration, configurationData, loading } =
    useConfiguration();
  const { workingHoursData, loading: workingHoursLoading, updateWorkingHours } =
    useWorkingHours();

  const { register, handleSubmit, setValue } = useForm<Configuration>({
    defaultValues: { businessName: "" },
  });

  const [activeSection, setActiveSection] = useState<SectionId>("profile");

  // ── Employee state ──
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeesLoading, setEmployeesLoading] = useState(true);
  const [employeeForm, setEmployeeForm] = useState<InviteEmployeeInput>(INITIAL_EMPLOYEE_FORM);
  const [employeeError, setEmployeeError] = useState("");
  const [employeeSuccess, setEmployeeSuccess] = useState("");
  const [sendingInvite, setSendingInvite] = useState(false);
  const [updatingEmployeeId, setUpdatingEmployeeId] = useState<string | null>(null);

  const [confirm, setConfirm] = useState<ConfirmState>({
    open: false,
    title: "",
    onConfirm: () => {},
  });
  const { toastState, showToast, closeToast } = useToast();

  // ── Visible nav items based on role ──
  const visibleNav = useMemo(() => {
    return NAV_ITEMS.filter((item) => {
      if (item.ownerOnly && !isOwner) return false;
      if (item.cap && !capabilities[item.cap]) return false;
      return true;
    });
  }, [isOwner, capabilities]);

  // ── Configuration form ──
  const onSubmit: SubmitHandler<Configuration> = async (data) => {
    const result =
      configurationData.length > 0
        ? await updateConfiguration({
            id: configurationData[0].id,
            businessName: data.businessName,
          })
        : await createConfiguration({ businessName: data.businessName });

    if (result !== null) {
      showToast("success", "Configuración guardada correctamente.");
    } else {
      showToast("error", "No se pudo guardar la configuración. Intenta de nuevo.");
    }
  };

  // ── Employee handlers ──
  const loadEmployees = async () => {
    setEmployeesLoading(true);
    setEmployeeError("");
    try {
      const response = await fetch("/api/personal-management", { cache: "no-store" });
      if (response.status === 403) { setEmployees([]); return; }
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "No se pudo cargar el personal");
      }
      setEmployees((await response.json()) as Employee[]);
    } catch (error) {
      setEmployeeError(error instanceof Error ? error.message : "No se pudo cargar el personal");
    } finally {
      setEmployeesLoading(false);
    }
  };

  useEffect(() => {
    if (configurationData.length > 0) {
      setValue("businessName", configurationData[0].businessName || "");
    }
  }, [configurationData, setValue]);

  useEffect(() => {
    if (!contextLoading && canManageTeam) loadEmployees();
    else if (!contextLoading && !canManageTeam) setEmployeesLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contextLoading, canManageTeam]);

  const handleCancelSubscription = () => {
    setConfirm({
      open: true,
      title: "¿Cancelar suscripción?",
      description: "Seguirás teniendo acceso hasta el final del periodo actual.",
      destructive: true,
      onConfirm: async () => {
        setConfirm((p) => ({ ...p, open: false }));
        try {
          await cancelUserSubscription();
          showToast("success", "Suscripción cancelada. Seguirás teniendo acceso hasta el final del periodo actual.");
        } catch (err) {
          showToast("error", "Error al cancelar la suscripción: " + (err instanceof Error ? err.message : "Intenta de nuevo"));
        }
      },
    });
  };

  const handleDeleteEmployee = (memberUserId: string) => {
    const snapshot = employees;
    setConfirm({
      open: true,
      title: "¿Eliminar empleado?",
      description: "Esta acción no se puede deshacer.",
      destructive: true,
      onConfirm: async () => {
        setConfirm((p) => ({ ...p, open: false }));
        setEmployees((prev) => prev.filter((e) => e.memberUserId !== memberUserId));
        setEmployeeError("");
        try {
          const response = await fetch(`/api/personal-management?memberUserId=${memberUserId}`, { method: "DELETE" });
          if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data?.error || "No se pudo eliminar el empleado");
          }
        } catch (error) {
          setEmployees(snapshot);
          setEmployeeError(error instanceof Error ? error.message : "No se pudo eliminar el empleado");
        }
      },
    });
  };

  const handleUpdateEmployee = async (memberUserId: string, field: "role" | "status", value: string) => {
    const snapshot = employees;
    setEmployees((prev) => prev.map((e) => (e.memberUserId === memberUserId ? { ...e, [field]: value } : e)));
    setUpdatingEmployeeId(memberUserId);
    setEmployeeError("");
    try {
      const response = await fetch(`/api/personal-management?memberUserId=${memberUserId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "No se pudo actualizar el empleado");
      }
      const updated = (await response.json()) as Employee;
      setEmployees((prev) => prev.map((e) => (e.memberUserId === memberUserId ? updated : e)));
    } catch (error) {
      setEmployees(snapshot);
      setEmployeeError(error instanceof Error ? error.message : "No se pudo actualizar el empleado");
    } finally {
      setUpdatingEmployeeId(null);
    }
  };

  const handleInviteEmployee = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSendingInvite(true);
    setEmployeeError("");
    setEmployeeSuccess("");
    try {
      const response = await fetch("/api/personal-management", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(employeeForm),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo enviar la invitación");
      setEmployees(data.employees ?? []);
      setEmployeeForm(INITIAL_EMPLOYEE_FORM);
      setEmployeeSuccess("Invitación enviada correctamente.");
    } catch (error) {
      setEmployeeError(error instanceof Error ? error.message : "No se pudo enviar la invitación");
    } finally {
      setSendingInvite(false);
    }
  };

  const roleBadgeVariant = (role: string) => {
    if (role === "owner") return "secondary" as const;
    if (role === "manager") return "primary" as const;
    return "muted" as const;
  };

  const roleLabel = (role: string) => {
    if (role === "owner") return "Owner";
    if (role === "manager") return "Manager";
    return "Empleado";
  };

  /* ──────────────────────────────────────────────── */
  /*  Render                                          */
  /* ──────────────────────────────────────────────── */

  return (
    <div className="min-h-screen w-full bg-background pt-14 md:pt-0">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-6 space-y-6">
        {/* Page header */}
        <div>
          <h1 className="font-heading text-h2 font-bold text-foreground">
            Configuración
          </h1>
          <p className="text-body text-foreground-muted mt-1">
            Gestiona tu perfil, negocio, productos, horarios y equipo.
          </p>
        </div>

        {contextLoading || loading ? (
          <SectionSkeleton />
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* ── Left navigation ── */}
            <nav className="lg:w-56 flex-shrink-0">
              {/* Mobile: horizontal scroll */}
              <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
                {visibleNav.map((item) => {
                  const Icon = item.icon;
                  const active = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveSection(item.id)}
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-2.5 rounded-md text-body-sm font-medium transition-colors duration-150 whitespace-nowrap",
                        active
                          ? "bg-primary/10 text-primary"
                          : "text-foreground-muted hover:text-foreground hover:bg-surface-raised/60"
                      )}
                    >
                      <Icon className="w-4.5 h-4.5 flex-shrink-0" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </nav>

            {/* ── Right content area ── */}
            <div className="flex-1 min-w-0">
              {/* ═══ Profile ═══ */}
              {activeSection === "profile" && (
                <Card>
                  <CardContent className="p-5 sm:p-6 md:p-8 space-y-5">
                    <SectionHeader
                      icon={UserCircle}
                      title="Mi Perfil"
                      description="Datos de tu cuenta"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                      <ProfileField
                        label="Nombre"
                        value={context?.profile?.displayName}
                        fallback="Sin nombre"
                      />
                      <ProfileField
                        label="Correo"
                        value={context?.profile?.email}
                        fallback="Sin correo"
                        breakAll
                      />
                      <ProfileField
                        label="Teléfono"
                        value={context?.profile?.phone}
                        fallback="Sin teléfono"
                      />
                    </div>
                    <Badge
                      variant={roleBadgeVariant(context?.role ?? "")}
                      className="self-start"
                    >
                      {roleLabel(context?.role ?? "")}
                    </Badge>
                  </CardContent>
                </Card>
              )}

              {/* ═══ Business ═══ */}
              {activeSection === "business" && (
                <Card>
                  <CardContent className="p-5 sm:p-6 md:p-8 space-y-5">
                    <SectionHeader
                      icon={Building2}
                      title="Información del negocio"
                      description="Datos básicos de tu negocio"
                    />
                    {canManageConfig ? (
                      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div className="space-y-1.5">
                          <label className="text-label font-semibold text-foreground-muted">
                            Nombre del negocio
                          </label>
                          <Input
                            {...register("businessName")}
                            placeholder="Nombre de tu negocio"
                          />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                          <Button type="submit" variant="primary">
                            Guardar
                          </Button>
                          <button
                            type="button"
                            onClick={handleCancelSubscription}
                            className="text-danger text-body-sm hover:underline transition-colors duration-150"
                          >
                            Cancelar suscripción
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="space-y-4">
                        <ProfileField
                          label="Nombre del negocio"
                          value={configurationData[0]?.businessName}
                          fallback="Sin nombre"
                        />
                        <div className="bg-warning/10 border border-warning/30 text-warning rounded-md px-4 py-3 text-body-sm">
                          Solo el owner puede modificar la configuración del negocio.
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* ═══ Products ═══ */}
              {activeSection === "products" && <ProductsSection />}

              {/* ═══ Working Hours ═══ */}
              {activeSection === "hours" && (
                <WorkingHoursEditor
                  workingHoursData={workingHoursData}
                  loading={workingHoursLoading}
                  onSave={updateWorkingHours}
                />
              )}

              {/* ═══ Team ═══ */}
              {activeSection === "team" && (
                <Card>
                  <CardContent className="p-5 sm:p-6 md:p-8 space-y-6">
                    <SectionHeader
                      icon={ShieldUser}
                      title="Gestión de equipo"
                      description="Invita empleados y controla quién puede acceder a tu negocio."
                    />

                    {/* Invite form */}
                    <form
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                      onSubmit={handleInviteEmployee}
                    >
                      <div className="space-y-1.5">
                        <label className="text-label font-semibold text-foreground-muted">
                          Nombre
                        </label>
                        <Input
                          value={employeeForm.displayName}
                          onChange={(e) => setEmployeeForm((c) => ({ ...c, displayName: e.target.value }))}
                          placeholder="Nombre del empleado"
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-label font-semibold text-foreground-muted">
                          Email
                        </label>
                        <Input
                          type="email"
                          value={employeeForm.email}
                          onChange={(e) => setEmployeeForm((c) => ({ ...c, email: e.target.value }))}
                          placeholder="empleado@negocio.com"
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-label font-semibold text-foreground-muted">
                          Teléfono
                        </label>
                        <Input
                          value={employeeForm.phone}
                          onChange={(e) => setEmployeeForm((c) => ({ ...c, phone: e.target.value }))}
                          placeholder="Teléfono del empleado"
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-label font-semibold text-foreground-muted">
                          Rol
                        </label>
                        <Select
                          value={employeeForm.role}
                          onChange={(e) => setEmployeeForm((c) => ({ ...c, role: e.target.value as InviteEmployeeInput["role"] }))}
                        >
                          <option value="employee">Empleado</option>
                          <option value="manager">Manager</option>
                        </Select>
                      </div>
                      <div className="md:col-span-2 space-y-3">
                        {employeeError && (
                          <div className="bg-danger/10 border border-danger/30 text-danger rounded-md px-3 py-2 text-body-sm">
                            {employeeError}
                          </div>
                        )}
                        {employeeSuccess && (
                          <div className="bg-success/10 border border-success/30 text-success rounded-md px-3 py-2 text-body-sm">
                            {employeeSuccess}
                          </div>
                        )}
                        <Button type="submit" variant="primary" loading={sendingInvite} className="w-full">
                          Enviar invitación
                        </Button>
                      </div>
                    </form>

                    {/* Divider */}
                    <div className="border-t border-border-subtle" />

                    {/* Employee list */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" />
                        <h3 className="font-heading text-body font-semibold text-foreground">
                          Equipo invitado
                        </h3>
                        {employees.length > 0 && (
                          <Badge variant="muted">{employees.length}</Badge>
                        )}
                      </div>

                      {employeesLoading ? (
                        <p className="text-body-sm text-foreground-muted">Cargando personal...</p>
                      ) : employees.length === 0 ? (
                        <p className="text-body-sm text-foreground-muted">
                          Todavía no has invitado a ningún empleado.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {employees.map((employee) => (
                            <div
                              key={employee.memberUserId}
                              className="rounded-md border border-border-subtle bg-surface-raised/40 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 transition-colors duration-150 hover:border-border"
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/15 text-primary text-[11px] font-bold flex-shrink-0">
                                  {(employee.displayName || employee.email || "?")
                                    .split(" ")
                                    .map((w) => w[0])
                                    .join("")
                                    .slice(0, 2)
                                    .toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-semibold text-foreground text-body-sm">
                                    {employee.displayName || employee.email || employee.memberUserId}
                                  </p>
                                  <p className="text-caption text-foreground-muted">
                                    {employee.email}
                                    {employee.phone && ` · ${employee.phone}`}
                                  </p>
                                </div>
                              </div>
                              <div className="flex flex-wrap items-center gap-2 text-body-sm">
                                <Select
                                  value={employee.role}
                                  disabled={updatingEmployeeId === employee.memberUserId}
                                  onChange={(e) => handleUpdateEmployee(employee.memberUserId, "role", e.target.value)}
                                  className="w-auto"
                                >
                                  <option value="employee">Empleado</option>
                                  <option value="manager">Manager</option>
                                </Select>
                                <Select
                                  value={employee.status}
                                  disabled={updatingEmployeeId === employee.memberUserId || employee.status === "pending"}
                                  onChange={(e) => handleUpdateEmployee(employee.memberUserId, "status", e.target.value)}
                                  className="w-auto"
                                  state={employee.status === "inactive" ? "error" : "default"}
                                >
                                  {employee.status === "pending" && <option value="pending">Pendiente</option>}
                                  <option value="active">Activo</option>
                                  <option value="inactive">Inactivo</option>
                                </Select>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteEmployee(employee.memberUserId)}
                                  disabled={updatingEmployeeId === employee.memberUserId}
                                  className="ml-auto text-danger hover:text-danger hover:bg-danger/10"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Confirm dialog */}
        <ConfirmDialog
          open={confirm.open}
          title={confirm.title}
          description={confirm.description}
          destructive={confirm.destructive}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm((p) => ({ ...p, open: false }))}
        />
        <Toast open={toastState.open} type={toastState.type} message={toastState.message} onClose={closeToast} />
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────── */
/*  Sub-components                                    */
/* ────────────────────────────────────────────────── */

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Settings;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="p-2.5 bg-primary/10 rounded-md">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div>
        <h2 className="font-heading text-h4 font-semibold text-foreground">
          {title}
        </h2>
        <p className="text-body-sm text-foreground-muted">{description}</p>
      </div>
    </div>
  );
}

function ProfileField({
  label,
  value,
  fallback,
  breakAll,
}: {
  label: string;
  value?: string | null;
  fallback: string;
  breakAll?: boolean;
}) {
  return (
    <div className="space-y-1">
      <span className="text-caption font-semibold uppercase tracking-wide text-foreground-subtle">
        {label}
      </span>
      <span className={cn("text-body font-medium text-foreground block", breakAll && "break-all")}>
        {value || <span className="text-foreground-subtle italic">{fallback}</span>}
      </span>
    </div>
  );
}
