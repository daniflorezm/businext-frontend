"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Reservation } from "@/lib/reservation/types";
import { Product } from "@/lib/product/types";
import { Employee } from "@/lib/employee/types";
import {
  Modal,
  ModalHeader,
  ModalContent,
  ModalFooter,
} from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import moment from "moment-timezone";

interface WalkInModalProps {
  open: boolean;
  onClose: () => void;
  services: Product[];
  isOwner: boolean;
  currentUserName: string;
  employees: Employee[];
  onSubmit: (reservation: Reservation) => Promise<void>;
}

interface WalkInFormData {
  customerName: string;
  service: string;
  inCharge: string;
}

const FIXED_DURATION = 30;

export function WalkInModal({
  open,
  onClose,
  services,
  isOwner,
  currentUserName,
  employees,
  onSubmit,
}: WalkInModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const serviceOptions = services.filter(
    (p) => p.type !== "producto"
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<WalkInFormData>({
    defaultValues: {
      customerName: "",
      service: "",
      inCharge: currentUserName,
    },
  });

  const handleFormSubmit = handleSubmit(async (data) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const now = moment();
      const reservation: Reservation = {
        customerName: data.customerName,
        inCharge: data.inCharge,
        reservationStartDate: now.format("YYYY-MM-DDTHH:mm:ss"),
        reservationEndDate: now
          .clone()
          .add(FIXED_DURATION, "m")
          .format("YYYY-MM-DDTHH:mm:ss"),
        timePerReservation: FIXED_DURATION,
        status: "COMPLETED",
        service: data.service,
      };
      await onSubmit(reservation);
      reset();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  });

  const handleClose = () => {
    if (isSubmitting) return;
    reset();
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <ModalHeader onClose={handleClose}>Atención inmediata</ModalHeader>
      <ModalContent>
        <p className="text-body-sm text-foreground-muted mb-4">
          Registra un cliente que llega sin reserva. Se creará como completada
          con el ingreso correspondiente.
        </p>
        <form
          id="walk-in-form"
          onSubmit={handleFormSubmit}
          className="space-y-4"
        >
          {/* Customer name */}
          <div className="space-y-1.5">
            <label className="text-caption text-foreground-muted">
              Nombre del cliente
            </label>
            <Input
              {...register("customerName", { required: true })}
              placeholder="Nombre del cliente"
              state={errors.customerName ? "error" : "default"}
              autoFocus
            />
            {errors.customerName && (
              <span className="text-caption text-danger">Campo requerido</span>
            )}
          </div>

          {/* Service */}
          <div className="space-y-1.5">
            <label className="text-caption text-foreground-muted">
              Servicio
            </label>
            <Select
              {...register("service", { required: true })}
            >
              <option value="">Seleccionar servicio</option>
              {serviceOptions.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name} — {s.price.toLocaleString("es-ES")}€
                </option>
              ))}
            </Select>
            {errors.service && (
              <span className="text-caption text-danger">Campo requerido</span>
            )}
          </div>

          {/* In charge */}
          <div className="space-y-1.5">
            <label className="text-caption text-foreground-muted">
              Encargado
            </label>
            {isOwner ? (
              <Select {...register("inCharge", { required: true })}>
                <option value="">Seleccionar encargado</option>
                <option value={currentUserName}>
                  {currentUserName} (Tú)
                </option>
                {employees.map((emp) => (
                  <option
                    key={emp.memberUserId}
                    value={emp.displayName ?? ""}
                  >
                    {emp.displayName ?? emp.email}
                  </option>
                ))}
              </Select>
            ) : (
              <Input
                value={currentUserName}
                readOnly
                className="bg-surface-raised text-foreground-muted"
              />
            )}
            {errors.inCharge && (
              <span className="text-caption text-danger">Campo requerido</span>
            )}
          </div>
        </form>
      </ModalContent>
      <ModalFooter>
        <Button variant="ghost" onClick={handleClose} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button
          type="submit"
          form="walk-in-form"
          variant="primary"
          loading={isSubmitting}
        >
          Registrar y completar
        </Button>
      </ModalFooter>
    </Modal>
  );
}
