import { DeleteModalProps } from "@/lib/reservation/types";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { Trash2, X } from "lucide-react";

export const DeleteModal = ({
  id,
  customerName,
  openDeleteModal,
  handleOpenDeleteModal,
  deleteReservation,
}: DeleteModalProps) => {
  const handleDelete = async () => {
    await deleteReservation(id);
    handleOpenDeleteModal();
  };
  
  return (
    <Dialog
      open={openDeleteModal}
      onClose={handleOpenDeleteModal}
      className="relative z-50"
    >
      <div className="fixed inset-0 flex w-screen items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <DialogPanel className="max-w-md w-full rounded-2xl shadow-2xl border border-border bg-card p-6 space-y-5 animate-fade-in-up">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-danger/10">
                <Trash2 className="w-5 h-5 text-danger" />
              </div>
              <DialogTitle className="text-xl font-bold text-foreground">
                Eliminar reserva
              </DialogTitle>
            </div>
            <button
              onClick={handleOpenDeleteModal}
              className="p-2 rounded-xl hover:bg-secondary text-muted-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <p className="text-muted-foreground">
            ¿Estás seguro que quieres eliminar la reserva para{" "}
            <span className="font-semibold text-primary">
              {customerName}
            </span>
            ? Esta acción no se puede deshacer.
          </p>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
            <button
              onClick={handleOpenDeleteModal}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-secondary text-foreground font-medium hover:bg-muted transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-danger text-white font-medium hover:bg-danger/90 transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};
