"use client";
import useSWR from "swr";
import { Reservation } from "@/lib/reservation/types";
import { fetcher } from "@/lib/fetcher";
import { mapReservationFromApi, mapReservationToApi } from "@/lib/utils";

const SWR_KEY = "/api/reservations?offset=0&limit=100";

const reservationFetcher = (url: string) =>
  fetcher<Record<string, unknown>[]>(url).then((data) =>
    data.map(mapReservationFromApi)
  );

export function useReservation() {
  const {
    data: reservationData = [],
    isLoading: loading,
    error,
    mutate,
  } = useSWR<Reservation[]>(SWR_KEY, reservationFetcher);

  const getAllReservations = () => mutate();

  const createReservation = async (
    newReservation: Omit<Reservation, "id">
  ): Promise<Reservation | null> => {
    try {
      const response = await fetch("api/reservations", {
        method: "POST",
        body: JSON.stringify(mapReservationToApi(newReservation as Reservation)),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to create reservation");
      const data = await response.json();
      await mutate();
      return mapReservationFromApi(data);
    } catch {
      return null;
    }
  };

  const deleteReservation = async (id: number) => {
    try {
      const response = await fetch(`api/reservations?id=${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to delete reservation");
      await mutate();
      return response.json();
    } catch {
      return null;
    }
  };

  const updateReservation = async (
    reservation: Reservation
  ): Promise<Reservation | null> => {
    try {
      const { id, ...updateData } = mapReservationToApi(reservation);
      const response = await fetch(`api/reservations?id=${id}`, {
        method: "PATCH",
        body: JSON.stringify(updateData),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to update reservation");
      await mutate();
      return response.json();
    } catch {
      return null;
    }
  };

  return {
    reservationData,
    loading,
    error,
    getAllReservations,
    createReservation,
    deleteReservation,
    updateReservation,
  };
}
