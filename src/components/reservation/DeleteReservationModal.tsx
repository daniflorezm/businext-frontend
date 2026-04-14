import { DeleteModalProps } from "@/lib/reservation/types";
import {
  Modal,
  ModalHeader,
  ModalContent,
  ModalFooter,
} from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

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
    <Modal open={openDeleteModal} onClose={handleOpenDeleteModal}>
      <ModalHeader onClose={handleOpenDeleteModal}>
        Eliminar reserva
      </ModalHeader>
      <ModalContent>
        <p className="text-body-sm text-foreground-muted">
          ¿Estás seguro que quieres eliminar la reserva para{" "}
          <span className="font-semibold text-foreground">{customerName}</span>?
        </p>
      </ModalContent>
      <ModalFooter>
        <Button variant="ghost" onClick={handleOpenDeleteModal}>
          Cancelar
        </Button>
        <Button variant="danger" onClick={handleDelete}>
          Eliminar
        </Button>
      </ModalFooter>
    </Modal>
  );
};
