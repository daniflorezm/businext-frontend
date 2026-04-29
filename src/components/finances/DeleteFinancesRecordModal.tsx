import React from "react";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useGlobalToast } from "@/context/ToastContext";
import { FinancesDeleteModalProps } from "@/lib/finances/types";

export const DeleteFinancesRecordModal = ({
  concept,
  deleteFinanceRecord,
  handleOpenDeleteModal,
  id,
  openDeleteModal,
}: FinancesDeleteModalProps) => {
  const { showToast } = useGlobalToast();
  const handleDelete = async () => {
    await deleteFinanceRecord(id);
    showToast("success", "Registro eliminado correctamente.");
    handleOpenDeleteModal();
  };

  return (
    <ConfirmDialog
      open={openDeleteModal}
      title="Eliminar registro"
      description={`¿Estás seguro que quieres eliminar el registro con concepto "${concept}"?`}
      confirmLabel="Eliminar"
      cancelLabel="Cancelar"
      destructive
      onConfirm={handleDelete}
      onCancel={handleOpenDeleteModal}
    />
  );
};
