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
}: FinancesModalProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Finances>();
  const { createFinance, loading } = useFinances();
  const { showToast } = useGlobalToast();

  const onSubmit: SubmitHandler<Finances> = async (data: Finances) => {
    data = { ...data, reservation_id: null };
    await createFinance(data);
    showToast("success", "Registro financiero creado correctamente.");
    handleOpenModal();
  };

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
          <FinancesInput
            label="creator"
            register={register}
            required={true}
          />
          <FinancesInputError
            error={errors.creator}
            message="Indica el emisor del registro"
          />
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
