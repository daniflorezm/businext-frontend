import { Reservation } from "@/lib/reservation/types";
import { Configuration } from "@/lib/configuration/types";

export const mapReservationFromApi = (data: Record<string, unknown>): Reservation => ({
  id: data.id as number | undefined,
  customerName: data.customer_name as string,
  inCharge: data.in_charge as string,
  reservationStartDate: data.reservation_start_date as string,
  reservationEndDate: data.reservation_end_date as string,
  timePerReservation: data.time_per_reservation as number,
  status: data.status as string,
  service: data.service as string,
});

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

export const mapConfigurationFromApi = (data: Record<string, unknown>): Configuration => ({
  id: data.id as number | undefined,
  businessName: data.business_name as string,
  staff: ((data.staff as string) || "").split(",").map((s) => s.trim()).filter(Boolean),
});

export const mapConfigurationToApi = (configuration: Configuration) => ({
  id: configuration.id,
  business_name: configuration.businessName,
  staff: Array.isArray(configuration.staff)
    ? configuration.staff.join(",")
    : configuration.staff,
});

export const routesWithoutHeader = [
  "/",
  "/login",
  "/login/verify",
  "/resetpassword",
  "/payment",
  "/paymentredirection",
];

export const authOnlyRoutes = ["/payment", "/paymentredirection"];

export const publicRoutes = [
  "/",
  "/login",
  "/login/verify",
  "/auth/confirm",
  "/resetpassword",
  "/error",
];
