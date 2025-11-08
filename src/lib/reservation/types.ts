import { UseFormRegister } from "react-hook-form";

export type Reservation = {
  [x: string]: any;
  id?: number;
  customerName: string;
  inCharge: string;
  reservationStartDate: string;
  reservationEndDate: string;
  timePerReservation: number;
  status: string;
  service: string;
};

export interface CalendarEvents {
  reservationData: Reservation[];
  apiCreateEvent: (newEvent: any) => Promise<Reservation>;
  loading?: boolean;
}

export type DeleteModalProps = {
  id: number;
  customerName: string;
  openDeleteModal: boolean;
  handleOpenDeleteModal: () => void;
  deleteReservation: (id: number) => Promise<void>;
};
export type CompleteReservationModalProps = {
  data: Reservation;
  openCompleteReservationModal: boolean;
  handleOpenCompleteReservationModal: () => void;
  updateReservation: (data: any) => Promise<Reservation>;
};

export type ReservationModalProps = {
  handleOpenModal: () => void;
  isOpen: boolean;
  operation: string;
  executeAction: (data: any) => Promise<Reservation>;
  reservationData?: Reservation;
  loading?: boolean;
};

export const PlaceHoldersReservationMapping = {
  id: "ID",
  customerName: "Nombre del cliente",
  inCharge: "Encargado",
  reservationStartDate: "Hora de reserva",
  timePerReservation: "Tiempo por reserva",
  status: "Estado",
  service: "Servicio",
} as const;

export type ReservationInputProps = {
  label: keyof typeof PlaceHoldersReservationMapping;
  register: UseFormRegister<Reservation>;
  required: boolean;
  disabled?: boolean;
  options?: { [key: string]: string };
  type?: string;
};

export const StatusOptions = {
  PENDING: "Pendiente",
  COMPLETED: "Completada",
};
