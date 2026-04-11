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
    const tempId = -Date.now();
    const optimisticItem: Reservation = { ...(newReservation as Reservation), id: tempId };
    try {
      await mutate(
        async (current: Reservation[] = []) => {
          const response = await fetch("/api/reservations", {
            method: "POST",
            body: JSON.stringify(mapReservationToApi(newReservation as Reservation)),
            headers: { "Content-Type": "application/json" },
          });
          if (!response.ok) throw new Error("Failed to create reservation");
          const data = await response.json();
          return [...current.filter((r) => r.id !== tempId), mapReservationFromApi(data)];
        },
        {
          optimisticData: (current: Reservation[] = []) => [...current, optimisticItem],
          rollbackOnError: true,
          revalidate: false,
        }
      );
      return newReservation as Reservation;
    } catch {
      return null;
    }
  };

  const deleteReservation = async (id: number): Promise<void> => {
    try {
      await mutate(
        async (current: Reservation[] = []) => {
          const response = await fetch(`/api/reservations?id=${id}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
          });
          if (!response.ok) throw new Error("Failed to delete reservation");
          return current.filter((r) => r.id !== id);
        },
        {
          optimisticData: (current: Reservation[] = []) =>
            current.filter((r) => r.id !== id),
          rollbackOnError: true,
          revalidate: false,
        }
      );
    } catch {
      // SWR rollback restores previous state
    }
  };

  const updateReservation = async (
    reservation: Reservation
  ): Promise<Reservation | null> => {
    const { id, ...updateData } = mapReservationToApi(reservation);
    try {
      await mutate(
        async (current: Reservation[] = []) => {
          const response = await fetch(`/api/reservations?id=${id}`, {
            method: "PATCH",
            body: JSON.stringify(updateData),
            headers: { "Content-Type": "application/json" },
          });
          if (!response.ok) throw new Error("Failed to update reservation");
          const data = await response.json();
          return current.map((r) => (r.id === id ? mapReservationFromApi(data) : r));
        },
        {
          optimisticData: (current: Reservation[] = []) =>
            current.map((r) => (r.id === id ? reservation : r)),
          rollbackOnError: true,
          revalidate: false,
        }
      );
      return reservation;
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
