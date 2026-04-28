"use client";
import useSWR from "swr";
import { Employee } from "@/lib/employee/types";
import { fetcher } from "@/lib/fetcher";

const SWR_KEY = "/api/personal-management";

export function useEmployee() {
  const {
    data: employees = [],
    isLoading: loading,
    error,
  } = useSWR<Employee[]>(SWR_KEY, fetcher, {
    revalidateOnFocus: false,
  });

  const activeEmployees = employees.filter((e) => e.status === "active");

  return { employees, activeEmployees, loading, error };
}
