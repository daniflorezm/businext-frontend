import React from "react";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { FinancesDeleteModalProps } from "@/lib/finances/types";

export const DeleteFinancesRecordModal = ({
  concept,
  deleteFinanceRecord,
  handleOpenDeleteModal,
  id,
  openDeleteModal,
}: FinancesDeleteModalProps) => {
  const handleDelete = async () => {
    await deleteFinanceRecord(id);
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
