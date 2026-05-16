import React from "react";
import { useFinances } from "@/hooks/useFinances";
import { useGlobalToast } from "@/context/ToastContext";
import {
  FinancesModalProps,
  Finances,
  FinancesTypeOptions,
} from "@/lib/finances/types";
import { useForm, SubmitHandler } from "react-hook-form";
import {
  FinancesInput,
  FinancesInputError,
  FinancesInputSelect,
} from "@/components/finances/FinancesInputs";
import { Modal, ModalHeader, ModalContent, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

export const FinancesModal = ({
  isOpen,
  handleOpenModal,
  isEmployee = false,
  employeeName = "",
  employees = [],
  currentUserName = "",
}: FinancesModalProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Finances>({
    defaultValues: {
      creator: employeeName,
    },
  });
  const { createFinance, loading } = useFinances();
  const { showToast } = useGlobalToast();

  const onSubmit: SubmitHandler<Finances> = async (data: Finances) => {
    data = { ...data, reservation_id: null };
    await createFinance(data);
    showToast("success", "Registro financiero creado correctamente.");
    handleOpenModal();
  };

  const ownerDisplayName = currentUserName;
  const otherEmployees = employees.filter(
    (emp) => emp.displayName !== ownerDisplayName
  );

  return (
    <Modal open={isOpen} onClose={handleOpenModal}>
      <ModalHeader onClose={handleOpenModal}>
        Crear registro financiero
      </ModalHeader>
      <ModalContent>
        <form
          id="finances-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-3"
        >
          <FinancesInput
            label="concept"
            register={register}
            required={true}
          />
          <FinancesInputError
            error={errors.concept}
            message="Indica un concepto"
          />
          <FinancesInput
            label="amount"
            register={register}
            required={true}
            type="number"
          />
          <FinancesInputError
            error={errors.amount}
            message="Indica un monto"
          />
          <FinancesInputSelect
            label="type"
            register={register}
            required={true}
            options={FinancesTypeOptions}
          />
          <FinancesInputError
            error={errors.type}
            message="Indica tipo de registro financiero"
          />
          {isEmployee ? (
            <input type="hidden" {...register("creator")} />
          ) : (
            <div className="flex flex-col gap-1">
              <label className="text-label font-semibold text-foreground-muted">
                Emisor <span className="text-danger">*</span>
              </label>
              <select
                {...register("creator", { required: true })}
                className="flex w-full appearance-none rounded-md bg-surface px-3 py-2 pr-10 text-body-sm text-foreground border border-input transition-colors duration-150 ease-snappy focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/25"
              >
                <option value="">Seleccionar emisor</option>
                {ownerDisplayName && (
                  <option value={ownerDisplayName}>
                    {ownerDisplayName} (Tú)
                  </option>
                )}
                {otherEmployees.map((emp) => (
                  <option key={emp.memberUserId} value={emp.displayName ?? ""}>
                    {emp.displayName ?? emp.email}
                  </option>
                ))}
              </select>
              {errors.creator && (
                <span className="text-caption text-danger font-medium mt-1">
                  Indica el emisor del registro
                </span>
              )}
            </div>
          )}
        </form>
      </ModalContent>
      <ModalFooter>
        <Button
          variant="ghost"
          onClick={handleOpenModal}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          form="finances-form"
          variant="primary"
          loading={loading}
        >
          Guardar
        </Button>
      </ModalFooter>
    </Modal>
  );
};
