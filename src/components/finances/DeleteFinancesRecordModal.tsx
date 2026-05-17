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
    try {
      await deleteFinanceRecord(id);
      showToast("success", "Registro eliminado correctamente.");
      handleOpenDeleteModal();
    } catch (err) {
      if (err instanceof Error && err.message === "LINKED_TO_RESERVATION") {
        showToast(
          "error",
          "Este registro está vinculado a una reserva. Reviértela primero desde la sección de reservas."
        );
      } else {
        showToast("error", "Error al eliminar el registro.");
      }
      handleOpenDeleteModal();
    }
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
