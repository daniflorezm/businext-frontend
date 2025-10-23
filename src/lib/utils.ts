import { Reservation } from "@/lib/reservation/types";
import { Configuration } from "@/lib/configuration/types";

export const mapReservationFromApi = (data: any) => {
  return {
    id: data.id,
    customerName: data.customer_name,
    inCharge: data.in_charge,
    reservationStartDate: data.reservation_start_date,
    reservationEndDate: data.reservation_end_date,
    timePerReservation: data.time_per_reservation,
    status: data.status,
    service: data.service,
  };
};

export const mapReservationToApi = (reservation: Reservation) => {
  return {
    id: reservation.id,
    customer_name: reservation.customerName,
    in_charge: reservation.inCharge,
    reservation_start_date: reservation.reservationStartDate,
    reservation_end_date: reservation.reservationEndDate,
    time_per_reservation: reservation.timePerReservation,
    status: reservation.status,
    service: reservation.service,
  };
};

export const mapConfigurationFromApi = (data: any) => {
  return {
    id: data.id,
    businessName: data.business_name,
    staff: data.staff,
  };
};

export const mapConfigurationToApi = (configuration: Configuration) => {
  return {
    id: configuration.id,
    business_name: configuration.businessName,
    staff: configuration.staff,
  };
};

export const routesWithoutHeader = [
  "/",
  "/login",
  "/resetpassword",
  "/payment",
  "/paymentredirection",
];
