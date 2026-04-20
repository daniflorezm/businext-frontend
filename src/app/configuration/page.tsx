"use client";

import React, { useEffect, useState } from "react";
import { Building2, ShieldUser, Users, UserCircle, Trash2 } from "lucide-react";
import { useForm, SubmitHandler } from "react-hook-form";
import { SectionSkeleton } from "@/components/common/SkeletonLoader";
import { useConfiguration } from "@/hooks/useConfiguration";
import { useAccessContext } from "@/hooks/useAccessContext";
import { cancelUserSubscription } from "@/app/actions/cancelSubscription";
import { Configuration } from "@/lib/configuration/types";
import { Employee, InviteEmployeeInput } from "@/lib/employee/types";
import { ProductsSection } from "@/components/configuration/ProductsSection";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Toast, useToast } from "@/components/common/Toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const INITIAL_EMPLOYEE_FORM: InviteEmployeeInput = {
  displayName: "",
  email: "",
  phone: "",
  role: "employee",
};

type ConfirmState = {
  open: boolean;
  title: string;
  description?: string;
  destructive?: boolean;
  onConfirm: () => void;
};

export default function ConfigurationPage() {
  const { capabilities, context, loading: contextLoading } = useAccessContext();
  const isOwner = context?.role === "owner";
  const canManageConfig = isOwner;
  const canManageTeam = capabilities.canManageTeam;
  const canManageProducts = capabilities.canManageProducts;

  const { updateConfiguration, createConfiguration, configurationData, loading } =
    useConfiguration();

  const { register, handleSubmit, setValue } = useForm<Configuration>({
    defaultValues: { businessName: "" },
  });

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

  const loadEmployees = async () => {
    setEmployeesLoading(true);
    setEmployeeError("");
    try {
      const response = await fetch("/api/personal-management", {
        cache: "no-store",
      });
      if (response.status === 403) {
        setEmployees([]);
        return;
      }
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "No se pudo cargar el personal");
      }
      const data = (await response.json()) as Employee[];
      setEmployees(data);
    } catch (error) {
      setEmployeeError(
        error instanceof Error ? error.message : "No se pudo cargar el personal"
      );
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
    if (!contextLoading && canManageTeam) {
      loadEmployees();
    } else if (!contextLoading && !canManageTeam) {
      setEmployeesLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contextLoading, canManageTeam]);

  const handleCancelSubscription = () => {
    setConfirm({
      open: true,
      title: "¿Cancelar suscripción?",
      description:
        "Seguirás teniendo acceso hasta el final del periodo actual.",
      destructive: true,
      onConfirm: async () => {
        setConfirm((p) => ({ ...p, open: false }));
        try {
          await cancelUserSubscription();
          showToast(
            "success",
            "Suscripción cancelada. Seguirás teniendo acceso hasta el final del periodo actual."
          );
        } catch (err) {
          showToast(
            "error",
            "Error al cancelar la suscripción: " +
              (err instanceof Error ? err.message : "Intenta de nuevo")
          );
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
        setEmployees((prev) =>
          prev.filter((e) => e.memberUserId !== memberUserId)
        );
        setEmployeeError("");
        try {
          const response = await fetch(
            `/api/personal-management?memberUserId=${memberUserId}`,
            { method: "DELETE" }
          );
          if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data?.error || "No se pudo eliminar el empleado");
          }
        } catch (error) {
          setEmployees(snapshot);
          setEmployeeError(
            error instanceof Error
              ? error.message
              : "No se pudo eliminar el empleado"
          );
        }
      },
    });
  };

  const handleUpdateEmployee = async (
    memberUserId: string,
    field: "role" | "status",
    value: string
  ) => {
    const snapshot = employees;
    setEmployees((prev) =>
      prev.map((e) =>
        e.memberUserId === memberUserId ? { ...e, [field]: value } : e
      )
    );
    setUpdatingEmployeeId(memberUserId);
    setEmployeeError("");
    try {
      const response = await fetch(
        `/api/personal-management?memberUserId=${memberUserId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ [field]: value }),
        }
      );
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "No se pudo actualizar el empleado");
      }
      const updated = (await response.json()) as Employee;
      setEmployees((prev) =>
        prev.map((e) => (e.memberUserId === memberUserId ? updated : e))
      );
    } catch (error) {
      setEmployees(snapshot);
      setEmployeeError(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el empleado"
      );
    } finally {
      setUpdatingEmployeeId(null);
    }
  };

  const handleInviteEmployee = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
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
      if (!response.ok) {
        throw new Error(data.error || "No se pudo enviar la invitación");
      }
      setEmployees(data.employees ?? []);
      setEmployeeForm(INITIAL_EMPLOYEE_FORM);
      setEmployeeSuccess("Invitación enviada correctamente.");
    } catch (error) {
      setEmployeeError(
        error instanceof Error
          ? error.message
          : "No se pudo enviar la invitación"
      );
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

  return (
    <div className="flex flex-col w-full min-h-screen pt-16 pb-10 md:pt-10 px-2 sm:px-4 md:px-8 items-center gap-6">
      <div className="text-center">
        <h1 className="font-heading text-h1 font-bold text-foreground">
          Configuración de Negocio
        </h1>
        <p className="text-body text-foreground-muted mt-2 max-w-2xl">
          Configura los distintos apartados para aprovechar al máximo esta
          aplicación
        </p>
      </div>

      {/* -- Profile + Business (unified card) -- */}
      {contextLoading || loading ? (
        <SectionSkeleton />
      ) : (
        <Card className="w-full max-w-2xl md:max-w-3xl lg:max-w-4xl overflow-hidden">
          {/* Profile section */}
          <CardContent className="p-4 sm:p-6 md:p-8 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/15 rounded-lg">
                <UserCircle className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h2 className="font-heading text-h3 font-bold text-foreground">
                  Mi Perfil
                </h2>
                <p className="text-body-sm text-foreground-muted">
                  Datos de tu cuenta
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-caption font-semibold uppercase tracking-wide text-foreground-subtle">
                  Nombre
                </span>
                <span className="text-body font-medium text-foreground">
                  {context?.profile?.displayName || (
                    <span className="text-foreground-subtle italic">
                      Sin nombre
                    </span>
                  )}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-caption font-semibold uppercase tracking-wide text-foreground-subtle">
                  Correo
                </span>
                <span className="text-body font-medium text-foreground break-all">
                  {context?.profile?.email || (
                    <span className="text-foreground-subtle italic">
                      Sin correo
                    </span>
                  )}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-caption font-semibold uppercase tracking-wide text-foreground-subtle">
                  Teléfono
                </span>
                <span className="text-body font-medium text-foreground">
                  {context?.profile?.phone || (
                    <span className="text-foreground-subtle italic">
                      Sin teléfono
                    </span>
                  )}
                </span>
              </div>
            </div>
            <Badge
              variant={roleBadgeVariant(context?.role ?? "")}
              className="self-start"
            >
              {roleLabel(context?.role ?? "")}
            </Badge>
          </CardContent>

          {/* Divider */}
          <div className="border-t border-border-subtle" />

          {/* Business section */}
          {canManageConfig ? (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="p-4 sm:p-6 md:p-8 flex flex-col gap-5"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/15 rounded-lg">
                  <Building2 className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h2 className="font-heading text-h3 font-bold text-foreground">
                    Información del negocio
                  </h2>
                  <p className="text-body-sm text-foreground-muted">
                    Datos básicos de tu negocio
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-label font-semibold text-foreground-muted">
                  Nombre del negocio
                </label>
                <Input
                  {...register("businessName")}
                  placeholder="Nombre de tu negocio"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center pt-1">
                <Button type="submit" variant="primary" size="lg">
                  Guardar configuración
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
            <div className="p-4 sm:p-6 md:p-8 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/15 rounded-lg">
                  <Building2 className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h2 className="font-heading text-h3 font-bold text-foreground">
                    Información del negocio
                  </h2>
                  <p className="text-body-sm text-foreground-muted">
                    Datos básicos de tu negocio
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-caption font-semibold uppercase tracking-wide text-foreground-subtle">
                  Nombre del negocio
                </span>
                <span className="text-body font-medium text-foreground">
                  {configurationData[0]?.businessName || (
                    <span className="text-foreground-subtle italic">
                      Sin nombre
                    </span>
                  )}
                </span>
              </div>
              <div className="bg-warning/10 border border-warning/30 text-warning rounded-lg px-4 py-3 text-body-sm">
                Solo el owner puede modificar la configuración del negocio.
              </div>
            </div>
          )}
        </Card>
      )}

      {/* -- Products & Services -- */}
      {!contextLoading && canManageProducts && <ProductsSection />}

      {/* -- Personal Management -- */}
      {!contextLoading && canManageTeam && (
        <Card className="w-full max-w-2xl md:max-w-3xl lg:max-w-4xl">
          <CardContent className="p-4 sm:p-6 md:p-8 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/15 rounded-lg">
                <ShieldUser className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h2 className="font-heading text-h3 font-bold text-foreground">
                  Personal Management
                </h2>
                <p className="text-body-sm text-foreground-muted">
                  Invita empleados y controla quién puede acceder a tu negocio.
                </p>
              </div>
            </div>

            <form
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
              onSubmit={handleInviteEmployee}
            >
              <div className="flex flex-col gap-2">
                <label className="text-label font-semibold text-foreground-muted">
                  Nombre
                </label>
                <Input
                  value={employeeForm.displayName}
                  onChange={(e) =>
                    setEmployeeForm((c) => ({
                      ...c,
                      displayName: e.target.value,
                    }))
                  }
                  placeholder="Nombre del empleado"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-label font-semibold text-foreground-muted">
                  Email
                </label>
                <Input
                  type="email"
                  value={employeeForm.email}
                  onChange={(e) =>
                    setEmployeeForm((c) => ({ ...c, email: e.target.value }))
                  }
                  placeholder="empleado@negocio.com"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-label font-semibold text-foreground-muted">
                  Teléfono
                </label>
                <Input
                  value={employeeForm.phone}
                  onChange={(e) =>
                    setEmployeeForm((c) => ({ ...c, phone: e.target.value }))
                  }
                  placeholder="Teléfono del empleado"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-label font-semibold text-foreground-muted">
                  Rol
                </label>
                <Select
                  value={employeeForm.role}
                  onChange={(e) =>
                    setEmployeeForm((c) => ({
                      ...c,
                      role: e.target.value as InviteEmployeeInput["role"],
                    }))
                  }
                >
                  <option value="employee">Empleado</option>
                  <option value="manager">Manager</option>
                </Select>
              </div>

              <div className="md:col-span-2 flex flex-col gap-3">
                {employeeError && (
                  <div className="bg-danger/10 border border-danger/30 text-danger rounded-lg px-3 py-2 text-body-sm">
                    {employeeError}
                  </div>
                )}
                {employeeSuccess && (
                  <div className="bg-success/10 border border-success/30 text-success rounded-lg px-3 py-2 text-body-sm">
                    {employeeSuccess}
                  </div>
                )}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={sendingInvite}
                  className="w-full"
                >
                  Enviar invitación
                </Button>
              </div>
            </form>

            <div className="flex items-center gap-3 mt-2">
              <Users className="w-6 h-6 text-primary" />
              <h3 className="font-heading text-h4 font-bold text-foreground">
                Equipo invitado
              </h3>
            </div>

            {employeesLoading ? (
              <p className="text-body-sm text-foreground-muted">
                Cargando personal...
              </p>
            ) : employees.length === 0 ? (
              <p className="text-body-sm text-foreground-muted">
                Todavía no has invitado a ningún empleado.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {employees.map((employee) => (
                  <div
                    key={employee.memberUserId}
                    className="rounded-lg border border-border-subtle bg-surface-raised p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 transition-colors duration-150 hover:border-border"
                  >
                    <div>
                      <p className="font-semibold text-foreground">
                        {employee.displayName ||
                          employee.email ||
                          employee.memberUserId}
                      </p>
                      <p className="text-caption text-foreground-muted">
                        {employee.email}
                      </p>
                      <p className="text-caption text-foreground-muted">
                        {employee.phone}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-body-sm">
                      <Select
                        value={employee.role}
                        disabled={
                          updatingEmployeeId === employee.memberUserId
                        }
                        onChange={(e) =>
                          handleUpdateEmployee(
                            employee.memberUserId,
                            "role",
                            e.target.value
                          )
                        }
                        className="w-auto"
                      >
                        <option value="employee">Empleado</option>
                        <option value="manager">Manager</option>
                      </Select>
                      <Select
                        value={employee.status}
                        disabled={
                          updatingEmployeeId === employee.memberUserId ||
                          employee.status === "pending"
                        }
                        onChange={(e) =>
                          handleUpdateEmployee(
                            employee.memberUserId,
                            "status",
                            e.target.value
                          )
                        }
                        className="w-auto"
                        state={
                          employee.status === "active"
                            ? "default"
                            : employee.status === "inactive"
                            ? "error"
                            : "default"
                        }
                      >
                        {employee.status === "pending" && (
                          <option value="pending">Pendiente</option>
                        )}
                        <option value="active">Activo</option>
                        <option value="inactive">Inactivo</option>
                      </Select>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleDeleteEmployee(employee.memberUserId)
                        }
                        disabled={
                          updatingEmployeeId === employee.memberUserId
                        }
                        className="ml-auto text-danger hover:text-danger hover:bg-danger/10"
                      >
                        <Trash2 className="w-4 h-4" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
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

      {/* Toast notification */}
      <Toast
        open={toastState.open}
        type={toastState.type}
        message={toastState.message}
        onClose={closeToast}
      />
    </div>
  );
}
