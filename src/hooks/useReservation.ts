"use client";
import { useState } from "react";
import { Reservation } from "@/lib/reservation/types";
import { mapReservationFromApi } from "@/lib/utils";

export function useReservation() {
  const [reservationData, setReservationData] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getAllReservations: () => Promise<Reservation[]> = async (
    offset?: number,
    limit?: number
  ) => {
    try {
      if (!offset) offset = 0;
      if (!limit) limit = 100;
      setLoading(true);
      const response = await fetch(
        `/api/reservations?offset=${offset}&limit=${limit}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch reservations");
      }
      const data = await response.json();
      const reservationDataMapped = data.map(mapReservationFromApi);
      setReservationData(reservationDataMapped);
      return reservationData;
    } catch (error) {
      setError(error as Error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createReservation: (
    newReservation: Omit<Reservation, "id">
  ) => Promise<Reservation> = async (newReservation) => {
    try {
      setLoading(true);
      const response = await fetch("api/reservations", {
        method: "POST",
        body: JSON.stringify(newReservation),
      });
      if (!response.ok) {
        throw new Error("Failed to create reservation");
      }
      const data = await response.json();
      const createdReservation = mapReservationFromApi(data);
      return createdReservation;
    } catch (error) {
      setError(error as Error);
      return {} as Reservation;
    } finally {
      setLoading(false);
    }
  };

  const deleteReservation = async (id: number) => {
    try {
      setLoading(true);
      const response = await fetch(`api/reservations?id=${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to delete reservation");
      }
      const result = await response.json();
      return result;
    } catch (error) {
      setError(error as Error);
      return {} as Reservation;
    } finally {
      setLoading(false);
    }
  };

  const updateReservation = async (reservation: Reservation) => {
    try {
      setLoading(true);
      const { id, ...updateData } = reservation;
      const response = await fetch(`api/reservations?id=${id}`, {
        method: "PATCH",
        body: JSON.stringify(updateData),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to update reservation");
      }
      const result = await response.json();
      return result;
    } catch (error) {
      setError(error as Error);
      return {} as Reservation;
    } finally {
      setLoading(false);
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
