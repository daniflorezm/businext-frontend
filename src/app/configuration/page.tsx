"use client";

import React, { useEffect, useState } from "react";
import { Building2, ShieldUser, Users, UserCircle } from "lucide-react";
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

  // Employees — start as loading=true to avoid a flash of "no employees" text
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

  // ── Config form submission ──────────────────────────────────────────────────
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

  // ── Employee data loading ──────────────────────────────────────────────────
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

  // Sync config data into form once loaded
  useEffect(() => {
    if (configurationData.length > 0) {
      setValue("businessName", configurationData[0].businessName || "");
    }
  }, [configurationData, setValue]);

  // Fetch employees only once we know the user has permission — avoids an
  // unnecessary /api/personal-management call for employees/managers without
  // the canManageTeam capability.
  useEffect(() => {
    if (!contextLoading && canManageTeam) {
      loadEmployees();
    } else if (!contextLoading && !canManageTeam) {
      setEmployeesLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contextLoading, canManageTeam]);

  // ── Handlers ───────────────────────────────────────────────────────────────
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
    // Capture snapshot at dialog-open time for rollback
    const snapshot = employees;
    setConfirm({
      open: true,
      title: "¿Eliminar empleado?",
      description: "Esta acción no se puede deshacer.",
      destructive: true,
      onConfirm: async () => {
        setConfirm((p) => ({ ...p, open: false }));
        // Optimistic remove
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
          setEmployees(snapshot); // rollback
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
    // Capture snapshot for rollback
    const snapshot = employees;
    // Optimistic update
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
      setEmployees(snapshot); // rollback
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

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col w-full min-h-screen pt-16 pb-10 md:pt-10 px-2 sm:px-4 md:px-8 items-center gap-6">
      <h1 className="text-3xl md:text-4xl font-extrabold text-center drop-shadow-sm">
        Configuración de Negocio
      </h1>
      <p className="text-gray-500 text-lg md:text-2xl text-center max-w-2xl">
        Configura los distintos apartados para aprovechar al máximo esta
        aplicación
      </p>

      {/* ── Perfil + Negocio (card unificado) ── */}
      {contextLoading || loading ? (
        <SectionSkeleton />
      ) : (
        <div className="w-full max-w-2xl md:max-w-3xl lg:max-w-4xl bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">

          {/* — Sección Perfil — */}
          <div className="p-4 sm:p-6 md:p-8 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <UserCircle className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Mi Perfil</h2>
                <p className="text-gray-500">Datos de tu cuenta</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Nombre
                </span>
                <span className="text-base font-medium">
                  {context?.profile?.displayName || (
                    <span className="text-gray-400 italic">Sin nombre</span>
                  )}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Correo
                </span>
                <span className="text-base font-medium break-all">
                  {context?.profile?.email || (
                    <span className="text-gray-400 italic">Sin correo</span>
                  )}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Teléfono
                </span>
                <span className="text-base font-medium">
                  {context?.profile?.phone || (
                    <span className="text-gray-400 italic">Sin teléfono</span>
                  )}
                </span>
              </div>
            </div>
            <span
              className={`inline-flex self-start items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                context?.role === "owner"
                  ? "bg-purple-100 text-purple-700"
                  : context?.role === "manager"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {context?.role === "owner"
                ? "Owner"
                : context?.role === "manager"
                ? "Manager"
                : "Empleado"}
            </span>
          </div>

          {/* — Divisor — */}
          <div className="border-t border-gray-200" />

          {/* — Sección Negocio — */}
          {canManageConfig ? (
            /* Owner: formulario editable */
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="p-4 sm:p-6 md:p-8 flex flex-col gap-5"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Building2 className="w-7 h-7 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Información del negocio</h2>
                  <p className="text-gray-500">Datos básicos de tu negocio</p>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">
                  Nombre del negocio
                </label>
                <input
                  {...register("businessName")}
                  className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  placeholder="Nombre de tu negocio"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center pt-1">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition text-base"
                >
                  Guardar configuración
                </button>
                <button
                  type="button"
                  onClick={handleCancelSubscription}
                  className="text-red-500 hover:underline text-base"
                >
                  Cancelar suscripción
                </button>
              </div>
            </form>
          ) : (
            /* Manager / empleado: solo lectura */
            <div className="p-4 sm:p-6 md:p-8 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Building2 className="w-7 h-7 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Información del negocio</h2>
                  <p className="text-gray-500">Datos básicos de tu negocio</p>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Nombre del negocio
                </span>
                <span className="text-base font-medium">
                  {configurationData[0]?.businessName || (
                    <span className="text-gray-400 italic">Sin nombre</span>
                  )}
                </span>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl px-4 py-3 text-sm">
                Solo el owner puede modificar la configuración del negocio.
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Productos y Servicios — rendered only after context is known ── */}
      {!contextLoading && canManageProducts && <ProductsSection />}

      {/* ── Personal Management — rendered only after context is known ── */}
      {!contextLoading && canManageTeam && (
        <div className="w-full max-w-2xl md:max-w-3xl lg:max-w-4xl p-4 sm:p-6 md:p-8 bg-white rounded-2xl shadow-lg border border-gray-200 flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-xl">
              <ShieldUser className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Personal Management</h2>
              <p className="text-gray-500">
                Invita empleados y controla quién puede acceder a tu negocio.
              </p>
            </div>
          </div>

          <form
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            onSubmit={handleInviteEmployee}
          >
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">Nombre</label>
              <input
                value={employeeForm.displayName}
                onChange={(e) =>
                  setEmployeeForm((c) => ({ ...c, displayName: e.target.value }))
                }
                className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                placeholder="Nombre del empleado"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">Email</label>
              <input
                type="email"
                value={employeeForm.email}
                onChange={(e) =>
                  setEmployeeForm((c) => ({ ...c, email: e.target.value }))
                }
                className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                placeholder="empleado@negocio.com"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">Teléfono</label>
              <input
                value={employeeForm.phone}
                onChange={(e) =>
                  setEmployeeForm((c) => ({ ...c, phone: e.target.value }))
                }
                className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                placeholder="Teléfono del empleado"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">Rol</label>
              <select
                value={employeeForm.role}
                onChange={(e) =>
                  setEmployeeForm((c) => ({
                    ...c,
                    role: e.target.value as InviteEmployeeInput["role"],
                  }))
                }
                className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              >
                <option value="employee">Empleado</option>
                <option value="manager">Manager</option>
              </select>
            </div>

            <div className="md:col-span-2 flex flex-col gap-3">
              {employeeError && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-3 py-2 text-sm">
                  {employeeError}
                </div>
              )}
              {employeeSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-3 py-2 text-sm">
                  {employeeSuccess}
                </div>
              )}
              <button
                type="submit"
                disabled={sendingInvite}
                className="w-full px-6 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition text-lg disabled:opacity-60"
              >
                {sendingInvite ? "Enviando invitación..." : "Enviar invitación"}
              </button>
            </div>
          </form>

          <div className="flex items-center gap-3 mt-2">
            <Users className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-bold">Equipo invitado</h3>
          </div>

          {employeesLoading ? (
            <p className="text-gray-500">Cargando personal...</p>
          ) : employees.length === 0 ? (
            <p className="text-gray-500">
              Todavía no has invitado a ningún empleado.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {employees.map((employee) => (
                <div
                  key={employee.memberUserId}
                  className="rounded-xl border border-gray-200 bg-gray-50 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                >
                  <div>
                    <p className="font-semibold">
                      {employee.displayName ||
                        employee.email ||
                        employee.memberUserId}
                    </p>
                    <p className="text-sm text-gray-500">{employee.email}</p>
                    <p className="text-sm text-gray-500">{employee.phone}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <select
                      value={employee.role}
                      disabled={updatingEmployeeId === employee.memberUserId}
                      onChange={(e) =>
                        handleUpdateEmployee(
                          employee.memberUserId,
                          "role",
                          e.target.value
                        )
                      }
                      className="px-3 py-1.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="employee">Empleado</option>
                      <option value="manager">Manager</option>
                    </select>
                    <select
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
                      className={`px-3 py-1.5 rounded-lg border focus:outline-none focus:ring-2 ${
                        employee.status === "active"
                          ? "border-green-300 text-green-700 focus:ring-green-300"
                          : employee.status === "inactive"
                          ? "border-red-300 text-red-600 focus:ring-red-300"
                          : "border-gray-300 text-gray-500"
                      }`}
                    >
                      {employee.status === "pending" && (
                        <option value="pending">Pendiente</option>
                      )}
                      <option value="active">Activo</option>
                      <option value="inactive">Inactivo</option>
                    </select>
                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteEmployee(employee.memberUserId)
                      }
                      disabled={updatingEmployeeId === employee.memberUserId}
                      className="ml-auto text-red-500 hover:underline disabled:opacity-50 text-sm"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Confirm dialog ── */}
      <ConfirmDialog
        open={confirm.open}
        title={confirm.title}
        description={confirm.description}
        destructive={confirm.destructive}
        onConfirm={confirm.onConfirm}
        onCancel={() => setConfirm((p) => ({ ...p, open: false }))}
      />

      {/* ── Toast notification ── */}
      <Toast
        open={toastState.open}
        type={toastState.type}
        message={toastState.message}
        onClose={closeToast}
      />
    </div>
  );
}
