import { DeleteModalProps } from "@/lib/reservation/types";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";

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
    <>
      <Dialog
        open={openDeleteModal}
        onClose={handleOpenDeleteModal}
        className="relative z-50"
      >
        <div className="fixed inset-0 flex w-screen items-center justify-center bg-black/30 p-4">
          <DialogPanel className="max-w-md w-full rounded-2xl shadow-2xl border border-gray-200 bg-white px-6 py-8 md:px-12 md:py-10 space-y-6 animate-fade-in">
            <DialogTitle className="text-xl font-bold text-gray-900 mb-2">
              Eliminar reserva
            </DialogTitle>
            <p className="text-gray-700 text-base mb-4">
              ¿Estás seguro que quieres eliminar la reserva para{" "}
              <span className="font-semibold text-blue-600">
                {customerName}
              </span>
              ?
            </p>
            <div className="flex flex-col-reverse md:flex-row gap-3 md:gap-4 justify-end">
              <button
                onClick={handleOpenDeleteModal}
                className="w-full md:w-auto px-5 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 font-semibold hover:bg-gray-100 transition shadow-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="w-full md:w-auto px-5 py-2 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold shadow-md hover:from-red-600 hover:to-pink-600 transition border-0"
              >
                Eliminar
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
};
