"use client";

import useSWR from "swr";
import { BookingRequest } from "@/lib/booking-request/types";
import { fetcher } from "@/lib/fetcher";

const SWR_KEY = "/api/booking-requests";

// Map snake_case API response → camelCase frontend
function mapFromApi(raw: Record<string, unknown>): BookingRequest {
  return {
    id: raw.id as number,
    businessId: raw.business_id as string,
    clientName: raw.client_name as string,
    clientEmail: raw.client_email as string,
    clientPhone: raw.client_phone as string,
    employeeName: (raw.employee_name as string) || null,
    service: raw.service as string,
    requestedDate: raw.requested_date as string,
    status: raw.status as BookingRequest["status"],
    expiresAt: raw.expires_at as string,
    createdAt: raw.created_at as string,
  };
}

export function useBookingRequests() {
  const {
    data: raw = [],
    isLoading: loading,
    error,
    mutate,
  } = useSWR<Record<string, unknown>[]>(SWR_KEY, fetcher);

  const bookingRequests: BookingRequest[] = raw.map(mapFromApi);

  const acceptRequest = async (id: number): Promise<boolean> => {
    try {
      const response = await fetch(`/api/booking-requests/${id}/accept`, {
        method: "POST",
      });
      if (!response.ok) return false;
      await mutate();
      return true;
    } catch {
      return false;
    }
  };

  const rejectRequest = async (id: number, reason?: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/booking-requests/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      if (!response.ok) return false;
      await mutate();
      return true;
    } catch {
      return false;
    }
  };

  return {
    bookingRequests,
    loading,
    error,
    mutate,
    acceptRequest,
    rejectRequest,
  };
}
